"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingReturnsTab } from "@/components/dashboard/admin/pending-returns-tab"
import { AllReturnsTab } from "@/components/dashboard/admin/all-returns-tab"
import { ReturnsReportTab } from "@/components/dashboard/admin/returns-report-tab"
import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"

export default function AdminReturnsPage() {
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

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-fit grid-cols-3 bg-muted/30 border border-border">
          <TabsTrigger value="pending" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Pending Returns
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            All Returns
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
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
