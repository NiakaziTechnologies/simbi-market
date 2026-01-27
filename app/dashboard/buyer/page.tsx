"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Settings,
  DollarSign,
  ShoppingCart,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getComprehensiveAnalytics, type ComprehensiveAnalytics } from "@/lib/api/analytics"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { useAuth } from "@/lib/auth/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import React from "react"

const statusConfig = {
  PENDING_PAYMENT: { icon: Clock, label: "Pending Payment", color: "text-yellow-400" },
  PROCESSING: { icon: Clock, label: "Processing", color: "text-yellow-400" },
  SHIPPED: { icon: Truck, label: "Shipped", color: "text-accent" },
  DELIVERED: { icon: CheckCircle2, label: "Delivered", color: "text-green-400" },
  CANCELLED: { icon: X, label: "Cancelled", color: "text-red-400" },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function getTrendIcon(trend: 'up' | 'down' | 'neutral') {
  switch (trend) {
    case 'up':
      return <ArrowUpRight className="h-4 w-4 text-green-400" />
    case 'down':
      return <ArrowDownRight className="h-4 w-4 text-red-400" />
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

function getTrendColor(trend: 'up' | 'down' | 'neutral', change: number) {
  if (change === 0) return "text-muted-foreground"
  switch (trend) {
    case 'up':
      return "text-green-400"
    case 'down':
      return "text-red-400"
    default:
      return "text-muted-foreground"
  }
}

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        const data = await getComprehensiveAnalytics()
        setAnalytics(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
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

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const { kpis, charts, recentOrders } = analytics

  // Prepare chart data
  const monthlySpendingData = charts.monthlySpendingTrend.data.map((item) => ({
    month: item.month,
    amount: item.amount,
  }))

  const spendingByCategoryData = charts.spendingByCategory.data.length > 0
    ? charts.spendingByCategory.data.map((item) => ({
        category: item.category,
        amount: item.amount,
      }))
    : [{ category: 'No Data', amount: 0 }]

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

  const spendingChartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
  }

  const categoryChartConfig = spendingByCategoryData.reduce((acc, item, index) => {
    acc[item.category] = {
      label: item.category,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground font-light">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground font-light text-sm">Total Spend YTD</p>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-light text-foreground mb-2">
            {formatCurrency(kpis.totalSpendYTD.value)}
          </p>
          <div className="flex items-center gap-2">
            {getTrendIcon(kpis.totalSpendYTD.trend)}
            <span className={cn("text-xs font-light", getTrendColor(kpis.totalSpendYTD.trend, kpis.totalSpendYTD.change))}>
              {kpis.totalSpendYTD.changePercentage !== 0
                ? `${kpis.totalSpendYTD.changePercentage > 0 ? '+' : ''}${kpis.totalSpendYTD.changePercentage.toFixed(1)}%`
                : 'No change'}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground font-light text-sm">Open Purchase Orders</p>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-light text-foreground mb-2">
            {formatNumber(kpis.openPurchaseOrders.value)}
          </p>
          <div className="flex items-center gap-2">
            {getTrendIcon(kpis.openPurchaseOrders.trend)}
            <span className={cn("text-xs font-light", getTrendColor(kpis.openPurchaseOrders.trend, kpis.openPurchaseOrders.change))}>
              {kpis.openPurchaseOrders.change > 0 ? `+${kpis.openPurchaseOrders.change}` : kpis.openPurchaseOrders.change}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground font-light text-sm">Pending Invoice Total</p>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-light text-foreground mb-2">
            {formatCurrency(kpis.pendingInvoiceTotal.value)}
          </p>
          <div className="flex items-center gap-2">
            {getTrendIcon(kpis.pendingInvoiceTotal.trend)}
            <span className={cn("text-xs font-light", getTrendColor(kpis.pendingInvoiceTotal.trend, kpis.pendingInvoiceTotal.change))}>
              {kpis.pendingInvoiceTotal.change > 0 ? `+${formatCurrency(kpis.pendingInvoiceTotal.change)}` : formatCurrency(kpis.pendingInvoiceTotal.change)}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground font-light text-sm">Available Monthly Budget</p>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-light text-foreground mb-2">
            {formatCurrency(kpis.availableMonthlyBudget.value)}
          </p>
          <div className="flex items-center gap-2">
            {getTrendIcon(kpis.availableMonthlyBudget.trend)}
            <span className="text-xs font-light text-muted-foreground">
              Remaining
            </span>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-lg p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-light text-foreground mb-1">
              {charts.monthlySpendingTrend.title}
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              {charts.monthlySpendingTrend.subtitle}
            </p>
          </div>
          <ChartContainer config={spendingChartConfig} className="h-[300px]">
            <AreaChart data={monthlySpendingData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
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
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </motion.div>

        {/* Budget Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card rounded-lg p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-light text-foreground mb-1">
              {charts.budgetUtilization.title}
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              {charts.budgetUtilization.subtitle}
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light text-foreground">
                  {formatCurrency(charts.budgetUtilization.used)}
                </span>
                <span className="text-muted-foreground font-light">
                  of {formatCurrency(charts.budgetUtilization.total)}
                </span>
              </div>
              <Progress
                value={charts.budgetUtilization.percentage}
                className="h-3"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-light">
                  {charts.budgetUtilization.percentage.toFixed(1)}% used
                </span>
                <span className="text-muted-foreground font-light">
                  {formatCurrency(charts.budgetUtilization.remaining)} remaining
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-light mb-1">Used</p>
                  <p className="text-xl font-light text-foreground">
                    {formatCurrency(charts.budgetUtilization.used)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-light mb-1">Remaining</p>
                  <p className="text-xl font-light text-foreground">
                    {formatCurrency(charts.budgetUtilization.remaining)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="mb-8">
        {/* Spending by Category */}
        {spendingByCategoryData.length > 0 && spendingByCategoryData[0].amount > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="mb-4">
              <h3 className="text-lg font-light text-foreground mb-1">
                {charts.spendingByCategory.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light">
                {charts.spendingByCategory.subtitle}
              </p>
            </div>
            <ChartContainer config={categoryChartConfig} className="h-[300px]">
              <BarChart data={spendingByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-lg p-6 flex items-center justify-center h-[380px]"
          >
            <div className="text-center">
              <p className="text-muted-foreground font-light mb-2">
                {charts.spendingByCategory.title}
              </p>
              <p className="text-sm text-muted-foreground">No spending data available</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-foreground">Recent Orders</h2>
          <Link href="/dashboard/buyer/orders">
            <Button variant="ghost" className="font-light">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass-card rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-light">No recent orders</p>
            <Link href="/catalog">
              <Button variant="outline" className="mt-4">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order, index) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || {
                icon: Clock,
                label: order.status,
                color: "text-muted-foreground",
              }
              return (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="glass-card rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-light text-foreground">
                            {order.orderNumber}
                          </h3>
                          <p className="text-muted-foreground font-light text-sm">
                            {order.poNumber && `PO: ${order.poNumber} • `}
                            {new Date(order.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })} • {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-muted-foreground font-light text-sm mt-1">
                            {order.sellerName}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-2 ${status.color}`}>
                            <status.icon className="h-4 w-4" />
                            <span className="text-sm font-light">{status.label}</span>
                          </div>
                          <span className="text-xl font-light text-foreground">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-light text-foreground mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/catalog">
            <div className="glass-card rounded-lg p-6 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Shop Parts</h3>
                  <p className="text-sm text-muted-foreground">Browse our catalog</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/buyer/orders">
            <div className="glass-card rounded-lg p-6 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">View Orders</h3>
                  <p className="text-sm text-muted-foreground">Track your purchases</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/buyer/settings">
            <div className="glass-card rounded-lg p-6 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Settings className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your profile</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
