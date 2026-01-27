"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getActivityDashboard } from "@/lib/api/admin-dashboard"
import { formatDistanceToNow } from "date-fns"
import { 
  User, 
  ShoppingCart, 
  Package, 
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const activityIcons: Record<string, typeof User> = {
  LOGIN: User,
  ORDER_CREATED: ShoppingCart,
  ORDER_RECEIVED: Package,
  PRODUCT_ADDED: Package,
  STAFF_CREATED: User,
  STAFF_UPDATED: User,
  STAFF_DEACTIVATED: User,
  TIME_LOGGED: Clock,
  OTHER: FileText,
}

const activityColors: Record<string, string> = {
  ADMIN: "bg-blue-500/20 text-blue-400",
  SELLER: "bg-green-500/20 text-green-400",
  BUYER: "bg-purple-500/20 text-purple-400",
  STAFF: "bg-yellow-500/20 text-yellow-400",
}

export function ActivityTab() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const dashboardData = await getActivityDashboard()
        setData(dashboardData)
      } catch (err: any) {
        setError(err.message || 'Failed to load activity data')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
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

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">{data.liveActivity.title}</CardTitle>
            <CardDescription>{data.liveActivity.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {data.liveActivity.activities.length > 0 ? (
                data.liveActivity.activities.slice(0, 50).map((activity: any, index: number) => {
                  const Icon = activityIcons[activity.type] || AlertCircle
                  const userTypeColor = activityColors[activity.userType] || "bg-muted text-muted-foreground"

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={userTypeColor}>
                            {activity.userType}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            {activity.user}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-light">{data.recentOrders.title}</CardTitle>
            <CardDescription>{data.recentOrders.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {data.recentOrders.orders.length > 0 ? (
                data.recentOrders.orders.map((order: any, index: number) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {order.orderNumber}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.buyerName} → {order.sellerName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(order.createdAt)} • {order.itemsCount} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent orders
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
