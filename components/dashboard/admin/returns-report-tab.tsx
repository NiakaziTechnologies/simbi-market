"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  Package, 
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react"
import { getReturnsReport } from "@/lib/api/admin-returns"
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function ReturnsReportTab() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const reportData = await getReturnsReport()
        setData(reportData)
      } catch (err: any) {
        setError(err.message || 'Failed to load returns report')
      } finally {
        setIsLoading(false)
      }
    }
    loadReport()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="glass-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error || 'Failed to load data'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const statusData = Object.entries(data.breakdown.byStatus || {}).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count as number,
  }))

  const faultData = Object.entries(data.breakdown.byFaultClassification || {}).map(([fault, count]) => ({
    name: fault.replace(/_/g, ' '),
    value: count as number,
  }))

  const reasonData = Object.entries(data.breakdown.byReason || {}).map(([reason, count]) => ({
    name: reason.replace(/_/g, ' '),
    value: count as number,
  }))

  const trendsData = Object.entries(data.trends.returnsByDate || {}).map(([date, count]) => ({
    date: format(new Date(date), "MMM dd"),
    returns: count as number,
  }))

  const sellerPerformanceData = data.sellerPerformance || []

  const statusChartConfig = {
    value: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  }

  const trendsChartConfig = {
    returns: {
      label: "Returns",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Returns
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.summary.totalReturns}</div>
              <p className="text-xs text-muted-foreground mt-1">All return requests</p>
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
                Pending Classification
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.summary.pendingClassification}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting classification</p>
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
                Pending Inspection
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">{data.summary.pendingInspection}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting inspection</p>
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
                Avg Resolution Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-foreground">
                {data.summary.avgResolutionTime > 0 ? `${data.summary.avgResolutionTime} days` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average time to resolve</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Period Information */}
      {data.period && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">Report Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {format(new Date(data.period.startDate), "PP")} - {format(new Date(data.period.endDate), "PP")}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Returns by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">Returns by Status</CardTitle>
              <CardDescription>Distribution of return statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ChartContainer config={statusChartConfig} className="h-80">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="font-medium">{payload[0].payload.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Count: {payload[0].value}
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No status data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Returns by Fault Classification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">Returns by Fault Classification</CardTitle>
              <CardDescription>Fault-based distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {faultData.length > 0 ? (
                <ChartContainer config={statusChartConfig} className="h-80">
                  <BarChart data={faultData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No fault classification data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Returns Trends */}
      {trendsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">Returns Trends</CardTitle>
              <CardDescription>Returns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendsChartConfig} className="h-80">
                <BarChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="returns" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-light flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>Logistics costs and financial breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Total Logistics Cost</div>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(data.financial.totalLogisticsCost)}
                </div>
              </div>
              {Object.keys(data.financial.logisticsCostByFault || {}).length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-3">Cost by Fault Classification</div>
                  <div className="space-y-2">
                    {Object.entries(data.financial.logisticsCostByFault).map(([fault, info]: [string, any]) => (
                      <div key={fault} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div>
                          <div className="font-medium">{fault.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-muted-foreground">{info.count} return(s)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(info.totalCost)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seller Performance */}
      {sellerPerformanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seller Performance
              </CardTitle>
              <CardDescription>Seller return rates and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Seller</th>
                      <th className="text-left p-3 text-sm font-medium">SRI</th>
                      <th className="text-left p-3 text-sm font-medium">Total Returns</th>
                      <th className="text-left p-3 text-sm font-medium">Seller Fault</th>
                      <th className="text-right p-3 text-sm font-medium">Total Cost</th>
                      <th className="text-right p-3 text-sm font-medium">Seller Fault Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerPerformanceData.map((seller: any) => (
                      <tr key={seller.sellerId} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{seller.sellerName}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {seller.sri}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{seller.totalReturns}</td>
                        <td className="p-3 text-sm">{seller.sellerFaultReturns}</td>
                        <td className="p-3 text-right text-sm">{formatCurrency(seller.totalLogisticsCost)}</td>
                        <td className="p-3 text-right text-sm">{formatCurrency(seller.sellerFaultCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Breakdown by Reason */}
      {reasonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">Returns by Reason</CardTitle>
              <CardDescription>Common return reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reasonData.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="font-medium">{item.name}</div>
                    <Badge variant="outline">{item.value} return(s)</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
