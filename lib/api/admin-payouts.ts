/**
 * Admin Payouts API endpoints
 */

import { apiClient } from './api-client'

/**
 * Pending Payout Order
 */
export interface PendingPayoutOrder {
  orderId: string
  orderNumber: string
  seller: {
    id: string
    businessName: string
    email: string
  }
  paidAmount: number
  platformCommission: number
  sellerNetAmount: number
  paidOutAmount: number
  pendingAmount: number
  currency: string
  paymentDate: string
  deliveryDate: string
  items: Array<{
    productName: string
    partNumber: string
    quantity: number
  }>
}

/**
 * Pending Payout Seller Summary
 */
export interface PendingPayoutSeller {
  seller: {
    id: string
    businessName: string
    email: string
  }
  ordersCount: number
  totalPending: number
}

/**
 * Pending Payouts Response
 */
export interface PendingPayoutsResponse {
  success: boolean
  data: {
    orders: PendingPayoutOrder[]
    sellers: PendingPayoutSeller[]
    summary: {
      totalSellers: number
      totalOrders: number
      totalPaid: number
      totalPlatformFee: number
      totalSellerAmount: number
      totalPaidOut: number
      totalPendingPayouts: number
    }
  }
  timestamp?: string
}

/**
 * Payout History Item
 */
export interface PayoutHistoryItem {
  id: string
  seller: {
    id: string
    businessName: string
    email: string
  }
  order: {
    id: string
    orderNumber: string
    totalAmount: number
    currency: string
    deliveredDate: string
    payment: {
      amount: number
      paidAt: string
    }
  }
  payout: {
    grossAmount: number
    platformCommission: number
    gatewayFee: number
    netAmount: number
    currency: string
    status: string
  }
  payment: {
    scheduledDate: string
    processedDate: string
    bankReference: string | null
  }
  createdAt: string
  updatedAt: string
}

/**
 * Payout History Response
 */
export interface PayoutHistoryResponse {
  success: boolean
  data: {
    payouts: PayoutHistoryItem[]
    summary: {
      totalPayouts: number
      totalPlatformFee: number
      totalGross: number
      totalRecords: number
      statusCounts: Record<string, number>
    }
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
 * Process Payout Request
 */
export interface ProcessPayoutRequest {
  orderIds: string[]
  bankReference: string
  notes?: string
}

/**
 * Process Payout Response
 */
export interface ProcessPayoutResponse {
  success: boolean
  message: string
  data: {
    seller: {
      id: string
      businessName: string
      email: string
    }
    payout: {
      amount: number
      totalPending: number
      remainingPending: number
      isFullyPaid: boolean
      bankReference: string
      notes: string | null
      processedAt: string
    }
    orders: Array<{
      orderId: string
      orderNumber: string
      amount: number
      status: string
      remaining: number
    }>
    selectedOrderIds: string[]
  }
  timestamp?: string
}

/**
 * Get pending payouts
 */
export async function getPendingPayouts(): Promise<PendingPayoutsResponse['data']> {
  const response = await apiClient.get<PendingPayoutsResponse>('/api/admin/payouts/pending')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch pending payouts')
}

/**
 * Get payout history
 */
export async function getPayoutHistory(page: number = 1, limit: number = 20): Promise<PayoutHistoryResponse['data']> {
  const response = await apiClient.get<PayoutHistoryResponse>(
    `/api/admin/payouts/history?page=${page}&limit=${limit}`
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch payout history')
}

/**
 * Process payout
 */
export async function processPayout(request: ProcessPayoutRequest): Promise<ProcessPayoutResponse['data']> {
  const response = await apiClient.post<ProcessPayoutResponse>('/api/admin/payouts/pay', request)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to process payout')
}
