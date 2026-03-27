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
      className="glass-card rounded-2xl p-8 border border-border hover:border-accent/50 transition-all hover:shadow-2xl group"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start gap-4 flex-1 group-hover:translate-x-2 transition-transform">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all">
            <img src={app.bank.logo} alt={app.bank.name} className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{app.bank.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span className="font-mono">${app.amount.toLocaleString()}</span>
              <span>•</span>
              <span>{app.termMonths} months</span>
              <span>•</span>
              <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{app.reason}</p>
            {app.rejectionReason && (
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive inline mr-2" />
                <span className="text-sm font-medium text-destructive">{app.rejectionReason}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          <Badge 
            variant={app.status === 'approved' ? "default" : app.status === 'pending' ? "secondary" : "destructive"}
            className={`px-3 py-1 text-sm font-medium shadow-md ${
              app.status === 'approved' 
                ? 'bg-green-500/90 hover:bg-green-500 text-white shadow-green-500/25' 
                : app.status === 'pending' 
                ? 'bg-amber-500/90 hover:bg-amber-500 text-white shadow-amber-500/25' 
                : 'bg-destructive/90 hover:bg-destructive text-white shadow-destructive/25'
            } transition-all`}
          >
            {app.status.toUpperCase()}
          </Badge>
          {app.status === 'approved' && app.approvedAmount && (
            <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent drop-shadow-lg">
              ${app.approvedAmount.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
              Business Loans
            </h1>
            <p className="text-muted-foreground font-light max-w-2xl text-lg mt-3">
              Professional financing solutions to scale your automotive parts business. Instant pre-approval based on sales performance.
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/2 border border-accent/20 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-accent flex-shrink-0" />
              <div>
                <div className="text-2xl font-bold text-foreground">{eligibilityScore}%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Score</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Higher score unlocks better rates</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gradient-to-r from-slate-900/20 to-slate-800/20 backdrop-blur-md rounded-2xl p-1 border border-accent/20 shadow-xl">
            <TabsTrigger value="apply" className="data-[state=active]:bg-blue-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 data-[state=active]:border-blue-500/50 group relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-1.5">
                <Banknote className="h-4 w-4" />
                Apply New
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 -skew-x-12 transform scale-x-110 group-data-[state=active]:opacity-100 opacity-0 transition-all duration-300" />
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-green-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 data-[state=active]:border-green-500/50 group relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Approved ({stats.approved})
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 -skew-x-12 transform scale-x-110 group-data-[state=active]:opacity-100 opacity-0 transition-all duration-300" />
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/25 data-[state=active]:border-amber-500/50 group relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                Pending ({stats.pending})
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 -skew-x-12 transform scale-x-110 group-data-[state=active]:opacity-100 opacity-0 transition-all duration-300" />
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-destructive/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-destructive/25 data-[state=active]:border-destructive/50 group relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Declined ({stats.rejected})
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/20 -skew-x-12 transform scale-x-110 group-data-[state=active]:opacity-100 opacity-0 transition-all duration-300" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apply" className="mt-8">
            <LoanForm type="seller" score={eligibilityScore} />
          </TabsContent>

          <TabsContent value="approved" className="mt-8">
            {approvedApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-light text-foreground mb-3">No Approved Loans</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Apply for financing to see approved applications here. Your score ({eligibilityScore}%) qualifies for premium rates.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {approvedApps.map((app, index) => <LoanApplicationCard key={app.id} app={app} index={index} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-8">
            {pendingApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-light text-foreground mb-3">No Pending Applications</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Your applications will appear here during review (usually 24-48 hours).
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {pendingApps.map((app, index) => <LoanApplicationCard key={app.id} app={app} index={index} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-8">
            {rejectedApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 border-2 border-dashed border-muted rounded-3xl"
              >
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-light text-foreground mb-3">No Declined Loans</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
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
