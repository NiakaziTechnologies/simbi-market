/**
 * Notifications API endpoints for buyers
 */

import { apiClient } from './api-client'

/**
 * Notification type enum
 */
export type NotificationType =
  | 'ORDER_ACCEPTED'
  | 'ORDER_REJECTED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'SELLER_RESPONDED_TO_RETURN'
  | 'RETURN_REQUESTED'

/**
 * Order object in notification
 */
export interface NotificationOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
}

/**
 * Notification object
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  orderId: string | null
  returnId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  order?: NotificationOrder
}

/**
 * Notifications list response
 */
export interface NotificationsListResponse {
  success: boolean
  data: {
    notifications: Notification[]
    unreadCount: number
    total: number
    page: number
    totalPages: number
  }
  timestamp: string
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  success: boolean
  data: {
    unreadCount: number
  }
  timestamp: string
}

/**
 * Standard API response
 */
export interface StandardResponse {
  success: boolean
  message: string
  timestamp: string
}

/**
 * Delete all response
 */
export interface DeleteAllResponse {
  success: boolean
  message: string
  data: {
    deletedCount: number
  }
  timestamp: string
}

/**
 * Get notifications
 */
export async function getNotifications(page: number = 1, limit: number = 50): Promise<NotificationsListResponse['data']> {
  const response = await apiClient.get<NotificationsListResponse>(`/api/buyer/notifications?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.message || 'Failed to fetch notifications')
}

/**
 * Get unread count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<UnreadCountResponse>('/api/buyer/notifications/unread-count')
  if (response.success && response.data) {
    return response.data.unreadCount
  }
  throw new Error(response.message || 'Failed to fetch unread count')
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const response = await apiClient.patch<StandardResponse>(`/api/buyer/notifications/${notificationId}/read`, {})
  if (!response.success) {
    throw new Error(response.message || 'Failed to mark notification as read')
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await apiClient.patch<StandardResponse>('/api/buyer/notifications/read-all', {})
  if (!response.success) {
    throw new Error(response.message || 'Failed to mark all notifications as read')
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const response = await apiClient.delete<StandardResponse>(`/api/buyer/notifications/${notificationId}`)
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete notification')
  }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<number> {
  const response = await apiClient.delete<DeleteAllResponse>('/api/buyer/notifications/all')
  if (response.success && response.data) {
    return response.data.deletedCount
  }
  throw new Error(response.message || 'Failed to delete all notifications')
}
