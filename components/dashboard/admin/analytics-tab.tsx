"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalyticsDashboard } from "@/lib/api/admin-dashboard"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Progress } from "@/components/ui/progress"

export function AnalyticsTab() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const dashboardData = await getAnalyticsDashboard()
        setData(dashboardData)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
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

  const productPerformanceData = data.productPerformance.categories.map((cat: any) => ({
    category: cat.category,
    orders: cat.orders,
    products: cat.products,
  }))

  const productChartConfig = productPerformanceData.reduce((acc: any, item: any, index: number) => {
    acc[item.category] = {
      label: item.category,
      color: `hsl(${index * 60}, 70%, 50%)`,
    }
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Product Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">{data.productPerformance.title}</CardTitle>
            <CardDescription>{data.productPerformance.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {productPerformanceData.length > 0 ? (
              <ChartContainer config={productChartConfig} className="h-[300px]">
                <BarChart data={productPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="category"
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
                  <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No product performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* System Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">{data.systemPerformance.title}</CardTitle>
            <CardDescription>{data.systemPerformance.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* API Response Time */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">API Response Time</span>
                  <span className="font-medium">
                    {data.systemPerformance.metrics.apiResponseTime.value}
                    {data.systemPerformance.metrics.apiResponseTime.unit}
                  </span>
                </div>
                <Progress 
                  value={data.systemPerformance.metrics.apiResponseTime.percentage} 
                  className="h-2"
                />
              </div>

              {/* System Uptime */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">System Uptime</span>
                  <span className="font-medium">
                    {data.systemPerformance.metrics.systemUptime.value}
                    {data.systemPerformance.metrics.systemUptime.unit}
                  </span>
                </div>
                <Progress 
                  value={data.systemPerformance.metrics.systemUptime.percentage} 
                  className="h-2"
                />
              </div>

              {/* Open Disputes */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Open Disputes</span>
                  <span className="font-medium">
                    {data.systemPerformance.metrics.openDisputes.value}
                    {data.systemPerformance.metrics.openDisputes.unit}
                  </span>
                </div>
                <Progress 
                  value={data.systemPerformance.metrics.openDisputes.percentage} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
