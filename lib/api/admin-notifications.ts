/**
 * Admin Notifications API endpoints
 */

import { apiClient } from './api-client'

/**
 * Admin notification type enum
 */
export type AdminNotificationType =
  | 'ORDER_ACCEPTED'
  | 'RETURN_REQUESTED'
  | 'SELLER_RESPONDED_TO_RETURN'
  | 'SELLER_UPLOADED_EVIDENCE'

/**
 * Order object in notification
 */
export interface AdminNotificationOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
}

/**
 * Admin notification object
 */
export interface AdminNotification {
  id: string
  type: AdminNotificationType
  title: string
  message: string
  orderId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  order?: AdminNotificationOrder
}

/**
 * Admin notifications list response
 */
export interface AdminNotificationsListResponse {
  success: boolean
  data: {
    notifications: AdminNotification[]
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
export interface AdminUnreadCountResponse {
  success: boolean
  data: {
    unreadCount: number
  }
  timestamp: string
}

/**
 * Standard API response
 */
export interface AdminStandardResponse {
  success: boolean
  message: string
  timestamp: string
}

/**
 * Delete all response
 */
export interface AdminDeleteAllResponse {
  success: boolean
  message: string
  data: {
    deletedCount: number
  }
  timestamp: string
}

/**
 * Get admin notifications
 */
export async function getAdminNotifications(page: number = 1, limit: number = 50): Promise<AdminNotificationsListResponse['data']> {
  const response = await apiClient.get<AdminNotificationsListResponse>(`/api/admin/notifications?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.message || 'Failed to fetch notifications')
}

/**
 * Get admin unread count
 */
export async function getAdminUnreadCount(): Promise<number> {
  const response = await apiClient.get<AdminUnreadCountResponse>('/api/admin/notifications/unread-count')
  if (response.success && response.data) {
    return response.data.unreadCount
  }
  throw new Error(response.message || 'Failed to fetch unread count')
}

/**
 * Mark admin notification as read
 */
export async function markAdminNotificationAsRead(notificationId: string): Promise<void> {
  const response = await apiClient.patch<AdminStandardResponse>(`/api/admin/notifications/${notificationId}/read`, {})
  if (!response.success) {
    throw new Error(response.message || 'Failed to mark notification as read')
  }
}

/**
 * Mark all admin notifications as read
 */
export async function markAllAdminNotificationsAsRead(): Promise<void> {
  const response = await apiClient.patch<AdminStandardResponse>('/api/admin/notifications/read-all', {})
  if (!response.success) {
    throw new Error(response.message || 'Failed to mark all notifications as read')
  }
}

/**
 * Delete admin notification
 */
export async function deleteAdminNotification(notificationId: string): Promise<void> {
  const response = await apiClient.delete<AdminStandardResponse>(`/api/admin/notifications/${notificationId}`)
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete notification')
  }
}

/**
 * Delete all admin notifications
 */
export async function deleteAllAdminNotifications(): Promise<number> {
  const response = await apiClient.delete<AdminDeleteAllResponse>('/api/admin/notifications/all')
  if (response.success && response.data) {
    return response.data.deletedCount
  }
  throw new Error(response.message || 'Failed to delete all notifications')
}
