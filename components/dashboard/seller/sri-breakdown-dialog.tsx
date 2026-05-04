"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  getSellerSriBreakdown,
  type SellerSriBreakdown,
  type SriStatusColor,
} from "@/lib/api/seller-sri"
import { formatDistanceToNow } from "date-fns"

function pct01(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, v * 100))
}

function statusBadge(color: SriStatusColor): string {
  if (color === "GREEN") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
  if (color === "YELLOW") return "bg-amber-500/15 text-amber-200 border-amber-500/30"
  return "bg-red-500/15 text-red-200 border-red-500/30"
}

export function SriBreakdownDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SellerSriBreakdown | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSellerSriBreakdown()
      setData(res)
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message || "Failed to load breakdown")
      toast({
        title: "Could not load SRI breakdown",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (open && !data && !loading) {
      void load()
    }
  }, [open, data, loading, load])

  const calculatedAgo = useMemo(() => {
    if (!data?.lastSriCalculation) return null
    const d = new Date(data.lastSriCalculation)
    if (Number.isNaN(d.getTime())) return null
    return `Calculated ${formatDistanceToNow(d, { addSuffix: true })}`
  }, [data?.lastSriCalculation])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[96vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>SRI Breakdown</span>
            {data?.statusColor ? (
              <Badge variant="outline" className={statusBadge(data.statusColor)}>
                {data.statusColor}
              </Badge>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <div className="space-y-3 py-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : !data ? (
          <div className="py-6 text-sm text-muted-foreground">No breakdown data.</div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-sm text-muted-foreground">{calculatedAgo}</div>
              <div className="text-sm">
                Score: <span className="font-semibold text-foreground">{data.sriScore}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                  Components
                </div>
                <div className="space-y-3 text-sm">
                  <Row label="Fulfilment rate" value={`${pct01(data.components.fulfilmentRate).toFixed(0)}%`} />
                  <Row label="On-time delivery" value={`${pct01(data.components.onTimeDeliveryRate).toFixed(0)}%`} />
                  <Row
                    label="Defect rate (lower is better)"
                    value={`${pct01(data.components.defectRate).toFixed(1)}%`}
                  />
                  <Row label="Compliance score" value={`${pct01(data.components.complianceScore).toFixed(0)}%`} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                  Weights
                </div>
                <div className="space-y-3 text-sm">
                  <Row label="Fulfilment" value={`${(data.weights.fulfilment * 100).toFixed(0)}%`} />
                  <Row label="Delivery" value={`${(data.weights.delivery * 100).toFixed(0)}%`} />
                  <Row label="Defect" value={`${(data.weights.defect * 100).toFixed(0)}%`} />
                  <Row label="Compliance" value={`${(data.weights.compliance * 100).toFixed(0)}%`} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Advice
              </div>
              {data.advice?.length ? (
                <ul className="space-y-3">
                  {data.advice.map((a) => (
                    <li key={`${a.key}-${a.title}`} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                      <div className="font-medium text-foreground">{a.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{a.detail}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No advice items.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("text-muted-foreground")}>{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

