"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { statusBadgeClass } from "@/components/dashboard/custom-request-slo-block"
import { CustomProductRequestForm } from "@/components/dashboard/seller/custom-product-request-form"
import { SellerCustomRequestDetailView } from "@/components/dashboard/seller/seller-custom-request-detail-view"
import {
  listCustomProductRequests,
  type CustomProductRequestSeller,
} from "@/lib/api/seller-custom-product-requests"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const STATUS_FILTER = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "MORE_INFO_NEEDED", label: "More info needed" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const

export default function SellerCustomRequestsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<CustomProductRequestSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const res = await listCustomProductRequests({
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          limit,
        })
        if (res.success === false) {
          throw new Error(res.message || "Could not load requests")
        }
        setRows(Array.isArray(res.data) ? res.data : [])
        const p = res.pagination
        if (p) {
          setTotalPages(p.totalPages || 1)
          setTotal(p.total)
        } else {
          setTotalPages(1)
          setTotal(res.data.length)
        }
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (!silent) {
          toast({
            title: "Could not load requests",
            description: err.message,
            variant: "destructive",
          })
        }
        setRows([])
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [toast, statusFilter, page]
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const t = window.setInterval(() => void load(true), 12000)
    return () => window.clearInterval(t)
  }, [load])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-light text-foreground">Custom product requests</h2>
          <p className="text-sm text-muted-foreground">
            Request new master parts with images and documentation. 72h review target.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New request
        </Button>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {total} request{total === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center text-muted-foreground">
          <p className="mb-4">No requests yet.</p>
          <Button onClick={() => setDialogOpen(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first request
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">SLO</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {r.productName}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass(r.status)}>{r.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[220px]">
                      {r.slo && (
                        <div className="space-y-0.5">
                          {(() => {
                            const raw = r.reviewDueAt || r.slo.reviewDueAt
                            if (!raw) return null
                            const d = new Date(raw)
                            if (Number.isNaN(d.getTime())) return null
                            return (
                              <div className="line-clamp-1">
                                Due: {format(d, "PPp")}
                              </div>
                            )
                          })()}
                          <div>
                            {r.slo.isSloOverdue &&
                              (r.status === "PENDING" || r.status === "MORE_INFO_NEEDED") && (
                                <span className="text-destructive font-medium">Overdue — </span>
                              )}
                            {r.slo.hoursRemaining != null
                              ? `${Number(r.slo.hoursRemaining).toFixed(1)}h left`
                              : "—"}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailId(r.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto w-[98vw] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>New custom product request</DialogTitle>
          </DialogHeader>
          <CustomProductRequestForm
            mode="create"
            onSuccess={() => {
              setDialogOpen(false)
              if (page !== 1) {
                setPage(1)
              } else {
                void load(false)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[98vw] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request details</DialogTitle>
          </DialogHeader>
          {detailId ? (
            <SellerCustomRequestDetailView
              requestId={detailId}
              onClose={() => setDetailId(null)}
              onAfterResubmit={() => void load(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
