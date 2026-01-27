"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getReportsDashboard } from "@/lib/api/admin-dashboard"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

const statusColors: Record<string, string> = {
  OPERATIONAL: "text-green-400",
  COMPLETED: "text-green-400",
  PASSED: "text-green-400",
  WARNING: "text-yellow-400",
  ERROR: "text-red-400",
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  OPERATIONAL: CheckCircle2,
  COMPLETED: CheckCircle2,
  PASSED: CheckCircle2,
  WARNING: AlertCircle,
  ERROR: AlertCircle,
}

export function ReportsTab() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const dashboardData = await getReportsDashboard()
        setData(dashboardData)
      } catch (err: any) {
        setError(err.message || 'Failed to load reports data')
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

  return (
    <div className="space-y-6">
      {/* User Engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">{data.userEngagement.title}</CardTitle>
            <CardDescription>{data.userEngagement.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {Object.values(data.userEngagement.metrics).map((metric: any, index: number) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30"
                >
                  <div className="text-2xl font-light text-foreground mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {metric.percentage}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">{data.systemHealth.title}</CardTitle>
            <CardDescription>{data.systemHealth.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.systemHealth.statuses.map((status: any, index: number) => {
                const Icon = statusIcons[status.status] || CheckCircle2
                const color = statusColors[status.status] || "text-muted-foreground"

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/30"
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {status.label}
                      </p>
                      {status.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(status.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${color}`}>
                      {status.status}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
