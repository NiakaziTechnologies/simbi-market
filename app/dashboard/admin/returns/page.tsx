"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingReturnsTab } from "@/components/dashboard/admin/pending-returns-tab"
import { AllReturnsTab } from "@/components/dashboard/admin/all-returns-tab"
import { ReturnsReportTab } from "@/components/dashboard/admin/returns-report-tab"
import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"

export default function AdminReturnsPage() {
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
            <RotateCcw className="h-7 w-7" />
            Returns Management
          </h1>
          <p className="text-muted-foreground font-light">
            Review and process return requests and disputes
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-border">
          <TabsTrigger
            value="pending"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "pending" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Pending Returns
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "all" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            All Returns
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "reports" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingReturnsTab />
        </TabsContent>
        <TabsContent value="all">
          <AllReturnsTab />
        </TabsContent>
        <TabsContent value="reports">
          <ReturnsReportTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
