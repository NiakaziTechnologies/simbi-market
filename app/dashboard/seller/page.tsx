"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { getSellerDashboardComprehensive, type SellerDashboardComprehensiveResponse } from "@/lib/api/seller-dashboard"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

function formatCurrency(value: number, unit: string = "$"): string {
  if (unit === "$") {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  return `${unit}${value.toLocaleString()}`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function getTrendIcon(changeType: 'up' | 'down') {
  switch (changeType) {
    case 'up':
      return <ArrowUpRight className="h-4 w-4 text-green-400" />
    case 'down':
      return <ArrowDownRight className="h-4 w-4 text-red-400" />
  }
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

export default function SellerDashboardPage() {
  const [dashboardData, setDashboardData] = useState<SellerDashboardComprehensiveResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const data = await getSellerDashboardComprehensive()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load dashboard data'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const { kpis, summary, salesSummary, salesPerformanceAnalytics, periodComparison, topCategories, topSellingProducts, keyMetrics } = dashboardData

  // Prepare chart data with null checks
  const salesPerformanceData = salesPerformanceAnalytics?.data && Array.isArray(salesPerformanceAnalytics.data)
    ? salesPerformanceAnalytics.data.map((item) => ({
        date: format(new Date(item.date), "MMM dd"),
        sales: item.sales || 0,
        unfulfilledOrders: item.unfulfilledOrders || 0,
      }))
    : []

  const topCategoriesData = topCategories && Array.isArray(topCategories) && topCategories.length > 0
    ? topCategories.map((cat) => ({
        name: cat.category || 'Unknown',
        value: cat.amount || 0,
        percentage: cat.percentage || 0,
      }))
    : [{ name: 'No Data', value: 0, percentage: 0 }]

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
    unfulfilledOrders: {
      label: "Unfulfilled Orders",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-light">Welcome to your seller dashboard</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatCurrency(kpis?.totalRevenue?.value || 0, kpis?.totalRevenue?.unit || "$")}
          </h3>
          <p className="text-sm text-muted-foreground">{kpis?.totalRevenue?.title || "Total Revenue"}</p>
          <p className="text-xs text-muted-foreground mt-1">{kpis?.totalRevenue?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Wallet className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatCurrency(kpis?.currentBalance?.value || 0, kpis?.currentBalance?.unit || "$")}
          </h3>
          <p className="text-sm text-muted-foreground">{kpis?.currentBalance?.title || "Current Balance"}</p>
          <p className="text-xs text-muted-foreground mt-1">{kpis?.currentBalance?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatNumber(kpis?.totalProducts?.value || 0)}
          </h3>
          <p className="text-sm text-muted-foreground">{kpis?.totalProducts?.title || "Total Products"}</p>
          <p className="text-xs text-muted-foreground mt-1">{kpis?.totalProducts?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatNumber(kpis?.activeStaff?.value || 0)}
          </h3>
          <p className="text-sm text-muted-foreground">{kpis?.activeStaff?.title || "Active Staff"}</p>
          <p className="text-xs text-muted-foreground mt-1">{kpis?.activeStaff?.description || ""}</p>
        </motion.div>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <p className="text-sm text-muted-foreground mb-1">{salesSummary?.daily?.period || "Today"}</p>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatCurrency(salesSummary?.daily?.value || 0, "$")}
          </h3>
          <p className="text-sm text-muted-foreground">{salesSummary?.daily?.title || "Daily Sales"}</p>
          <p className="text-xs text-muted-foreground mt-1">{salesSummary?.daily?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-muted-foreground">{salesSummary?.weekly?.period || "This Week"}</p>
            {periodComparison?.thisWeek?.changeType && getTrendIcon(periodComparison.thisWeek.changeType)}
          </div>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatCurrency(salesSummary?.weekly?.value || 0, "$")}
          </h3>
          <p className="text-sm text-muted-foreground">{salesSummary?.weekly?.title || "Weekly Sales"}</p>
          <p className="text-xs text-muted-foreground mt-1">{periodComparison?.thisWeek?.comparison || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-muted-foreground">{salesSummary?.monthly?.period || "This Month"}</p>
            {periodComparison?.thisMonth?.changeType && getTrendIcon(periodComparison.thisMonth.changeType)}
          </div>
          <h3 className="text-2xl font-light text-foreground mb-1">
            {formatCurrency(salesSummary?.monthly?.value || 0, "$")}
          </h3>
          <p className="text-sm text-muted-foreground">{salesSummary?.monthly?.title || "Monthly Sales"}</p>
          <p className="text-xs text-muted-foreground mt-1">{periodComparison?.thisMonth?.comparison || ""}</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-light text-foreground mb-1">{salesPerformanceAnalytics?.title || "Sales Performance"}</h3>
            <p className="text-sm text-muted-foreground">{salesPerformanceAnalytics?.subtitle || ""}</p>
          </div>
          {salesPerformanceData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={salesPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="unfulfilledOrders"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No sales data available</p>
            </div>
          )}
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-light text-foreground mb-1">Top Categories</h3>
            <p className="text-sm text-muted-foreground">Revenue by product category</p>
          </div>
          {topCategories && Array.isArray(topCategories) && topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{category.category}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(category.amount, "$")} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No category data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="glass-card rounded-xl p-6"
        >
          <p className="text-sm text-muted-foreground mb-1">{summary?.currentBalance?.title || "Current Balance"}</p>
          <h3 className="text-xl font-light text-foreground mb-1">
            {formatCurrency(summary?.currentBalance?.value || 0, summary?.currentBalance?.unit || "$")}
          </h3>
          <p className="text-xs text-muted-foreground">{summary?.currentBalance?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="glass-card rounded-xl p-6"
        >
          <p className="text-sm text-muted-foreground mb-1">{summary?.totalRevenue?.title || "Total Revenue"}</p>
          <h3 className="text-xl font-light text-foreground mb-1">
            {formatCurrency(summary?.totalRevenue?.value || 0, summary?.totalRevenue?.unit || "$")}
          </h3>
          <p className="text-xs text-muted-foreground">{summary?.totalRevenue?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="glass-card rounded-xl p-6"
        >
          <p className="text-sm text-muted-foreground mb-1">{summary?.totalOrders?.title || "Total Orders"}</p>
          <h3 className="text-xl font-light text-foreground mb-1">
            {formatNumber(summary?.totalOrders?.value || 0)}
          </h3>
          <p className="text-xs text-muted-foreground">{summary?.totalOrders?.description || ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="glass-card rounded-xl p-6"
        >
          <p className="text-sm text-muted-foreground mb-1">{summary?.inventoryItems?.title || "Inventory Items"}</p>
          <h3 className="text-xl font-light text-foreground mb-1">
            {formatNumber(summary?.inventoryItems?.value || 0)}
          </h3>
          <p className="text-xs text-muted-foreground">{summary?.inventoryItems?.description || ""}</p>
        </motion.div>
      </div>

      {/* Top Selling Products */}
      {topSellingProducts?.data && Array.isArray(topSellingProducts.data) && topSellingProducts.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-light text-foreground mb-1">{topSellingProducts?.title || "Top Selling Products"}</h3>
            <p className="text-sm text-muted-foreground">{topSellingProducts?.subtitle || ""}</p>
          </div>
          <div className="space-y-4">
            {topSellingProducts.data.map((product, index) => (
              <div key={product.inventoryId} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-foreground font-medium mb-1">{product?.productName || "Unknown Product"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {product?.oemPartNumber || "N/A"} • {product?.manufacturer || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-medium">{formatCurrency(product?.revenue || 0, "$")}</p>
                  <p className="text-xs text-muted-foreground">
                    {product?.quantitySold || 0} sold • {product?.orderCount || 0} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-light text-foreground mb-4">Order Fulfillment Rate</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-light text-foreground">
                {keyMetrics?.orderFulfillment?.value || 0}{keyMetrics?.orderFulfillment?.unit || "%"}
              </span>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">{keyMetrics?.orderFulfillment?.comparison || ""}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-light text-foreground mb-4">Average Response Time</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-light text-foreground">
                {keyMetrics?.avgResponseTime?.value ? keyMetrics.avgResponseTime.value.toFixed(1) : "0.0"}{keyMetrics?.avgResponseTime?.unit || "h"}
              </span>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">{keyMetrics?.avgResponseTime?.comparison || ""}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
