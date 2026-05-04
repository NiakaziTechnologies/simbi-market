"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Loader2, RefreshCw, ShieldAlert, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import {
  canFlagSuspectedFraud,
  hrefForAlertEntity,
  isFraudClassAlert,
  tierSortOrder,
} from "@/lib/auth/admin-rbac"
import {
  acknowledgeAdminAlert,
  isForbiddenAlertAction,
  listAdminDashboardAlerts,
  resolveAdminAlert,
  type AdminAlert,
  type AdminAlertStatus,
  type AdminAlertTier,
} from "@/lib/api/admin-dashboard-alerts"
import { postSuspectedFraud } from "@/lib/api/admin-security-fraud"
import { cn } from "@/lib/utils"

function tierBadgeClass(tier: string) {
  if (tier === "CRITICAL") return "bg-red-600/20 text-red-200 border-red-500/40"
  if (tier === "HIGH") return "bg-amber-500/20 text-amber-100 border-amber-500/40"
  if (tier === "LOW") return "bg-slate-500/15 text-slate-200 border-border/70"
  return "bg-muted/30 text-muted-foreground border-border/70"
}

function sortAlertsDesc(a: AdminAlert, b: AdminAlert) {
  const ta = tierSortOrder(String(a.tier))
  const tb = tierSortOrder(String(b.tier))
  if (ta !== tb) return ta - tb
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export function AdminAlertsInbox() {
  const { toast } = useToast()
  const { user } = useAuth()
  const showFraud = canFlagSuspectedFraud(user?.adminRole)

  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<AdminAlert | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [actionId, setActionId] = useState<string | null>(null)

  const [fraudOpen, setFraudOpen] = useState(false)
  const [fraudNotes, setFraudNotes] = useState("")
  const [fraudSellerId, setFraudSellerId] = useState("")
  const [fraudOrderId, setFraudOrderId] = useState("")

  const alertsRef = useRef<AdminAlert[]>([])
  alertsRef.current = alerts

  const mergeById = useCallback((prev: AdminAlert[], incoming: AdminAlert[]) => {
    const map = new Map<string, AdminAlert>()
    for (const a of prev) map.set(a.id, a)
    for (const a of incoming) map.set(a.id, a)
    return [...map.values()].sort(sortAlertsDesc)
  }, [])

  const fullReload = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listAdminDashboardAlerts({
        tier: tierFilter === "all" ? undefined : (tierFilter as AdminAlertTier),
        status: statusFilter === "all" ? undefined : (statusFilter as AdminAlertStatus),
      })
      setAlerts(list.sort(sortAlertsDesc))
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Could not load alerts", description: err.message, variant: "destructive" })
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [tierFilter, statusFilter, toast])

  useEffect(() => {
    void fullReload()
  }, [fullReload])

  useEffect(() => {
    const tick = async () => {
      const cur = alertsRef.current
      if (cur.length === 0) return
      const newest = [...cur].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
      if (!newest) return
      setPolling(true)
      try {
        const delta = await listAdminDashboardAlerts({
          tier: tierFilter === "all" ? undefined : (tierFilter as AdminAlertTier),
          status: statusFilter === "all" ? undefined : (statusFilter as AdminAlertStatus),
          afterId: newest.id,
        })
        if (delta.length) setAlerts((prev) => mergeById(prev, delta))
      } catch {
        /* ignore transient poll errors */
      } finally {
        setPolling(false)
      }
    }
    const id = window.setInterval(() => void tick(), 22_000)
    return () => window.clearInterval(id)
  }, [tierFilter, statusFilter, mergeById])

  const onAck = async (a: AdminAlert) => {
    setActionId(a.id)
    try {
      await acknowledgeAdminAlert(a.id)
      toast({ title: "Alert acknowledged" })
      await fullReload()
    } catch (e: unknown) {
      if (isForbiddenAlertAction(e)) {
        toast({
          title: "Not allowed",
          description: "Your role cannot acknowledge this alert type.",
          variant: "destructive",
        })
      } else {
        const err = e as { message?: string }
        toast({ title: "Acknowledge failed", description: err.message, variant: "destructive" })
      }
    } finally {
      setActionId(null)
    }
  }

  const openResolve = (a: AdminAlert) => {
    setResolveTarget(a)
    setResolutionNotes("")
    setResolveOpen(true)
  }

  const onResolve = async () => {
    if (!resolveTarget) return
    const notes = resolutionNotes.trim()
    if (!notes) {
      toast({ title: "Resolution notes are required", variant: "destructive" })
      return
    }
    setActionId(resolveTarget.id)
    try {
      await resolveAdminAlert(resolveTarget.id, notes)
      toast({ title: "Alert resolved" })
      setResolveOpen(false)
      setResolveTarget(null)
      await fullReload()
    } catch (e: unknown) {
      if (isForbiddenAlertAction(e)) {
        toast({
          title: "Not allowed",
          description: "Your role cannot resolve this alert type.",
          variant: "destructive",
        })
      } else {
        const err = e as { message?: string }
        toast({ title: "Resolve failed", description: err.message, variant: "destructive" })
      }
    } finally {
      setActionId(null)
    }
  }

  const onFraudSubmit = async () => {
    const notes = fraudNotes.trim()
    if (notes.length < 3) {
      toast({ title: "Notes must be at least 3 characters", variant: "destructive" })
      return
    }
    const sellerId = fraudSellerId.trim()
    const orderId = fraudOrderId.trim()
    if (!sellerId && !orderId) {
      toast({ title: "Provide seller ID and/or order ID", variant: "destructive" })
      return
    }
    setActionId("__fraud__")
    try {
      const res = await postSuspectedFraud({ notes, sellerId: sellerId || undefined, orderId: orderId || undefined })
      toast({ title: "Fraud investigation alert created", description: `Alert ${res.id.slice(0, 8)}…` })
      setFraudOpen(false)
      setFraudNotes("")
      setFraudSellerId("")
      setFraudOrderId("")
      await fullReload()
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: err.status === 403 ? "Not allowed" : "Request failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  const emptyCopy = useMemo(
    () =>
      "No alerts for your team right now. The inbox is filtered by your admin role on the server — if something should appear here, check filters or try again shortly.",
    []
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm" onClick={() => void fullReload()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          {polling ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking for new alerts…
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Polls every ~22s (cursor + merge)</span>
          )}
        </div>
        {showFraud ? (
          <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={() => setFraudOpen(true)}>
            <ShieldAlert className="h-4 w-4" />
            Flag suspected fraud
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading alerts…
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-border/80 bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg">Inbox empty</CardTitle>
            <CardDescription>{emptyCopy}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const href = hrefForAlertEntity(a.entityType as string, a.entityId as string)
            const fraudish = isFraudClassAlert(String(a.alertCode), a.metadata)
            return (
              <Card
                key={a.id}
                className={cn(
                  "border-border/80 bg-card/50",
                  fraudish ? "border-red-500/35 bg-red-950/10" : null
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={tierBadgeClass(String(a.tier))}>
                          {String(a.tier)}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono border-border/70">
                          {String(a.alertCode)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {String(a.status)}
                        </Badge>
                      </div>
                      <div className="font-medium text-foreground">{a.title}</div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.message}</p>
                      <div className="text-xs text-muted-foreground font-mono">
                        {new Date(a.createdAt).toLocaleString()} · id {a.id.slice(0, 8)}…
                      </div>
                      {a.entityId ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {href ? (
                            <Button asChild variant="outline" size="sm" className="gap-1">
                              <Link href={href}>
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open {a.entityType || "entity"}
                              </Link>
                            </Button>
                          ) : null}
                          <span className="text-xs text-muted-foreground self-center">
                            {a.entityType}: {String(a.entityId).slice(0, 12)}…
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
                      {String(a.status) === "OPEN" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={!!actionId}
                          onClick={() => void onAck(a)}
                          className="gap-2"
                        >
                          {actionId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Acknowledge
                        </Button>
                      ) : null}
                      {String(a.status) === "OPEN" || String(a.status) === "ACKNOWLEDGED" ? (
                        <Button type="button" size="sm" disabled={!!actionId} onClick={() => openResolve(a)}>
                          Resolve
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve alert</DialogTitle>
            <DialogDescription>Resolution notes are required and stored for audit.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Resolution notes *</Label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
              disabled={!!actionId}
              placeholder="What was done, ticket refs, follow-ups…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResolveOpen(false)} disabled={!!actionId}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void onResolve()} disabled={!!actionId} className="gap-2">
              {actionId && resolveTarget && actionId === resolveTarget.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fraudOpen} onOpenChange={setFraudOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag suspected fraud</DialogTitle>
            <DialogDescription>
              Creates a critical <span className="font-mono">FRAUD_INVESTIGATION</span> alert. FinOps, Compliance, or
              Super Admin only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Notes * (min 3 characters)</Label>
              <Textarea value={fraudNotes} onChange={(e) => setFraudNotes(e.target.value)} rows={4} disabled={!!actionId} />
            </div>
            <div className="grid gap-1.5">
              <Label>Seller ID (optional)</Label>
              <Input value={fraudSellerId} onChange={(e) => setFraudSellerId(e.target.value)} disabled={!!actionId} />
            </div>
            <div className="grid gap-1.5">
              <Label>Order ID (optional)</Label>
              <Input value={fraudOrderId} onChange={(e) => setFraudOrderId(e.target.value)} disabled={!!actionId} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFraudOpen(false)} disabled={!!actionId}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onFraudSubmit()} disabled={!!actionId} className="gap-2">
              {actionId === "__fraud__" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
