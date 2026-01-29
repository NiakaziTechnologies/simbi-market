"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  getComprehensiveDashboard,
  getAnalyticsDashboard,
  getActivityDashboard,
  getReportsDashboard,
} from "@/lib/api/admin-dashboard"
import { OverviewTab } from "@/components/dashboard/admin/overview-tab"
import { AnalyticsTab } from "@/components/dashboard/admin/analytics-tab"
import { ActivityTab } from "@/components/dashboard/admin/activity-tab"
import { ReportsTab } from "@/components/dashboard/admin/reports-tab"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="lg:ml-64 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-light text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground font-light">
          Comprehensive platform overview and management
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground">Analytics</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground">Activity</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
