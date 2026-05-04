"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CreditCard,
  Shield,
  Banknote,
  TrendingUp,
  Building2,
  Landmark,
  Plus,
} from "lucide-react"
import { SellerLoanForm } from "@/components/dashboard/seller-loan-form"
import { SellerLoanApplicationCard } from "@/components/dashboard/seller-loan-application-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  listSellerLoanPartners,
  listSellerLoanApplications,
  isLoanStatusApprovedGroup,
  isLoanStatusInPipeline,
  isLoanStatusRejectedGroup,
  type LoanApplicationSellerView,
  type SellerLoanPartner,
} from "@/lib/api/seller-loans"
import { toast } from "sonner"

export default function SellerLoansPage() {
  const [activeTab, setActiveTab] = useState("partners")
  const [applyOpen, setApplyOpen] = useState(false)
  const [partners, setPartners] = useState<SellerLoanPartner[]>([])
  const [applications, setApplications] = useState<LoanApplicationSellerView[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [appsRes, partnersRes] = await Promise.all([
        listSellerLoanApplications(),
        listSellerLoanPartners(),
      ])

      if (appsRes.success === false) {
        throw new Error(appsRes.message || "Could not load applications")
      }
      if (partnersRes.success === false) {
        throw new Error(partnersRes.message || "Could not load partners")
      }

      setApplications(Array.isArray(appsRes.data) ? appsRes.data : [])
      setPartners(
        (Array.isArray(partnersRes.data) ? partnersRes.data : []).filter(
          (p) => p.isActive !== false
        )
      )
    } catch (e: unknown) {
      const err = e as { message?: string }
      if (!silent) toast.error(err.message || "Could not load loans data")
      setApplications([])
      setPartners([])
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh(true)
    }, 20000)
    return () => window.clearInterval(id)
  }, [refresh])

  const healthDisplay = useMemo(() => {
    const scores = applications
      .map((a) => a.storeHealthScore)
      .filter((s): s is number => s != null && !Number.isNaN(Number(s)))
    if (scores.length === 0) return null
    const avg =
      scores.reduce((a, b) => a + Number(b), 0) / scores.length
    return Math.round(avg)
  }, [applications])

  const approvedApps = applications.filter((a) =>
    isLoanStatusApprovedGroup(a.status)
  )
  const pendingApps = applications.filter((a) =>
    isLoanStatusInPipeline(a.status)
  )
  const rejectedApps = applications.filter((a) =>
    isLoanStatusRejectedGroup(a.status)
  )

  const stats = {
    approved: approvedApps.length,
    pending: pendingApps.length,
    rejected: rejectedApps.length,
    total: applications.length,
  }

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [applications]
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
              Business loans
            </h1>
            <p className="text-muted-foreground font-light max-w-2xl text-sm sm:text-base lg:text-lg mt-2">
              Choose a financial partner, request an amount and purpose, and track progress. Verified revenue, inventory, and order data are attached for you automatically.
            </p>
          </div>
          <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/2 border border-accent/20 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
              <div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {healthDisplay != null ? `${healthDisplay}` : "—"}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Store health (avg)
                </div>
              </div>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              From your applications&apos; verified snapshot
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[480px] grid-cols-2 bg-background/50 border border-border">
              <TabsTrigger
                value="partners"
                className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
                style={activeTab === "partners" ? { backgroundColor: "#2563eb", color: "white" } : {}}
              >
                <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Partners ({partners.length})
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
                style={activeTab === "applications" ? { backgroundColor: "#2563eb", color: "white" } : {}}
              >
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Applications ({stats.total})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="partners" className="mt-6 sm:mt-8">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
            ) : partners.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <Building2 className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6 opacity-50" />
                <h3 className="text-lg sm:text-2xl font-light text-foreground mb-2 sm:mb-3">
                  No active partners
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4 sm:mb-6 text-sm">
                  Active lenders will appear here once enabled by admin.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="rounded-2xl border border-border bg-card/60 p-5 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden">
                        {partner.logo ? (
                          <img src={partner.logo} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          <Building2 className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{partner.name}</p>
                        {partner.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{partner.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-muted/30 p-2">
                        <p className="text-muted-foreground">Min amount</p>
                        <p className="font-medium text-foreground">
                          {partner.minAmount != null ? `${Number(partner.minAmount).toLocaleString()}` : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <p className="text-muted-foreground">Max amount</p>
                        <p className="font-medium text-foreground">
                          {partner.maxAmount != null ? `${Number(partner.maxAmount).toLocaleString()}` : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <p className="text-muted-foreground">Rate</p>
                        <p className="font-medium text-foreground">
                          {partner.interestRate != null ? `${Number(partner.interestRate).toFixed(2)}%` : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2">
                        <p className="text-muted-foreground">Term</p>
                        <p className="font-medium text-foreground">
                          {partner.termMonths != null ? `${partner.termMonths} months` : "—"}
                        </p>
                      </div>
                    </div>
                    {partner.feesAndTermsSummary && (
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap border rounded-lg p-3 bg-muted/20">
                        {partner.feesAndTermsSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="text-sm text-muted-foreground">
                Track all applications and open timeline to sync or cancel where allowed.
              </div>
              <Button
                onClick={() => setApplyOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Apply
              </Button>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
            ) : sortedApplications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <CreditCard className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6 opacity-50" />
                <h3 className="text-lg sm:text-2xl font-light text-foreground mb-2 sm:mb-3">
                  No applications yet
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4 sm:mb-6 text-sm">
                  Start by clicking <strong>Apply</strong> to submit your first loan request.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {sortedApplications.map((app, index) => (
                  <SellerLoanApplicationCard
                    key={app.id}
                    app={app}
                    index={index}
                    onUpdated={() => void refresh()}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="w-[96vw] max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>New loan application</DialogTitle>
          </DialogHeader>
          <SellerLoanForm
            onApplicationCreated={() => {
              setApplyOpen(false)
              setActiveTab("applications")
              void refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 border-t border-border/50 text-center text-xs text-muted-foreground"
      >
        <p>
          Loans are provided by partner institutions • Subject to partner approval • Simbi Market
          facilitates the connection
        </p>
      </motion.div>
    </div>
  )
}
