"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CustomRequestSloBlock,
  CustomRequestFileLinks,
  statusBadgeClass,
} from "@/components/dashboard/custom-request-slo-block"
import { CustomProductRequestForm } from "@/components/dashboard/seller/custom-product-request-form"
import {
  getCustomProductRequest,
  type CustomProductRequestSeller,
} from "@/lib/api/seller-custom-product-requests"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function SellerCustomRequestDetailView({
  requestId: id,
  onAfterResubmit,
  onClose,
  className,
}: {
  requestId: string
  onAfterResubmit?: () => void
  /** When set (e.g. list opened as modal), “Back” closes the dialog instead of navigating. */
  onClose?: () => void
  className?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [row, setRow] = useState<CustomProductRequestSeller | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await getCustomProductRequest(id)
      if (!res.success || !res.data) throw new Error(res.message || "Not found")
      setRow(res.data)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({
        title: "Could not load request",
        description: err.message,
        variant: "destructive",
      })
      setRow(null)
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !row) {
    return (
      <div className={cn("flex justify-center py-12 text-muted-foreground gap-2", className)}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    )
  }

  if (!id || !row) {
    return (
      <div className={cn("space-y-4 py-6 text-center", className)}>
        <p className="text-muted-foreground">Request not found.</p>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        {!onClose && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/seller/inventory/custom-requests">Back to list</Link>
          </Button>
        )}
      </div>
    )
  }

  const created = row.createdProduct as { id?: string; masterProductId?: string } | null | undefined
  const masterLink =
    created?.id || created?.masterProductId
      ? String(created.id || created.masterProductId)
      : null

  return (
    <div className={cn("space-y-4 sm:space-y-5 max-w-3xl w-full", className)}>
      <div className="flex items-center gap-2">
        {onClose ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
            <Link href="/dashboard/seller/inventory/custom-requests">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-2xl font-light text-foreground pr-2">{row.productName}</h2>
        <Badge className={statusBadgeClass(row.status)}>{row.status.replace(/_/g, " ")}</Badge>
      </div>

      <CustomRequestSloBlock
        slo={row.slo}
        status={row.status}
        reviewDueAt={row.reviewDueAt}
      />

      {row.status === "APPROVED" && masterLink && (
        <p className="text-sm text-muted-foreground">
          Master product:{" "}
          <Link
            href={`/parts/${encodeURIComponent(masterLink)}`}
            className="font-mono text-accent hover:underline"
          >
            {masterLink}
          </Link>{" "}
          <span className="text-xs">(catalog)</span>
        </p>
      )}

      {row.status === "REJECTED" && (row.rejectionReason || row.adminNotes) && (
        <Card className="border-destructive/30">
          <CardHeader className="py-2 sm:py-3">
            <CardTitle className="text-sm sm:text-base text-destructive">Rejection / notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {row.rejectionReason || row.adminNotes}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-medium">Product details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Category:</span> {row.category}
          </p>
          <p>
            <span className="text-muted-foreground">Make / model:</span> {row.make} {row.model}
          </p>
          {row.year != null && (
            <p>
              <span className="text-muted-foreground">Year:</span> {row.year}
            </p>
          )}
          {row.partCode && (
            <p>
              <span className="text-muted-foreground">Part code:</span> {row.partCode}
            </p>
          )}
          {row.description && (
            <p>
              <span className="text-muted-foreground">Description:</span> {row.description}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-medium">Files</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomRequestFileLinks
            imageUrls={row.imageUrls || []}
            specSheetUrl={row.specSheetUrl}
            supplierDocUrls={row.supplierDocUrls || []}
          />
        </CardContent>
      </Card>

      {row.status === "MORE_INFO_NEEDED" && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-medium">Resubmit</h3>
            {row.adminNotes && (
              <p className="text-sm text-muted-foreground border rounded-lg p-3 bg-muted/20">
                <span className="font-medium text-foreground">From admin: </span>
                {row.adminNotes}
              </p>
            )}
            <CustomProductRequestForm
              mode="resubmit"
              requestId={id}
              initialText={{
                productName: row.productName,
                category: row.category,
                make: row.make,
                model: row.model,
                year: row.year ?? null,
                partCode: row.partCode ?? "",
                description: row.description ?? "",
              }}
              onSuccess={() => {
                toast({ title: "Resubmitted successfully" })
                void load()
                onAfterResubmit?.()
                router.refresh()
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
