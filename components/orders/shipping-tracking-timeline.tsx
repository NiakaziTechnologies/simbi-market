"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import type { OrderShippingTrackingEvent } from "@/lib/api/orders"
import { cn } from "@/lib/utils"

function displayStatus(standardStatus: string): string {
  if (standardStatus === "FAILED_DELIVERY") return "Delivery exception"
  return standardStatus.replace(/_/g, " ")
}

export function ShippingTrackingTimeline({ events }: { events: OrderShippingTrackingEvent[] }) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [events]
  )

  if (!sorted.length) {
    return <p className="text-sm text-muted-foreground">No tracking events yet.</p>
  }

  return (
    <ol className="relative border-s border-border ms-3 space-y-6 py-1">
      {sorted.map((ev, i) => (
        <li key={`${ev.createdAt}-${i}`} className="ms-6">
          <span className="absolute -start-1.5 mt-1.5 flex h-3 w-3 rounded-full border border-background bg-accent" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {displayStatus(String(ev.standardStatus))}
            </Badge>
            {ev.source ? (
              <Badge variant="secondary" className="text-[10px] uppercase">
                {ev.source}
              </Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-sm text-foreground mt-1">{ev.statusLabel}</p>
          {ev.location ? (
            <p className="text-xs text-muted-foreground mt-0.5">{ev.location}</p>
          ) : null}
          {ev.notes ? (
            <p className={cn("text-xs mt-1", ev.standardStatus === "FAILED_DELIVERY" ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground")}>
              {ev.notes}
            </p>
          ) : null}
          {ev.rawStatus && ev.rawStatus !== ev.statusLabel ? (
            <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">Raw: {ev.rawStatus}</p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
