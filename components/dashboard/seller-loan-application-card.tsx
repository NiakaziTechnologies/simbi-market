"use client"

import { useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Building2,
  History,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  cancelSellerLoanApplication,
  getSellerLoanApplication,
  syncSellerLoanApplicationStatus,
  canCancelLoanApplication,
  loanStatusLabel,
  type LoanApplicationSellerView,
  type LoanStatusEvent,
} from "@/lib/api/seller-loans"
import { toast } from "sonner"

function statusBadgeClass(status: string): string {
  if (["APPROVED", "DISBURSED", "ACTIVE", "PAID_OFF"].includes(status)) {
    return "bg-green-500/90 text-white shadow-green-500/25"
  }
  if (["SUBMITTED", "PARTNER_ENTERED", "UNDER_REVIEW", "DRAFT"].includes(status)) {
    return "bg-amber-500/90 text-white shadow-amber-500/25"
  }
  if (["REJECTED", "DEFAULTED", "CANCELLED"].includes(status)) {
    return "bg-destructive/90 text-white shadow-destructive/25"
  }
  return "bg-muted text-foreground"
}

function formatMoney(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return Number(n).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })
}

function sortEvents(events: LoanStatusEvent[] | undefined): LoanStatusEvent[] {
  if (!events?.length) return []
  return [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

interface SellerLoanApplicationCardProps {
  app: LoanApplicationSellerView
  index: number
  onUpdated: () => void
}

export function SellerLoanApplicationCard({
  app,
  index,
  onUpdated,
}: SellerLoanApplicationCardProps) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<LoanApplicationSellerView | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true)
    try {
      const res = await getSellerLoanApplication(app.id)
      if (res.success && res.data) setDetail(res.data)
      else throw new Error(res.message || "Could not load application")
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message || "Could not load details")
      setDetail(app)
    } finally {
      setLoadingDetail(false)
    }
  }, [app])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) void loadDetail()
    if (!next) setDetail(null)
  }

  const display = detail ?? app
  const events = useMemo(() => sortEvents(display.statusEvents), [display.statusEvents])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await syncSellerLoanApplicationStatus(app.id)
      if (res.success) {
        toast.success(res.message || "Status refreshed")
        onUpdated()
        if (open) void loadDetail()
      } else {
        toast.message(res.message || "Sync not available for this partner")
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message || "Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await cancelSellerLoanApplication(app.id)
      if (!res.success) throw new Error(res.message || "Cancel failed")
      toast.success(res.message || "Application cancelled")
      setOpen(false)
      onUpdated()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message || "Could not cancel")
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = canCancelLoanApplication(display.status)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl p-4 sm:p-6 border border-border hover:border-accent/50 transition-all hover:shadow-xl group"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {display.partner?.logo ? (
              <img
                src={display.partner.logo}
                alt=""
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Building2 className="h-6 w-6 text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {display.partner?.name ?? "Partner"}
              </h3>
              <Badge className={`text-[10px] sm:text-xs font-medium ${statusBadgeClass(display.status)}`}>
                {display.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {loanStatusLabel(display.status)}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-2">
              <span className="font-mono font-medium text-foreground">
                ${formatMoney(display.requestedAmount)}
              </span>
              <span className="hidden sm:inline">·</span>
              <span>{new Date(display.createdAt).toLocaleDateString()}</span>
            </div>
            {display.purpose && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                {display.purpose}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] sm:text-xs mb-3">
              <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                <div className="text-muted-foreground">6mo revenue</div>
                <div className="font-medium">${formatMoney(display.last6MonthsRevenue)}</div>
              </div>
              <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                <div className="text-muted-foreground">Inventory</div>
                <div className="font-medium">${formatMoney(display.inventoryValue)}</div>
              </div>
              <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                <div className="text-muted-foreground">Store health</div>
                <div className="font-medium">
                  {display.storeHealthScore != null ? `${display.storeHealthScore}` : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                <div className="text-muted-foreground">Orders / mo</div>
                <div className="font-medium">
                  {display.monthlyOrderCount != null ? display.monthlyOrderCount : "—"}
                </div>
              </div>
            </div>

            {display.rejectionReason && (
              <div className="bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 mb-3">
                <AlertCircle className="h-3.5 w-3.5 text-destructive inline mr-1" />
                <span className="text-xs text-destructive">{display.rejectionReason}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    Timeline
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Application timeline</DialogTitle>
                  </DialogHeader>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading…
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium text-foreground">Status: </span>
                          {display.status}
                        </p>
                        <p className="text-xs">{loanStatusLabel(display.status)}</p>
                      </div>
                      {events.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No status events yet.</p>
                      ) : (
                        <ul className="space-y-3 border-l-2 border-accent/30 pl-4 ml-1">
                          {events.map((ev) => (
                            <li key={ev.id} className="relative">
                              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-accent" />
                              <div className="text-xs text-muted-foreground">
                                {new Date(ev.createdAt).toLocaleString()}
                              </div>
                              <div className="text-sm font-medium">
                                {ev.fromStatus ?? "—"} → {ev.toStatus}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Source: {ev.source}
                                {ev.note ? ` · ${ev.note}` : ""}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={syncing}
                          onClick={() => void handleSync()}
                          className="gap-1.5"
                        >
                          {syncing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          Sync from partner
                        </Button>
                        {canCancel && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={cancelling}
                                className="gap-1.5 text-destructive border-destructive/40"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel application
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This cannot be undone. You can submit a new application later if needed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault()
                                    void handleCancel()
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {cancelling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Yes, cancel"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={syncing}
                onClick={() => void handleSync()}
                className="gap-1.5"
              >
                {syncing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Sync
              </Button>

              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={cancelling}
                      className="text-destructive gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Allowed while status is submitted, partner entered, or under review.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault()
                          void handleCancel()
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {cancelling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Yes, cancel"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
