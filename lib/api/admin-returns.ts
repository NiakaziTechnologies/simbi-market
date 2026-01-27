/**
 * Admin Returns API endpoints
 */

import { apiClient } from './api-client'

/**
 * Return Request
 */
export interface AdminReturn {
  id: string
  orderId: string
  disputeType: string
  requestType: string
  returnReason: string
  status: string
  buyerDescription: string
  sellerResponse: string | null
  adminNotes: string | null
  assignedAdminId: string | null
  buyerEvidenceUrls: string[] | null
  sellerEvidenceUrls: string[] | null
  eccBaseline: any | null
  resolutionDate: string | null
  resolutionOutcome: string | null
  isFaultBased: boolean
  faultClassification: string | null
  sloTargetDate: string
  sloStatus: string | null
  sloBreached: boolean
  returnLabelTrackingNumber: string | null
  returnLabelUrl: string | null
  returnLogisticsCost: number | null
  logisticsCostChargedTo: string | null
  exchangeOrderId: string | null
  sellerReceiptConfirmed: boolean
  sellerReceiptConfirmedAt: string | null
  inspectionCompletedAt: string | null
  tier1RerouteTriggered: boolean
  tier1RerouteSellerId: string | null
  tier1RerouteCostDifference: number | null
  metadata: any | null
  createdAt: string
  updatedAt: string
  buyerId: string
  sellerId: string
  order: {
    id: string
    orderNumber: string
    buyerId: string
    sellerId: string
    addressId: string
    poNumber: string | null
    costCenter: string | null
    subtotal: number
    shippingCost: number
    platformCommission: number
    discountAmount: number
    couponCode: string | null
    totalAmount: number
    currency: string
    status: string
    paymentStatus: string
    items: Array<{
      id: string
      orderId: string
      inventoryId: string
      quantity: number
      unitPrice: number
      displayPrice: number
      commission: number
      inventory: {
        id: string
        masterProduct: {
          id: string
          name: string
        }
        sellerSku: string
        sellerPrice: number
        currency: string
      }
    }>
  }
  buyer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  seller: {
    id: string
    businessName: string
    email: string
  }
}

/**
 * Returns list response
 */
export interface AdminReturnsListResponse {
  success: boolean
  data: {
    returns: AdminReturn[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  timestamp?: string
}

/**
 * Returns report response
 */
export interface AdminReturnsReportResponse {
  success: boolean
  data: {
    period: {
      startDate: string
      endDate: string
    }
    summary: {
      totalReturns: number
      pendingClassification: number
      pendingInspection: number
      pendingSellerReceipt: number
      avgResolutionTime: number
    }
    breakdown: {
      byStatus: Record<string, number>
      byFaultClassification: Record<string, number>
      byReason: Record<string, number>
      byType: Record<string, number>
    }
    financial: {
      totalLogisticsCost: number
      logisticsCostByFault: Record<string, {
        count: number
        totalCost: number
      }>
    }
    sellerPerformance: Array<{
      sellerId: string
      sellerName: string
      sri: number
      totalReturns: number
      sellerFaultReturns: number
      totalLogisticsCost: number
      sellerFaultCost: number
    }>
    trends: {
      returnsByDate: Record<string, number>
    }
  }
  timestamp?: string
}

/**
 * Get pending returns
 */
export async function getPendingReturns(page: number = 1, limit: number = 20): Promise<AdminReturnsListResponse['data']> {
  const response = await apiClient.get<AdminReturnsListResponse>(
    `/api/admin/compliance/returns/pending-review?page=${page}&limit=${limit}`
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch pending returns')
}

/**
 * Get all returns
 */
export async function getAllReturns(page: number = 1, limit: number = 20): Promise<AdminReturnsListResponse['data']> {
  const response = await apiClient.get<AdminReturnsListResponse>(
    `/api/admin/compliance/returns?page=${page}&limit=${limit}`
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch returns')
}

/**
 * Get returns report
 */
export async function getReturnsReport(): Promise<AdminReturnsReportResponse['data']> {
  const response = await apiClient.get<AdminReturnsReportResponse>('/api/admin/compliance/returns/report')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch returns report')
}

/**
 * Classify Fault Request
 */
export interface ClassifyFaultRequest {
  faultClassification: string
  reason: string
  internalNotes?: string
}

/**
 * Classify Fault Response
 */
export interface ClassifyFaultResponse {
  success: boolean
  message: string
  data: AdminReturn
  timestamp?: string
}

/**
 * Classify fault for a return
 */
export async function classifyFault(
  returnId: string,
  request: ClassifyFaultRequest
): Promise<ClassifyFaultResponse['data']> {
  const response = await apiClient.post<ClassifyFaultResponse>(
    `/api/admin/compliance/returns/${returnId}/classify-fault`,
    request
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to classify fault')
}
