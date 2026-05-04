"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  approveSellerDocument,
  createComplianceAudit,
  getComplianceAuditSummary,
  getSellerDocuments,
  rejectSellerDocument,
  type ComplianceAuditSummary,
  type SellerDocument,
} from "@/lib/api/admin-seller-compliance"
import { cn } from "@/lib/utils"

function statusBadge(s: string) {
  if (s === "APPROVED") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
  if (s === "PENDING") return "bg-amber-500/15 text-amber-200 border-amber-500/30"
  if (s === "REJECTED") return "bg-red-500/15 text-red-200 border-red-500/30"
  if (s === "EXPIRED") return "bg-red-500/15 text-red-200 border-red-500/30"
  return "bg-muted/30 text-muted-foreground border-border/70"
}

function daysUntilExpiry(doc: SellerDocument): number | null {
  if (!doc.expiryDate) return null
  const d = new Date(doc.expiryDate)
  if (Number.isNaN(d.getTime())) return null
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function SellerComplianceDetailDialog({
  open,
  onOpenChange,
  sellerId,
  onAfterAction,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerId: string | null
  onAfterAction?: () => void
}) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<SellerDocument[]>([])
  const [audit, setAudit] = useState<ComplianceAuditSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [approvingDocId, setApprovingDocId] = useState<string | null>(null)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectDoc, setRejectDoc] = useState<SellerDocument | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const [score, setScore] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  const load = useCallback(async () => {
    if (!sellerId) return
    setLoading(true)
    try {
      const [d, a] = await Promise.all([
        getSellerDocuments(sellerId),
        getComplianceAuditSummary(sellerId, 10).catch(() => null),
      ])
      const sorted = [...d].sort((x, y) => {
        const ax = new Date(x.uploadedAt).getTime()
        const ay = new Date(y.uploadedAt).getTime()
        return (Number.isNaN(ay) ? 0 : ay) - (Number.isNaN(ax) ? 0 : ax)
      })
      setDocs(sorted)
      setAudit(a)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Could not load seller compliance", description: err.message, variant: "destructive" })
      setDocs([])
      setAudit(null)
    } finally {
      setLoading(false)
    }
  }, [sellerId, toast])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  const onApprove = async (doc: SellerDocument) => {
    setApprovingDocId(doc.id)
    try {
      await approveSellerDocument(doc.id)
      toast({ title: "Document approved" })
      await load()
      onAfterAction?.()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Approve failed", description: err.message, variant: "destructive" })
    } finally {
      setApprovingDocId(null)
    }
  }

  const onReject = async () => {
    if (!rejectDoc) return
    const r = rejectReason.trim()
    if (!r) {
      toast({ title: "Rejection reason is required", variant: "destructive" })
      return
    }
    setApprovingDocId(rejectDoc.id)
    try {
      await rejectSellerDocument(rejectDoc.id, r)
      toast({ title: "Document rejected" })
      setRejectOpen(false)
      setRejectDoc(null)
      setRejectReason("")
      await load()
      onAfterAction?.()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Reject failed", description: err.message, variant: "destructive" })
    } finally {
      setApprovingDocId(null)
    }
  }

  const onCreateAudit = async () => {
    if (!sellerId) return
    const n = Number(score)
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast({ title: "Score must be 0–100", variant: "destructive" })
      return
    }
    setApprovingDocId("__audit__")
    try {
      await createComplianceAudit(sellerId, { score: n, notes: notes.trim() || undefined })
      toast({ title: "Audit score recorded" })
      setScore("")
      setNotes("")
      await load()
      onAfterAction?.()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Could not save audit score", description: err.message, variant: "destructive" })
    } finally {
      setApprovingDocId(null)
    }
  }

  const sellerLabel = sellerId ? `${sellerId.slice(0, 8)}…` : "—"

  const expiringSoonCount = useMemo(() => {
    return docs.filter((d) => {
      const days = daysUntilExpiry(d)
      return days != null && days < 60 && days >= 0
    }).length
  }, [docs])

  /** Only the newest PENDING upload per documentType may be approved/rejected (one-by-one per type). */
  const latestPendingUploadedAtByType = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of docs) {
      if (String(d.status) !== "PENDING") continue
      const t = String(d.documentType)
      const ts = new Date(d.uploadedAt).getTime()
      if (Number.isNaN(ts)) continue
      const prev = map.get(t)
      if (prev == null || ts > prev) map.set(t, ts)
    }
    return map
  }, [docs])

  const canApproveOrReject = (d: SellerDocument) => {
    if (String(d.status) !== "PENDING") return false
    const t = String(d.documentType)
    const ts = new Date(d.uploadedAt).getTime()
    if (Number.isNaN(ts)) return false
    return latestPendingUploadedAtByType.get(t) === ts
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto w-[98vw] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-2">
              <span>Seller compliance</span>
              <span className="text-xs text-muted-foreground font-mono">Seller: {sellerLabel}</span>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Documents ({docs.length}){expiringSoonCount ? ` · ${expiringSoonCount} expiring <60d` : ""}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={!!approvingDocId}>
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2">
                  {docs.map((d) => {
                    const days = daysUntilExpiry(d)
                    const expSoon = days != null && days < 60 && days >= 0
                    return (
                      <div
                        key={`${d.id}-${d.uploadedAt}`}
                        className={cn(
                          "rounded-xl border border-border bg-card/50 p-4",
                          expSoon ? "border-amber-500/40 bg-amber-500/10" : null
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground">{d.documentType}</div>
                              <Badge variant="outline" className={statusBadge(String(d.status))}>
                                {String(d.status)}
                              </Badge>
                              {days != null ? (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    expSoon ? "border-amber-500/40 text-amber-100" : "border-border/70 text-muted-foreground"
                                  )}
                                >
                                  {days}d
                                </Badge>
                              ) : null}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Uploaded: {new Date(d.uploadedAt).toLocaleString()}
                              {d.expiryDate ? ` · Expiry: ${new Date(d.expiryDate).toLocaleDateString()}` : ""}
                            </div>
                            {d.rejectionReason ? (
                              <div className="mt-2 text-xs text-destructive">Rejected: {d.rejectionReason}</div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="gap-2">
                              <a href={d.fileUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                View
                              </a>
                            </Button>
                            {String(d.status) === "PENDING" ? (
                              canApproveOrReject(d) ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => void onApprove(d)}
                                    disabled={!!approvingDocId}
                                    className="gap-2"
                                  >
                                    {approvingDocId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Approve
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setRejectDoc(d)
                                      setRejectOpen(true)
                                    }}
                                    disabled={!!approvingDocId}
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Badge variant="outline" className="border-border/70 text-muted-foreground text-xs">
                                  Superseded pending upload — approve newest only
                                </Badge>
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {docs.length === 0 && (
                    <div className="text-sm text-muted-foreground">No documents found for this seller.</div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-foreground">Compliance audit score</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Latest:{" "}
                        <span className="text-foreground font-medium">
                          {audit?.latest?.score ?? 0}/100
                        </span>
                        {audit?.latest?.createdAt ? (
                          <span className="ml-2">
                            ({new Date(audit.latest.createdAt).toLocaleDateString()})
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div className="grid gap-1.5">
                      <Label>Score (0–100)</Label>
                      <Input
                        inputMode="numeric"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="86"
                        disabled={!!approvingDocId}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Quarterly compliance audit"
                        disabled={!!approvingDocId}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => void onCreateAudit()}
                      disabled={!!approvingDocId}
                      className="gap-2"
                    >
                      {approvingDocId === "__audit__" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Record audit score
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card/50 p-4">
                  <div className="text-sm font-medium text-foreground">Audit history</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {(audit?.history || []).slice(0, 10).map((h) => (
                      <div key={h.createdAt} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                        <span className="font-medium text-foreground tabular-nums">{h.score}</span>
                      </div>
                    ))}
                    {!audit?.history?.length && (
                      <div className="text-sm text-muted-foreground">No audit records yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(o) => {
          if (!o && approvingDocId) return
          setRejectOpen(o)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject document</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a clear reason. The seller will see it and can resubmit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label>Reason *</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} disabled={!!approvingDocId} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!approvingDocId}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={() => void onReject()} disabled={!!approvingDocId} className="gap-2">
              {approvingDocId === rejectDoc?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

