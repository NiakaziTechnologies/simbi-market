/**
 * Seller Notifications API endpoints
 */

import { apiClient } from './api-client'

/**
 * Notification object from API
 */
export interface SellerNotification {
  id: string
  type: 'NEW_ORDER' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'RETURN_REQUESTED' | 'PAYOUT_PROCESSED'
  title: string
  message: string
  orderId: string | null
  returnId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  order?: {
    id: string
    orderNumber: string
    totalAmount: number
    status: string
  }
}

/**
 * Notifications list response
 */
export interface SellerNotificationsListResponse {
  success: boolean
  data: {
    notifications: SellerNotification[]
    unreadCount: number
    total: number
    page: number
    totalPages: number
  }
  timestamp?: string
}

/**
 * Unread count response
 */
export interface SellerUnreadCountResponse {
  success: boolean
  data: {
    unreadCount: number
  }
  timestamp?: string
}

/**
 * Get all notifications
 */
export async function getSellerNotifications(
  page: number = 1,
  limit: number = 50
): Promise<SellerNotificationsListResponse['data']> {
  const response = await apiClient.get<SellerNotificationsListResponse>(
    `/api/seller/notifications?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || 'Failed to fetch notifications')
}

/**
 * Get unread count
 */
export async function getSellerUnreadCount(): Promise<number> {
  const response = await apiClient.get<SellerUnreadCountResponse>(
    '/api/seller/notifications/unread-count'
  )

  if (response.success && response.data) {
    return response.data.unreadCount
  }

  throw new Error(response.error || 'Failed to fetch unread count')
}

/**
 * Mark notification as read
 */
export async function markSellerNotificationAsRead(notificationId: string): Promise<void> {
  const response = await apiClient.patch<{
    success: boolean
    message: string
    timestamp?: string
  }>(`/api/seller/notifications/${notificationId}/read`)

  if (!response.success) {
    throw new Error(response.error || response.message || 'Failed to mark notification as read')
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllSellerNotificationsAsRead(): Promise<void> {
  const response = await apiClient.patch<{
    success: boolean
    message: string
    timestamp?: string
  }>('/api/seller/notifications/read-all')

  if (!response.success) {
    throw new Error(response.error || response.message || 'Failed to mark all notifications as read')
  }
}

/**
 * Delete notification
 */
export async function deleteSellerNotification(notificationId: string): Promise<void> {
  const response = await apiClient.delete<{
    success: boolean
    message: string
    timestamp?: string
  }>(`/api/seller/notifications/${notificationId}`)

  if (!response.success) {
    throw new Error(response.error || response.message || 'Failed to delete notification')
  }
}

/**
 * Delete all notifications
 */
export async function deleteAllSellerNotifications(): Promise<{
  deletedCount: number
}> {
  const response = await apiClient.delete<{
    success: boolean
    message: string
    data: {
      deletedCount: number
    }
    timestamp?: string
  }>('/api/seller/notifications/all')

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to delete all notifications')
}
