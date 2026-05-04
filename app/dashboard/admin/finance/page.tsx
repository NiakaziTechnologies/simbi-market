"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth/auth-context"
import { canViewFinOpsReconciliation } from "@/lib/auth/admin-rbac"
import { FinanceConfigurationTab } from "@/components/dashboard/admin/finance-configuration-tab"
import { FinanceReconciliationTab } from "@/components/dashboard/admin/finance-reconciliation-tab"
import { Scale, Settings } from "lucide-react"

export default function AdminFinancePage() {
  const { user } = useAuth()
  const showReconciliation = canViewFinOpsReconciliation(user?.adminRole)

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-b pb-6">
        <h1 className="text-4xl font-light tracking-tight">Finance</h1>
        <p className="text-muted-foreground text-lg mt-2 max-w-3xl">
          Configure loan banks and platform fees, or open{" "}
          <span className="text-foreground/90">Reconciliation</span> for payout vs commission audits (FinOps / Super
          Admin APIs).
        </p>
      </motion.div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className={showReconciliation ? "grid w-full max-w-md grid-cols-2" : "inline-flex"}>
          <TabsTrigger value="configuration" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          {showReconciliation ? (
            <TabsTrigger value="reconciliation" className="gap-2">
              <Scale className="h-4 w-4" />
              Reconciliation
            </TabsTrigger>
          ) : null}
        </TabsList>
        <TabsContent value="configuration" className="mt-6">
          <FinanceConfigurationTab />
        </TabsContent>
        {showReconciliation ? (
          <TabsContent value="reconciliation" className="mt-6">
            <FinanceReconciliationTab />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
