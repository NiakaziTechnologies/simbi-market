"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  getFulfilmentQueue,
  type FulfilmentQueueData,
} from "@/lib/api/seller-fulfilment-queue"
import { formatDistanceToNow } from "date-fns"

function ageLabel(createdAt: string): string {
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return ""
  return formatDistanceToNow(d, { addSuffix: true })
}

export function FulfilmentQueueCard({
  href = "/dashboard/seller/orders",
  previewLimit = 6,
}: {
  href?: string
  previewLimit?: number
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FulfilmentQueueData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getFulfilmentQueue(previewLimit)
        if (!mounted) return
        setData(res)
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (!mounted) return
        setError(err.message || "Failed to load fulfilment queue")
        toast({
          title: "Could not load fulfilment queue",
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
  }, [toast, previewLimit])

  const preview = useMemo(() => (data?.preview || []).slice(0, previewLimit), [data?.preview, previewLimit])

  return (
    <div className="glass-card rounded-xl p-6 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Fulfilment queue</div>
          <div className="text-xs text-muted-foreground mt-1">
            Orders that need action to avoid delays.
          </div>
        </div>
        {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : null}
      </div>

      {error ? (
        <div className="mt-4 text-sm text-destructive">{error}</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Metric
            label="New Orders (24h)"
            value={data?.newOrders24hCount ?? 0}
          />
          <Metric
            label="Pending Shipment (48h+)"
            value={data?.pendingShipmentOver48hCount ?? 0}
            danger={(data?.pendingShipmentOver48hCount ?? 0) > 0}
          />
          <Metric
            label="Pending Payout"
            value={data?.pendingPayoutCount ?? 0}
          />
        </div>
      )}

      {preview.length > 0 && !loading && !error && (
        <div className="mt-5 rounded-lg border border-border/70 bg-muted/20 p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Preview
          </div>
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {preview.map((p) => {
              const overdue = Number(p.ageHours) > 48
              return (
                <li
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-2 py-1.5",
                    overdue ? "bg-destructive/10" : "bg-background/30"
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{p.orderNumber}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] py-0 px-1.5",
                          overdue
                            ? "border-destructive/40 text-destructive"
                            : "border-border/70 text-muted-foreground"
                        )}
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <div className={cn("text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
                      {overdue ? `Age ${p.ageHours.toFixed(1)}h (48h+)` : ageLabel(p.createdAt)}
                    </div>
                  </div>
                  <span className={cn("text-xs tabular-nums", overdue ? "text-destructive" : "text-muted-foreground")}>
                    {p.ageHours.toFixed(1)}h
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <Button asChild variant="secondary" className="gap-2">
          <Link href={href}>
            View orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-border/70 bg-muted/20 p-3", danger ? "border-destructive/40" : null)}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-light tabular-nums", danger ? "text-destructive" : "text-foreground")}>
        {value}
      </div>
    </div>
  )
}

