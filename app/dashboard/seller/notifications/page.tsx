"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Truck,
  DollarSign,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getSellerNotifications,
  markSellerNotificationAsRead,
  markAllSellerNotificationsAsRead,
  deleteSellerNotification,
  deleteAllSellerNotifications,
  type SellerNotification,
} from "@/lib/api/seller-notifications"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const notificationIcons: Record<string, typeof Package> = {
  NEW_ORDER: Package,
  ORDER_SHIPPED: Truck,
  ORDER_DELIVERED: CheckCircle2,
  RETURN_REQUESTED: RotateCcw,
  PAYOUT_PROCESSED: DollarSign,
}

const notificationColors: Record<string, string> = {
  NEW_ORDER: "text-blue-400",
  ORDER_SHIPPED: "text-accent",
  ORDER_DELIVERED: "text-green-400",
  RETURN_REQUESTED: "text-yellow-400",
  PAYOUT_PROCESSED: "text-green-400",
}

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<SellerNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getSellerNotifications(page, 50)
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
      setTotalPages(data.totalPages)
    } catch (error: any) {
      console.error('Error loading notifications:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, toast])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    if (markingAsRead.has(notificationId)) return

    setMarkingAsRead((prev) => new Set(prev).add(notificationId))
    try {
      await markSellerNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error: any) {
      console.error('Error marking as read:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      })
    } finally {
      setMarkingAsRead((prev) => {
        const next = new Set(prev)
        next.delete(notificationId)
        return next
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllSellerNotificationsAsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error: any) {
      console.error('Error marking all as read:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    if (deleting.has(notificationId)) return

    setDeleting((prev) => new Set(prev).add(notificationId))
    try {
      await deleteSellerNotification(notificationId)
      const notification = notifications.find((n) => n.id === notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive",
      })
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev)
        next.delete(notificationId)
        return next
      })
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return

    try {
      const result = await deleteAllSellerNotifications()
      setNotifications([])
      setUnreadCount(0)
      toast({
        title: "Success",
        description: `Deleted ${result.deletedCount} notification(s)`,
      })
    } catch (error: any) {
      console.error('Error deleting all notifications:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete all notifications",
        variant: "destructive",
      })
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
              Notifications
            </h1>
            <p className="text-muted-foreground font-light">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteAll}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete all
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={loadNotifications}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-light text-foreground mb-2">No notifications</h2>
          <p className="text-muted-foreground font-light">
            You're all caught up! New notifications will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const Icon = notificationIcons[notification.type] || Bell
            const color = notificationColors[notification.type] || "text-muted-foreground"
            const isMarkingAsRead = markingAsRead.has(notification.id)
            const isDeleting = deleting.has(notification.id)

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`glass-card rounded-xl p-6 ${
                  !notification.isRead ? 'border-l-4 border-l-accent' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-medium mb-1 ${
                          !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground font-light mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatTime(notification.createdAt)}</span>
                          {notification.order && (
                            <Link
                              href="/dashboard/seller/orders"
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              View Order
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isMarkingAsRead}
                          className="flex items-center gap-2"
                        >
                          {isMarkingAsRead ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              Mark as read
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={isDeleting}
                        className="flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-muted-foreground font-light">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
