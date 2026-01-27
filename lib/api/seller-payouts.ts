/**
 * Seller Payouts API endpoints
 */

import { apiClient } from './api-client'

/**
 * Pending payout order
 */
export interface PendingPayoutOrder {
  id: string
  orderNumber: string
  totalAmount: number
  currency: string
  deliveredDate: string
  grossAmount: number
  platformCommission: number
  gatewayFee: number
  netAmount: number
}

/**
 * Pending payouts summary
 */
export interface PendingPayoutsSummary {
  totalPaid: number
  totalPlatformFee: number
  totalSellerAmount: number
  totalPaidOut: number
  pendingAmount: number
  ordersCount: number
}

/**
 * Pending payouts response
 */
export interface PendingPayoutsResponse {
  success: boolean
  data: {
    summary: PendingPayoutsSummary
    orders: PendingPayoutOrder[]
  }
  timestamp?: string
}

/**
 * Payout order information
 */
export interface PayoutOrder {
  id: string
  orderNumber: string
  totalAmount: number
  currency: string
  deliveredDate: string
}

/**
 * Payout details
 */
export interface PayoutDetails {
  grossAmount: number
  platformCommission: number
  gatewayFee: number
  netAmount: number
  currency: string
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED'
}

/**
 * Payment information
 */
export interface PaymentInfo {
  scheduledDate: string
  processedDate: string | null
  bankReference: string | null
}

/**
 * Payout history item
 */
export interface PayoutHistoryItem {
  id: string
  order: PayoutOrder
  payout: PayoutDetails
  payment: PaymentInfo
  createdAt: string
  updatedAt: string
}

/**
 * Payout history summary
 */
export interface PayoutHistorySummary {
  totalPayouts: number
  completedCount: number
  processingCount: number
  totalRecords: number
}

/**
 * Payout history response
 */
export interface PayoutHistoryResponse {
  success: boolean
  data: {
    payouts: PayoutHistoryItem[]
    summary: PayoutHistorySummary
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  timestamp?: string
}

/**
 * Summary payout item
 */
export interface SummaryPayoutItem {
  id: string
  amount: number
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED'
  processedDate: string
  bankReference: string | null
}

/**
 * Payouts summary data
 */
export interface PayoutsSummaryData {
  summary: {
    totalPaid: number
    totalPlatformFee: number
    totalSellerAmount: number
    totalPaidOut: number
    pendingAmount: number
    ordersCount: number
    completedOrders: number
    pendingOrders: number
  }
  recentPayouts: SummaryPayoutItem[]
  period: string
}

/**
 * Payouts summary response
 */
export interface PayoutsSummaryResponse {
  success: boolean
  data: PayoutsSummaryData
  timestamp?: string
}

/**
 * Get pending payouts
 */
export async function getPendingPayouts(): Promise<PendingPayoutsResponse['data']> {
  const response = await apiClient.get<PendingPayoutsResponse>(
    '/api/seller/payouts/pending'
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch pending payouts')
}

/**
 * Get payout history
 */
export async function getPayoutHistory(
  page: number = 1,
  limit: number = 20
): Promise<PayoutHistoryResponse['data']> {
  const response = await apiClient.get<PayoutHistoryResponse>(
    `/api/seller/payouts/history?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch payout history')
}

/**
 * Get payouts summary
 */
export async function getPayoutsSummary(days: number = 30): Promise<PayoutsSummaryData> {
  const response = await apiClient.get<PayoutsSummaryResponse>(
    `/api/seller/payouts/summary?days=${days}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch payouts summary')
}
