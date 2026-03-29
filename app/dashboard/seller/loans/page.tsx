"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CreditCard, Shield, Banknote, TrendingUp } from "lucide-react"
import { LoanForm } from "@/components/dashboard/loan-form"
import { fetchLoansAsync, banks } from "@/lib/api/loans"
import type { RootState } from "@/lib/store"
import type { LoanApplication } from "@/lib/features/loan-slice"
import { fetchLoansSuccess } from "@/lib/features/loan-slice"

export default function SellerLoansPage() {
  const dispatch = useDispatch()
  const { eligibilityScore, applications } = useSelector((state: RootState) => state.loan)
  const [activeTab, setActiveTab] = useState('apply')

  useEffect(() => {
    dispatch(fetchLoansAsync('seller')).unwrap().then((data) => {
      dispatch(fetchLoansSuccess(data))
    })
  }, [dispatch])

  const approvedApps = applications.filter(app => app.status === 'approved')
  const pendingApps = applications.filter(app => app.status === 'pending')
  const rejectedApps = applications.filter(app => app.status === 'rejected')

  const stats = {
    approved: approvedApps.length,
    pending: pendingApps.length,
    rejected: rejectedApps.length,
    total: applications.length
  }

  const LoanApplicationCard = ({ app, index }: { app: LoanApplication, index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl p-4 sm:p-6 lg:p-8 border border-border hover:border-accent/50 transition-all hover:shadow-2xl group"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 group-hover:translate-x-2 transition-transform">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all">
            <img src={app.bank.logo} alt={app.bank.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-xl font-semibold text-foreground">{app.bank.name}</h3>
              <Badge 
                className={`px-2 py-0.5 text-[10px] sm:text-sm font-medium shadow-md ${
                  app.status === 'approved' 
                    ? 'bg-green-500/90 text-white shadow-green-500/25' 
                    : app.status === 'pending' 
                    ? 'bg-amber-500/90 text-white shadow-amber-500/25' 
                    : 'bg-destructive/90 text-white shadow-destructive/25'
                }`}
              >
                {app.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-2">
              <span className="font-mono font-medium">${app.amount.toLocaleString()}</span>
              <span className="hidden sm:inline">•</span>
              <span>{app.termMonths} months</span>
              <span className="hidden sm:inline">•</span>
              <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{app.reason}</p>
            {app.rejectionReason && (
              <div className="bg-destructive/10 p-2.5 sm:p-3 rounded-lg border border-destructive/20">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive inline mr-1.5" />
                <span className="text-xs sm:text-sm font-medium text-destructive">{app.rejectionReason}</span>
              </div>
            )}
            {app.status === 'approved' && app.approvedAmount && (
              <div className="mt-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent drop-shadow-lg">
                ${app.approvedAmount.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
              Business Loans
            </h1>
            <p className="text-muted-foreground font-light max-w-2xl text-sm sm:text-base lg:text-lg mt-2">
              Professional financing solutions to scale your automotive parts business. Instant pre-approval based on sales performance.
            </p>
          </div>
          <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/2 border border-accent/20 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
              <div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{eligibilityScore}%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">Score</div>
              </div>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Higher score unlocks better rates</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="flex w-max sm:w-full sm:grid sm:grid-cols-4 bg-gradient-to-r from-slate-900/20 to-slate-800/20 backdrop-blur-md rounded-2xl p-1 border border-accent/20 shadow-xl">
                <TabsTrigger value="apply" className="flex-shrink-0 sm:flex-shrink whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-blue-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all">
                  <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Apply New
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex-shrink-0 sm:flex-shrink whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-green-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 transition-all">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Approved ({stats.approved})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-shrink-0 sm:flex-shrink whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-amber-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/25 transition-all">
                  <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex-shrink-0 sm:flex-shrink whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-destructive/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-destructive/25 transition-all">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Declined ({stats.rejected})
                </TabsTrigger>
              </TabsList>
            </div>

          <TabsContent value="apply" className="mt-6 sm:mt-8">
            <LoanForm type="seller" score={eligibilityScore} />
          </TabsContent>

          <TabsContent value="approved" className="mt-6 sm:mt-8">
            {approvedApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <TrendingUp className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6 opacity-50" />
                <h3 className="text-lg sm:text-2xl font-light text-foreground mb-2 sm:mb-3">No Approved Loans</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4 sm:mb-6 text-sm">
                  Apply for financing to see approved applications here. Your score ({eligibilityScore}%) qualifies for premium rates.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {approvedApps.map((app, index) => <LoanApplicationCard key={app.id} app={app} index={index} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6 sm:mt-8">
            {pendingApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <CreditCard className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6 opacity-50" />
                <h3 className="text-lg sm:text-2xl font-light text-foreground mb-2 sm:mb-3">No Pending Applications</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4 sm:mb-6 text-sm">
                  Your applications will appear here during review (usually 24-48 hours).
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {pendingApps.map((app, index) => <LoanApplicationCard key={app.id} app={app} index={index} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6 sm:mt-8">
            {rejectedApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <AlertCircle className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 sm:mb-6 opacity-50" />
                <h3 className="text-lg sm:text-2xl font-light text-foreground mb-2 sm:mb-3">No Declined Loans</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4 sm:mb-6 text-sm">
                  Improve your score or try different amounts/banks for better approval chances.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {rejectedApps.map((app, index) => <LoanApplicationCard key={app.id} app={app} index={index} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 border-t border-border/50 text-center text-xs text-muted-foreground"
      >
        <p>Loans provided by partner banks • Subject to final approval • Simbi Market is a financing facilitator</p>
      </motion.div>
    </div>
  )
}
