"use client"

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  listFinancialPartners,
  listLoanApplications,
  type AdminLoanApplicationRow,
  type FinancialPartnerSummary,
} from "@/lib/api/admin-financial-partners"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

export function LoanApplicationsTab() {
  const { toast } = useToast()
  const [partners, setPartners] = useState<FinancialPartnerSummary[]>([])
  const [partnerId, setPartnerId] = useState<string>("")
  const [statusDraft, setStatusDraft] = useState("")
  const [appliedStatus, setAppliedStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<AdminLoanApplicationRow[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })

  useEffect(() => {
    listFinancialPartners()
      .then((r) => {
        if (r.success && Array.isArray(r.data)) setPartners(r.data)
      })
      .catch(() => setPartners([]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listLoanApplications({
        partnerId: partnerId || undefined,
        status: appliedStatus.trim() || undefined,
        page,
        limit,
      })
      if (!res.success || !Array.isArray(res.data)) {
        throw new Error(res.message || "Invalid response")
      }
      setRows(res.data)
      setPagination(res.pagination)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({
        title: "Could not load applications",
        description: err.message || "Check admin API loan-applications",
        variant: "destructive",
      })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [toast, partnerId, appliedStatus, page, limit])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-light">
        Paginated loan applications across sellers (ops / support). Filter by partner or status.
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-2 min-w-[200px]">
          <Label>Partner</Label>
          <Select
            value={partnerId || "all"}
            onValueChange={(v) => {
              setPartnerId(v === "all" ? "" : v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All partners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All partners</SelectItem>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 min-w-[160px]">
          <Label htmlFor="la-status">Status</Label>
          <Input
            id="la-status"
            placeholder="e.g. UNDER_REVIEW"
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setAppliedStatus(statusDraft.trim())
            setPage(1)
          }}
        >
          Apply filters
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">No applications match.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs max-w-[120px] truncate">{r.id}</TableCell>
                  <TableCell>
                    <div className="text-sm">{r.partner?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.partner?.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.seller?.businessName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.seller?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{r.status}</TableCell>
                  <TableCell className="text-sm">
                    {r.requestedAmount != null ? `$${Number(r.requestedAmount).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
