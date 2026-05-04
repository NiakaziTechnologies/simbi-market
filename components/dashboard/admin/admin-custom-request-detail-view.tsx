"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CustomRequestSloBlock,
  CustomRequestFileLinks,
  statusBadgeClass,
} from "@/components/dashboard/custom-request-slo-block"
import {
  approveCustomProductRequest,
  getAdminCustomProductRequest,
  rejectCustomProductRequest,
  requestMoreInfoCustomProduct,
  verifyCounterfeitDocumentation,
  type CustomProductRequestAdmin,
} from "@/lib/api/admin-custom-product-requests"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const productsTabHref = "/dashboard/admin/products?tab=custom-requests"

export function AdminCustomRequestDetailView({
  requestId: id,
  onClose,
  onActionComplete,
  className,
}: {
  requestId: string
  onClose?: () => void
  onActionComplete?: () => void
  className?: string
}) {
  const { toast } = useToast()
  const [row, setRow] = useState<CustomProductRequestAdmin | null>(null)
  const [loading, setLoading] = useState(true)
  const [openVerify, setOpenVerify] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openInfo, setOpenInfo] = useState(false)
  const [notesVerify, setNotesVerify] = useState("")
  const [notesApprove, setNotesApprove] = useState("")
  const [reasonReject, setReasonReject] = useState("")
  const [notesInfo, setNotesInfo] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await getAdminCustomProductRequest(id)
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

  const canAct = row?.status === "PENDING"
  const verified = row?.counterfeitCheckVerified === true

  const errPayload = (e: unknown) => {
    const err = e as { message?: string; data?: { message?: string } }
    return err.data?.message || err.message || "Request failed"
  }

  const afterMutation = async () => {
    await load()
    onActionComplete?.()
  }

  const onVerify = async () => {
    if (!id || !notesVerify.trim()) {
      toast({ title: "Notes are required for audit", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await verifyCounterfeitDocumentation(id, { notes: notesVerify.trim() })
      if (!res.success) throw new Error(res.message)
      toast({ title: "Documentation verified" })
      setOpenVerify(false)
      setNotesVerify("")
      await afterMutation()
    } catch (e) {
      toast({ title: errPayload(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const onApprove = async () => {
    if (!id) return
    setSaving(true)
    try {
      const res = await approveCustomProductRequest(
        id,
        notesApprove.trim() ? { adminNotes: notesApprove.trim() } : {}
      )
      if (!res.success) throw new Error(res.message)
      toast({ title: "Approved" })
      setOpenApprove(false)
      setNotesApprove("")
      await afterMutation()
    } catch (e) {
      toast({ title: errPayload(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const onReject = async () => {
    if (!id) return
    const t = reasonReject.trim()
    if (!t) {
      toast({ title: "A reason is required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await rejectCustomProductRequest(id, { rejectionReason: t })
      if (!res.success) throw new Error(res.message)
      toast({ title: "Rejected" })
      setOpenReject(false)
      setReasonReject("")
      await afterMutation()
    } catch (e) {
      toast({ title: errPayload(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const onRequestInfo = async () => {
    if (!id) return
    if (!notesInfo.trim()) {
      toast({ title: "Message to seller is required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await requestMoreInfoCustomProduct(id, { adminNotes: notesInfo.trim() })
      if (!res.success) throw new Error(res.message)
      toast({ title: "Requested more information" })
      setOpenInfo(false)
      setNotesInfo("")
      await afterMutation()
    } catch (e) {
      toast({ title: errPayload(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !row) {
    return (
      <div className={cn("flex justify-center py-12 gap-2 text-muted-foreground", className)}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    )
  }

  if (!row || !id) {
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
            <Link href={productsTabHref}>Back to products</Link>
          </Button>
        )}
      </div>
    )
  }

  const s = row.seller

  return (
    <div className={cn("space-y-4 sm:space-y-5 max-w-4xl w-full", className)}>
      <div className="flex items-center gap-2">
        {onClose ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to queue
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
            <Link href={productsTabHref}>
              <ArrowLeft className="h-4 w-4" />
              Products
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-2xl font-light pr-2">{row.productName}</h2>
        <Badge className={statusBadgeClass(row.status)}>{row.status.replace(/_/g, " ")}</Badge>
      </div>

      <CustomRequestSloBlock slo={row.slo} status={row.status} reviewDueAt={row.reviewDueAt} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Seller</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          {s && (
            <>
              {typeof (s as { businessName?: string }).businessName === "string" && (
                <p>
                  <span className="text-foreground font-medium">Business: </span>
                  {(s as { businessName: string }).businessName}
                </p>
              )}
              {s.email && (
                <p>
                  <span className="text-foreground font-medium">Email: </span>
                  {s.email}
                </p>
              )}
              {s.sri != null && (
                <p>
                  <span className="text-foreground font-medium">SRI: </span>
                  {String(s.sri)}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Product</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>Category: {row.category}</p>
          <p>
            Make / model: {row.make} {row.model}
          </p>
          {row.year != null && <p>Year: {row.year}</p>}
          {row.partCode && <p>Part code: {row.partCode}</p>}
          {row.description && <p>Description: {row.description}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Files</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomRequestFileLinks
            imageUrls={row.imageUrls || []}
            specSheetUrl={row.specSheetUrl}
            supplierDocUrls={row.supplierDocUrls || []}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Counterfeit / documentation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            Verified:{" "}
            <span className="text-foreground">
              {row.counterfeitCheckVerified ? "Yes" : "No"}
            </span>
          </p>
          {row.counterfeitCheckNotes && <p>Notes: {row.counterfeitCheckNotes}</p>}
          {row.counterfeitCheckVerifiedAt && (
            <p>At: {new Date(row.counterfeitCheckVerifiedAt).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      {row.adminNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Admin notes (on request)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{row.adminNotes}</CardContent>
        </Card>
      )}

      {row.status === "MORE_INFO_NEEDED" && (
        <p className="text-sm text-muted-foreground border border-border rounded-lg p-4 bg-muted/20">
          Waiting for the seller to resubmit. You can review again once the status returns to{" "}
          <strong>PENDING</strong>.
        </p>
      )}

      {canAct && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => setOpenVerify(true)}
          >
            1. Verify documentation
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  onClick={() => setOpenApprove(true)}
                  disabled={!verified || saving}
                >
                  2. Approve
                </Button>
              </span>
            </TooltipTrigger>
            {!verified && (
              <TooltipContent>Complete documentation verification first</TooltipContent>
            )}
          </Tooltip>

          <Button
            type="button"
            variant="destructive"
            disabled={saving}
            onClick={() => setOpenReject(true)}
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setOpenInfo(true)}
          >
            Request more information
          </Button>
        </div>
      )}

      <Dialog
        open={openVerify}
        onOpenChange={(open) => {
          if (open) setOpenVerify(true)
          else if (!saving) setOpenVerify(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify supplier documentation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Audit notes (required)</Label>
            <Textarea
              value={notesVerify}
              onChange={(e) => setNotesVerify(e.target.value)}
              rows={4}
              placeholder="What was checked (free text, required for audit)"
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenVerify(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={onVerify}
              disabled={saving || !notesVerify.trim()}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Confirm verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openApprove}
        onOpenChange={(open) => {
          if (open) setOpenApprove(true)
          else if (!saving) setOpenApprove(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve and create master product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Admin notes (optional)</Label>
            <Textarea
              value={notesApprove}
              onChange={(e) => setNotesApprove(e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenApprove(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={onApprove}
              disabled={saving || !verified}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Approving…
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openReject}
        onOpenChange={(open) => {
          if (open) setOpenReject(true)
          else if (!saving) setOpenReject(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Reason (required)</Label>
            <Textarea
              value={reasonReject}
              onChange={(e) => setReasonReject(e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReject(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onReject}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Rejecting…
                </>
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openInfo}
        onOpenChange={(open) => {
          if (open) setOpenInfo(true)
          else if (!saving) setOpenInfo(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request more information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Message to seller (required)</Label>
            <Textarea
              value={notesInfo}
              onChange={(e) => setNotesInfo(e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenInfo(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={onRequestInfo} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
