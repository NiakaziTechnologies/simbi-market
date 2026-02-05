"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  Activity,
  Server,
  FileText,
} from "lucide-react"
import { getComprehensiveDashboard } from "@/lib/api/admin-dashboard"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { formatDistanceToNow } from "date-fns"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function OverviewTab() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const dashboardData = await getComprehensiveDashboard()
        setData(dashboardData)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="glass-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error || 'Failed to load data'}</p>
        </CardContent>
      </Card>
    )
  }

  const revenueChartData = data.revenueTrends.daily.slice(-30).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    orders: item.orders,
  }))

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "#2563eb",
    },
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sellers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.totalSellers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active sellers on platform</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Buyers
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.totalBuyers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered buyers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Products listed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time orders</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-light">Revenue (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-2">
                {formatCurrency(data.revenue30Days)}
              </div>
              <p className="text-sm text-muted-foreground">Last 30 days revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-light">Gross Merchandise Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-2">
                {formatCurrency(data.gmv)}
              </div>
              <p className="text-sm text-muted-foreground">Total GMV</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-light">Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-2">
                {formatCurrency(data.avgOrderValue)}
              </div>
              <p className="text-sm text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">Revenue Trend (Last 30 Days)</CardTitle>
            <CardDescription>Daily revenue and order count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
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
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-light flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">API Uptime</span>
                  <span className="font-medium">{data.performance.apiUptime}%</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Avg Response Time</span>
                  <span className="font-medium">{data.performance.avgResponseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">System Health</span>
                  <span className={`font-medium ${
                    data.performance.systemHealth === 'HEALTHY' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {data.performance.systemHealth}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-light flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium">{data.compliance.complianceScore}%</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Open Disputes</span>
                  <span className="font-medium">{data.disputes.openDisputes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security Alerts</span>
                  <span className="font-medium">
                    {data.security.tier1Alerts + data.security.tier2Alerts + data.security.tier3Alerts}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
