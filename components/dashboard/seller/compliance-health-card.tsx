"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  getComplianceHealth,
  type ComplianceHealthData,
  type ComplianceRag,
  type ComplianceHealthDocument,
} from "@/lib/api/seller-compliance-health"
import { formatDistanceToNow, format } from "date-fns"

function ragClass(rag: ComplianceRag) {
  if (rag === "GREEN") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
  if (rag === "AMBER") return "bg-amber-500/15 text-amber-200 border-amber-500/30"
  return "bg-red-500/15 text-red-200 border-red-500/30"
}

function docChip(docs: ComplianceHealthDocument[], key: "ZIMRA" | "TIN" | "KYC") {
  const d = docs.find((x) => x.key === key)
  return d?.statusRag ?? "RED"
}

export function ComplianceHealthCard({ onOpenUpload }: { onOpenUpload: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ComplianceHealthData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getComplianceHealth()
        if (!mounted) return
        setData(res)
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (!mounted) return
        setError(err.message || "Failed to load compliance health")
        toast({
          title: "Could not load compliance health",
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

  const nearest = data?.nearestExpiry ?? null
  const auditedAgo = useMemo(() => {
    const at = data?.auditScore?.auditedAt
    if (!at) return null
    const d = new Date(at)
    if (Number.isNaN(d.getTime())) return null
    return `Audited ${formatDistanceToNow(d, { addSuffix: true })}`
  }, [data?.auditScore?.auditedAt])

  const nearestLabel = useMemo(() => {
    if (!nearest) return "—"
    const d = new Date(nearest.expiryDate)
    if (Number.isNaN(d.getTime())) return "—"
    return `${format(d, "PP")} (in ${nearest.daysUntilExpiry} days)`
  }, [nearest])

  const expirySoon = nearest?.daysUntilExpiry != null ? nearest.daysUntilExpiry < 60 : false

  const docs = data?.documents || []
  const zimra = docChip(docs, "ZIMRA")
  const tin = docChip(docs, "TIN")
  const kyc = docChip(docs, "KYC")

  return (
    <div className="glass-card rounded-xl p-6 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Compliance Health</div>
          <div className="text-xs text-muted-foreground mt-1">
            Keep certificates current to avoid disruptions.
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-200 border-blue-500/30"
        >
          {data?.auditScore?.score ?? 0}/100
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : error ? (
        <div className="mt-4 text-sm text-destructive">{error}</div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className={ragClass(zimra)}>
              ZIMRA
            </Badge>
            <Badge variant="outline" className={ragClass(tin)}>
              TIN
            </Badge>
            <Badge variant="outline" className={ragClass(kyc)}>
              KYC
            </Badge>
          </div>

          <div
            className={cn(
              "mt-4 rounded-lg border border-border/70 bg-muted/20 p-3",
              expirySoon ? "border-amber-500/40 bg-amber-500/10" : null
            )}
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Nearest expiry date
            </div>
            <div className={cn("mt-1 text-sm font-medium", expirySoon ? "text-amber-100" : "text-foreground")}>
              {nearestLabel}
            </div>
            {nearest?.documentType ? (
              <div className="text-xs text-muted-foreground mt-1">
                Document: {nearest.documentType}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Audit score</div>
              <div className="mt-1 text-sm text-foreground">
                <span className="font-medium">{data?.auditScore?.score ?? 0}/100</span>
                {auditedAgo ? <span className="ml-2 text-xs text-muted-foreground">{auditedAgo}</span> : null}
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5">
            <Button type="button" onClick={onOpenUpload} className="gap-2">
              Upload/Update Documents
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

