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
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
  deleteAllAdminNotifications,
  type AdminNotification,
} from "@/lib/api/admin-notifications"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

const notificationIcons: Record<string, typeof Package> = {
  ORDER_ACCEPTED: CheckCircle2,
  RETURN_REQUESTED: AlertCircle,
  SELLER_RESPONDED_TO_RETURN: FileText,
  SELLER_UPLOADED_EVIDENCE: FileText,
}

const notificationColors: Record<string, string> = {
  ORDER_ACCEPTED: "text-green-400",
  RETURN_REQUESTED: "text-yellow-400",
  SELLER_RESPONDED_TO_RETURN: "text-blue-400",
  SELLER_UPLOADED_EVIDENCE: "text-blue-400",
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
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
      const data = await getAdminNotifications(page, 50)
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
      await markAdminNotificationAsRead(notificationId)
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
      await markAllAdminNotificationsAsRead()
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
      await deleteAdminNotification(notificationId)
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
    if (!confirm('Are you sure you want to delete all notifications? This cannot be undone.')) return

    try {
      const deletedCount = await deleteAllAdminNotifications()
      setNotifications([])
      setUnreadCount(0)
      toast({
        title: "Success",
        description: `Deleted ${deletedCount} notification(s)`,
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
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
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadNotifications} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleDeleteAll} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card rounded-lg p-12 text-center">
          <Bell className="h-16 w-16 text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-light text-foreground mb-2">No notifications</h2>
          <p className="text-muted-foreground font-light">You're all caught up!</p>
        </div>
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
                className={`glass-card rounded-lg p-6 ${
                  !notification.isRead ? 'border-l-4 border-l-accent' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-light ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-muted-foreground font-light text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTime(notification.createdAt)}</span>
                          {notification.order && (
                            <Link
                              href="/dashboard/admin/orders"
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              View Order
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isMarkingAsRead}
                          >
                            {isMarkingAsRead ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Mark read
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(notification.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-muted-foreground font-light">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
