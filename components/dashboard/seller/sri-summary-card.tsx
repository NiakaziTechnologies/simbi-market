"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  getSellerSriSummary,
  type SellerSriSummary,
  type SriStatusColor,
} from "@/lib/api/seller-sri"
import { formatDistanceToNow } from "date-fns"

function statusToColor(status: SriStatusColor): { ring: string; badge: string; label: string } {
  if (status === "GREEN") {
    return {
      ring: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
      label: "Good standing",
    }
  }
  if (status === "YELLOW") {
    return {
      ring: "text-amber-400",
      badge: "bg-amber-500/15 text-amber-200 border-amber-500/30",
      label: "Needs attention",
    }
  }
  return {
    ring: "text-red-400",
    badge: "bg-red-500/15 text-red-200 border-red-500/30",
    label: "At risk",
  }
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
}

function Gauge({ score, status }: { score: number; status: SriStatusColor }) {
  const pct = clamp01(score / 100)
  const c = statusToColor(status)
  const stroke = 10
  const r = 42
  const circumference = 2 * Math.PI * r
  const dash = circumference * pct
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(-90 60 60)"
          className={cn(c.ring)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-light text-foreground tabular-nums">{Math.round(score)}</div>
        <div className="text-[11px] text-muted-foreground">/ 100</div>
      </div>
    </div>
  )
}

export function SriSummaryCard({
  onViewBreakdown,
}: {
  onViewBreakdown: () => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SellerSriSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getSellerSriSummary()
        if (!mounted) return
        setData(res)
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (!mounted) return
        setError(err.message || "Failed to load SRI")
        toast({
          title: "Could not load SRI",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [toast])

  const calculatedAgo = useMemo(() => {
    if (!data?.lastSriCalculation) return null
    const d = new Date(data.lastSriCalculation)
    if (Number.isNaN(d.getTime())) return null
    return `Calculated ${formatDistanceToNow(d, { addSuffix: true })}`
  }, [data?.lastSriCalculation])

  const status = data?.statusColor ?? "GREEN"
  const theme = statusToColor(status)

  return (
    <div className="glass-card rounded-xl p-6 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">SRI score</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={theme.badge}>
              {status}
            </Badge>
            <span className="text-xs text-muted-foreground">{theme.label}</span>
          </div>
          {calculatedAgo && <div className="text-xs text-muted-foreground">{calculatedAgo}</div>}
        </div>

        {loading ? (
          <div className="h-28 w-28 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : data ? (
          <Gauge score={data.sriScore} status={status} />
        ) : (
          <div className="h-28 w-28 flex items-center justify-center text-muted-foreground">
            —
          </div>
        )}
      </div>

      {data?.warning && status !== "GREEN" && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-300 mt-0.5" />
            <div className="text-sm text-amber-100">{data.warning}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={onViewBreakdown} disabled={loading || !data}>
          View SRI Breakdown
        </Button>
      </div>
    </div>
  )
}

