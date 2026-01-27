"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { 
  BarChart3, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { getBusinessIntelligence } from "@/lib/api/admin-dashboard"
import { format } from "date-fns"

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

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

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Default to last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  const [dateFrom, setDateFrom] = useState(format(thirtyDaysAgo, 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'))

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const businessData = await getBusinessIntelligence(dateFrom, dateTo)
      setData(businessData)
    } catch (err: any) {
      setError(err.message || 'Failed to load reports data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dateFrom, dateTo])

  const handleDateChange = () => {
    if (dateFrom && dateTo && new Date(dateFrom) <= new Date(dateTo)) {
      loadData()
    }
  }

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  }

  const salesByCategoryConfig = {
    amount: {
      label: "Sales Amount",
    },
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-light text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground font-light">
            Business intelligence and analytics
          </p>
        </motion.div>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-light text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground font-light">
            Business intelligence and analytics
          </p>
        </motion.div>
        <Card className="glass-card border-border">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadData} className="mt-4" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const revenueChartData = data?.monthlyRevenueTrend?.data?.map((item: any) => ({
    month: item.month,
    revenue: item.revenue,
  })) || []

  const pieChartData = data?.salesByCategory?.data?.map((item: any) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    orderCount: item.orderCount,
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2 flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Reports
            </h1>
            <p className="text-muted-foreground font-light">
              Business intelligence and analytics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Date Range Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Range
            </CardTitle>
            <CardDescription>Select the period for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleDateChange} className="mt-6">
                  Apply
                </Button>
              </div>
            </div>
            {data?.period && (
              <div className="mt-4 text-sm text-muted-foreground">
                Period: {format(new Date(data.period.from), 'PP')} - {format(new Date(data.period.to), 'PP')}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      {data?.kpis && (
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(data.kpis.totalRevenue.value)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {data.kpis.totalRevenue.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm ${
                      data.kpis.totalRevenue.changeType === 'positive'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {data.kpis.totalRevenue.change > 0 ? '+' : ''}
                    {data.kpis.totalRevenue.change.toFixed(2)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs previous period
                  </span>
                </div>
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
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatNumber(data.kpis.totalOrders.value)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {data.kpis.totalOrders.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm ${
                      data.kpis.totalOrders.changeType === 'positive'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {data.kpis.totalOrders.change > 0 ? '+' : ''}
                    {data.kpis.totalOrders.change.toFixed(2)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs previous period
                  </span>
                </div>
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
                  Avg Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(data.kpis.avgOrderValue.value)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {data.kpis.avgOrderValue.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm ${
                      data.kpis.avgOrderValue.changeType === 'positive'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {data.kpis.avgOrderValue.change > 0 ? '+' : ''}
                    {data.kpis.avgOrderValue.change.toFixed(2)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs previous period
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">
                {data?.monthlyRevenueTrend?.title || 'Monthly Revenue Trend'}
              </CardTitle>
              <CardDescription>
                {data?.monthlyRevenueTrend?.subtitle || 'Revenue performance over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80" />
              ) : revenueChartData.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ChartContainer config={revenueChartConfig} className="h-80">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: payload[0].color }}
                                  />
                                  <span className="text-sm font-medium">
                                    {formatCurrency(payload[0].value as number)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {payload[0].payload.month}
                                </p>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">
                {data?.salesByCategory?.title || 'Sales by Category'}
              </CardTitle>
              <CardDescription>
                {data?.salesByCategory?.subtitle || 'Product category performance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80" />
              ) : pieChartData.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="space-y-4">
                  <ChartContainer config={salesByCategoryConfig} className="h-80">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(2)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: payload[0].color }}
                                    />
                                    <span className="text-sm font-medium">{data.name}</span>
                                  </div>
                                  <div className="text-sm">
                                    <div>Amount: {formatCurrency(data.value)}</div>
                                    <div>Percentage: {data.percentage.toFixed(2)}%</div>
                                    <div>Orders: {data.orderCount}</div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                  
                  {/* Category Breakdown Table */}
                  <div className="mt-4 space-y-2">
                    {data?.salesByCategory?.data?.map((item: any, index: number) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <div className="font-medium text-sm">{item.category}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.orderCount} orders
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">{formatCurrency(item.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
