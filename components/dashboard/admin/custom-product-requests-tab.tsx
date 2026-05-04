"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { statusBadgeClass } from "@/components/dashboard/custom-request-slo-block"
import { AdminCustomRequestDetailView } from "@/components/dashboard/admin/admin-custom-request-detail-view"
import {
  getAdminCustomProductRequestStats,
  listAdminCustomProductRequests,
  type CustomProductRequestAdmin,
} from "@/lib/api/admin-custom-product-requests"
import { useToast } from "@/hooks/use-toast"

const STATUSES = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "MORE_INFO_NEEDED", label: "More info" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const

export function AdminCustomProductRequestsTab() {
  const { toast } = useToast()
  const [rows, setRows] = useState<CustomProductRequestAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sellerId, setSellerId] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const limit = 20

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const [listRes, statsRes] = await Promise.all([
          listAdminCustomProductRequests({
            overdue: overdueOnly ? true : undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            sellerId: sellerId.trim() || undefined,
            page,
            limit,
          }),
          getAdminCustomProductRequestStats().catch(() => ({ success: false })),
        ])
        if (statsRes.success && statsRes.data) setStats(statsRes.data)
        if (listRes.success === false) {
          throw new Error(listRes.message || "Could not load queue")
        }
        setRows(Array.isArray(listRes.data) ? listRes.data : [])
        const p = listRes.pagination
        if (p) {
          setTotalPages(p.totalPages || 1)
          setTotal(p.total)
        } else {
          setTotalPages(1)
          setTotal(listRes.data.length)
        }
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (!silent) {
          toast({
            title: "Could not load custom requests",
            description: err.message,
            variant: "destructive",
          })
        }
        setRows([])
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [toast, overdueOnly, statusFilter, sellerId, page]
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const t = window.setInterval(() => void load(true), 30000)
    return () => window.clearInterval(t)
  }, [load])

  return (
    <div className="space-y-6">
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats).map(([k, v]) => (
            <Card key={k}>
              <CardHeader className="py-2 pb-0">
                <CardTitle className="text-sm font-normal text-muted-foreground capitalize">
                  {k.replace(/([A-Z])/g, " $1").trim()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-light">{v}</CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:flex-wrap">
        <div className="flex items-center gap-2">
          <Switch
            id="cpr-overdue"
            checked={overdueOnly}
            onCheckedChange={(v) => {
              setOverdueOnly(v)
              setPage(1)
            }}
          />
          <Label htmlFor="cpr-overdue" className="text-sm">
            Overdue only (open)
          </Label>
        </div>
        <div className="w-full sm:w-44">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Label className="text-xs text-muted-foreground">Seller ID (optional)</Label>
          <Input
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            placeholder="UUID"
            className="font-mono text-xs"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setPage(1)
            void load()
          }}
        >
          Apply filters
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total} result(s)</p>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">SLO</TableHead>
                  <TableHead className="w-[90px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {r.productName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {(r.seller as { businessName?: string })?.businessName || r.seller?.email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass(r.status)}>{r.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {r.slo?.isSloOverdue && r.status === "PENDING" ? (
                        <span className="text-destructive">Overdue</span>
                      ) : r.slo?.hoursRemaining != null ? (
                        `${Number(r.slo.hoursRemaining).toFixed(1)}h left`
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailId(r.id)}
                      >
                        Open
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

      <Dialog
        open={!!detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto w-[98vw] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Custom product request</DialogTitle>
          </DialogHeader>
          {detailId ? (
            <AdminCustomRequestDetailView
              requestId={detailId}
              onClose={() => setDetailId(null)}
              onActionComplete={() => void load(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
