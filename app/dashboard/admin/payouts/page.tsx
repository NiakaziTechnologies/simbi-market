"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingPayoutsTab } from "@/components/dashboard/admin/pending-payouts-tab"
import { PayoutHistoryTab } from "@/components/dashboard/admin/payout-history-tab"
import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"

export default function AdminPayoutsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-foreground mb-2 flex items-center gap-2">
            <DollarSign className="h-7 w-7" />
            Payouts Management
          </h1>
          <p className="text-muted-foreground font-light">
            Process seller payouts and view payout history
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border">
          <TabsTrigger
            value="pending"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "pending" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Pending Payouts
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "history" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Payout History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingPayoutsTab />
        </TabsContent>
        <TabsContent value="history">
          <PayoutHistoryTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
