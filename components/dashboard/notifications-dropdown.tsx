"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  type Notification,
} from "@/lib/api/notifications"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

const notificationIcons: Record<string, typeof Package> = {
  ORDER_ACCEPTED: CheckCircle2,
  ORDER_REJECTED: XCircle,
  ORDER_SHIPPED: Truck,
  ORDER_DELIVERED: Package,
  SELLER_RESPONDED_TO_RETURN: AlertCircle,
  RETURN_REQUESTED: AlertCircle,
}

const notificationColors: Record<string, string> = {
  ORDER_ACCEPTED: "text-green-400",
  ORDER_REJECTED: "text-red-400",
  ORDER_SHIPPED: "text-blue-400",
  ORDER_DELIVERED: "text-green-400",
  SELLER_RESPONDED_TO_RETURN: "text-yellow-400",
  RETURN_REQUESTED: "text-yellow-400",
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<Set<string>>(new Set())

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getNotifications(1, 20)
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error: any) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (error: any) {
      console.error('Error loading unread count:', error)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()

    // Poll for unread count every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [loadNotifications, loadUnreadCount])

  // Reload notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, loadNotifications])

  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (markingAsRead.has(notificationId)) return

    setMarkingAsRead((prev) => new Set(prev).add(notificationId))
    try {
      await markNotificationAsRead(notificationId)
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
    } finally {
      setMarkingAsRead((prev) => {
        const next = new Set(prev)
        next.delete(notificationId)
        return next
      })
    }
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error: any) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (deleting.has(notificationId)) return

    setDeleting((prev) => new Set(prev).add(notificationId))
    try {
      await deleteNotification(notificationId)
      const notification = notifications.find((n) => n.id === notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error)
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev)
        next.delete(notificationId)
        return next
      })
    }
  }

  const handleDeleteAll = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete all notifications?')) return

    try {
      await deleteAllNotifications()
      setNotifications([])
      setUnreadCount(0)
    } catch (error: any) {
      console.error('Error deleting all notifications:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[600px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleDeleteAll}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  const color = notificationColors[notification.type] || "text-muted-foreground"
                  const isMarkingAsRead = markingAsRead.has(notification.id)
                  const isDeleting = deleting.has(notification.id)

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-0.5 ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.createdAt)}
                                </span>
                                {notification.order && (
                                  <Link
                                    href={`/dashboard/buyer/orders`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-accent hover:underline flex items-center gap-1"
                                  >
                                    View Order
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                disabled={isMarkingAsRead}
                              >
                                {isMarkingAsRead ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark read
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-destructive hover:text-destructive"
                              onClick={(e) => handleDelete(notification.id, e)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/dashboard/buyer/notifications">
                <Button variant="ghost" className="w-full text-xs" onClick={() => setIsOpen(false)}>
                  View all notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
