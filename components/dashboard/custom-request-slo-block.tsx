"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import type { CustomRequestSlo } from "@/lib/api/custom-product-request-types"
import type { CustomProductRequestStatus } from "@/lib/api/custom-product-request-types"

const FINAL: CustomProductRequestStatus[] = ["APPROVED", "REJECTED"]

interface CustomRequestSloBlockProps {
  slo: CustomRequestSlo | null | undefined
  status: string
  reviewDueAt: string | null | undefined
  className?: string
}

export function CustomRequestSloBlock({
  slo,
  status,
  reviewDueAt,
  className = "",
}: CustomRequestSloBlockProps) {
  const isFinal = FINAL.includes(status as CustomProductRequestStatus)
  const due = reviewDueAt || slo?.reviewDueAt
  const overdue = slo?.isSloOverdue === true
  const hours = slo?.hoursRemaining
  const breached = slo?.sloBreachedOnDecision === true

  return (
    <div
      className={`rounded-lg border border-border bg-muted/20 p-4 text-sm space-y-2 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">72h review</span>
        {overdue && !isFinal && (
          <Badge variant="destructive" className="text-xs">
            Overdue
          </Badge>
        )}
        {isFinal && breached && (
          <Badge variant="outline" className="text-xs border-amber-500/60 text-amber-700 dark:text-amber-400">
            Decision after SLO
          </Badge>
        )}
      </div>
      {due && (
        <p className="text-muted-foreground">
          Due by{" "}
          <time dateTime={due}>
            {format(new Date(due), "PPpp")}
          </time>
        </p>
      )}
      {!isFinal && hours != null && (
        <p className="text-muted-foreground">
          ~{Number(hours).toFixed(1)} hours remaining
        </p>
      )}
      {isFinal && !breached && due && (
        <p className="text-xs text-muted-foreground">Closed within the review window</p>
      )}
    </div>
  )
}

export function CustomRequestFileLinks(props: {
  imageUrls: string[]
  specSheetUrl: string | null | undefined
  supplierDocUrls: string[] | null | undefined
}) {
  const { imageUrls, specSheetUrl, supplierDocUrls = [] } = props
  return (
    <div className="space-y-4">
      {imageUrls?.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Product images</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {imageUrls.map((url, i) => (
              <a
                key={`${url}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square rounded-md border border-border overflow-hidden bg-muted/30"
              >
                <img
                  src={url}
                  alt={`Product ${i + 1}`}
                  className="h-full w-full object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      {specSheetUrl && (
        <p>
          <a
            href={specSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            View OEM spec (PDF)
          </a>
        </p>
      )}
      {supplierDocUrls && supplierDocUrls.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Supplier documents</p>
          <ul className="list-disc pl-5 space-y-1">
            {supplierDocUrls.map((url, i) => (
              <li key={`${url}-${i}`}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  Supplier document {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/90 text-white"
    case "MORE_INFO_NEEDED":
      return "bg-blue-500/90 text-white"
    case "APPROVED":
      return "bg-green-600/90 text-white"
    case "REJECTED":
      return "bg-destructive/90 text-white"
    default:
      return "bg-muted text-foreground"
  }
}
