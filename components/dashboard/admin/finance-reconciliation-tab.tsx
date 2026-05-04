"use client"

import { useCallback, useMemo, useState } from "react"
import { Loader2, Download, CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/hooks/use-toast"
import {
  getDailyReconciliation,
  getReconciliationWindow,
  reconciliationLinesToCsv,
  sortReconciliationLines,
  type DailyReconciliationData,
  type WindowReconciliationData,
} from "@/lib/api/admin-financial-reconciliation"
import { cn } from "@/lib/utils"

function todayYmd() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const MS_PER_DAY = 864e5

export function FinanceReconciliationTab() {
  const { toast } = useToast()
  const [dailyDate, setDailyDate] = useState(todayYmd())
  const [daily, setDaily] = useState<DailyReconciliationData | null>(null)
  const [dailyLoading, setDailyLoading] = useState(false)

  const [fromLocal, setFromLocal] = useState("")
  const [toLocal, setToLocal] = useState("")
  const [currency, setCurrency] = useState<string>("")
  const [windowData, setWindowData] = useState<WindowReconciliationData | null>(null)
  const [windowLoading, setWindowLoading] = useState(false)

  const loadDaily = useCallback(async () => {
    setDailyLoading(true)
    try {
      const d = await getDailyReconciliation(dailyDate || undefined)
      setDaily(d)
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: err.status === 403 ? "FinOps access required" : "Daily reconciliation failed",
        description: err.message,
        variant: "destructive",
      })
      setDaily(null)
    } finally {
      setDailyLoading(false)
    }
  }, [dailyDate, toast])

  const sortedWindowLines = useMemo(() => {
    if (!windowData?.lines?.length) return []
    return sortReconciliationLines(windowData.lines)
  }, [windowData])

  const loadWindow = useCallback(async () => {
    if (!fromLocal || !toLocal) {
      toast({ title: "Choose from and to date-times", variant: "destructive" })
      return
    }
    const from = new Date(fromLocal)
    const to = new Date(toLocal)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      toast({ title: "Invalid dates", variant: "destructive" })
      return
    }
    if (from.getTime() > to.getTime()) {
      toast({ title: "From must be ≤ to", variant: "destructive" })
      return
    }
    if (to.getTime() - from.getTime() > 31 * MS_PER_DAY) {
      toast({ title: "Window must not exceed 31 days", variant: "destructive" })
      return
    }
    setWindowLoading(true)
    try {
      const w = await getReconciliationWindow({
        from: from.toISOString(),
        to: to.toISOString(),
        currency: currency || undefined,
      })
      setWindowData(w)
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: err.status === 403 ? "FinOps access required" : "Window reconciliation failed",
        description: err.message,
        variant: "destructive",
      })
      setWindowData(null)
    } finally {
      setWindowLoading(false)
    }
  }, [fromLocal, toLocal, currency, toast])

  const exportWindowCsv = () => {
    if (!sortedWindowLines.length) return
    downloadCsv(`reconciliation-window-${Date.now()}.csv`, reconciliationLinesToCsv(sortedWindowLines))
  }

  return (
    <div className="space-y-8">
      <Card className="border-border/80 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Daily rollup</CardTitle>
              <CardDescription>
                Gateway fees, platform commission, and seller payouts for a calendar day (
                <span className="font-mono">paidAt</span> on completed payments).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label>Date</Label>
              <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="w-[200px]" />
            </div>
            <Button type="button" onClick={() => void loadDaily()} disabled={dailyLoading} className="gap-2">
              {dailyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Load
            </Button>
          </div>
          {daily ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Orders" value={String(daily.totalOrders)} />
              <Metric label="Gross revenue" value={fmtMoney(daily.grossRevenue)} />
              <Metric label="Platform commission" value={fmtMoney(daily.platformCommission)} />
              <Metric label="Gateway fees" value={fmtMoney(daily.gatewayFees)} />
              <Metric label="Seller payouts" value={fmtMoney(daily.sellerPayouts)} />
              <Metric label="Net revenue" value={fmtMoney(daily.netRevenue)} />
              <Metric label="Variance %" value={`${Number(daily.variancePercentage).toFixed(4)}%`} />
              <Metric
                label="Lines &gt; tolerance"
                value={`${daily.linesExceedingTolerance} / tol ${daily.tolerancePercent}%`}
                warn={daily.linesExceedingTolerance > 0}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/50">
        <CardHeader>
          <CardTitle>Auditable window</CardTitle>
          <CardDescription>
            Minute-level range up to 31 days. Rows sorted with tolerance breaches first, then gateway variance % (desc).
            Export CSV from the loaded lines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1.5">
              <Label>From (local)</Label>
              <Input type="datetime-local" value={fromLocal} onChange={(e) => setFromLocal(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>To (local)</Label>
              <Input type="datetime-local" value={toLocal} onChange={(e) => setToLocal(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <Select value={currency || "all"} onValueChange={(v) => setCurrency(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ZWL">ZWL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="button" onClick={() => void loadWindow()} disabled={windowLoading} className="gap-2">
                {windowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Run
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={exportWindowCsv} disabled={!sortedWindowLines.length}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-x-auto max-h-[min(70vh,720px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Comm Δ%</TableHead>
                  <TableHead className="text-right">Gw Δ%</TableHead>
                  <TableHead>Tolerance</TableHead>
                  <TableHead>Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWindowLines.map((line) => (
                  <TableRow
                    key={line.orderId}
                    className={cn(line.exceedsTolerance ? "bg-amber-500/10" : undefined)}
                  >
                    <TableCell className="font-mono text-xs">{line.orderNumber || line.orderId.slice(0, 10)}</TableCell>
                    <TableCell>{line.currency}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(line.paidAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtMoney(line.grossOrderTotal)}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(line.commissionVariancePct)}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(line.gatewayVariancePct)}</TableCell>
                    <TableCell>
                      {line.exceedsTolerance ? (
                        <span className="text-amber-600 dark:text-amber-300 text-xs font-medium">Exceeds</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">OK</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px] truncate" title={(line.flags || []).join(", ")}>
                      {(line.flags || []).join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {!sortedWindowLines.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      Run a window to load per-order lines.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-border/70 p-3", warn ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/20")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-foreground mt-1">{value}</div>
    </div>
  )
}

function fmtMoney(n: number) {
  if (n == null || Number.isNaN(n)) return "—"
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pct(n: number) {
  if (n == null || Number.isNaN(n)) return "—"
  return `${n.toFixed(4)}%`
}
