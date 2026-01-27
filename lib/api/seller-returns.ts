/**
 * Seller Returns API endpoints
 */

import { apiClient } from './api-client'

/**
 * Seller return/dispute
 */
export interface SellerReturn {
  id: string
  orderId: string
  disputeType: string
  requestType: "RETURN" | "EXCHANGE" | "DISPUTE"
  returnReason: string
  status: string
  buyerDescription: string
  sellerResponse: string | null
  adminNotes: string | null
  assignedAdminId: string | null
  buyerEvidenceUrls: string[]
  sellerEvidenceUrls: string[] | null
  eccBaseline: any
  resolutionDate: string | null
  resolutionOutcome: string | null
  isFaultBased: boolean
  faultClassification: "BUYER_FAULT" | "SELLER_FAULT" | "NO_FAULT" | "UNCLASSIFIED" | null
  sloTargetDate: string
  sloStatus: string | null
  sloBreached: boolean
  returnLabelTrackingNumber: string | null
  returnLabelUrl: string | null
  returnLogisticsCost: number
  logisticsCostChargedTo: "BUYER" | "SELLER"
  exchangeOrderId: string | null
  sellerReceiptConfirmed: boolean
  sellerReceiptConfirmedAt: string | null
  inspectionCompletedAt: string | null
  tier1RerouteTriggered: boolean
  tier1RerouteSellerId: string | null
  tier1RerouteCostDifference: number | null
  metadata: any
  createdAt: string
  updatedAt: string
  buyerId: string
  sellerId: string
  order: {
    id: string
    orderNumber: string
    buyerId: string
    sellerId: string
    subtotal: number
    shippingCost: number
    platformCommission: number
    discountAmount: number
    totalAmount: number
    currency: string
    status: string
    paymentStatus: string
    sellerAcceptedAt: string | null
    estimatedDeliveryDate: string | null
    actualDeliveryDate: string | null
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
        masterProductId: string
        sellerPrice: number
        currency: string
        masterProduct: {
          id: string
          name: string
          oemPartNumber: string
        }
      }
    }>
  }
  buyer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

/**
 * Seller returns list response
 */
export interface SellerReturnsListResponse {
  success: boolean
  data: {
    returns: SellerReturn[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

/**
 * Submit response request
 */
export interface SubmitResponseRequest {
  response: string
}

/**
 * Submit response response
 */
export interface SubmitResponseResponse {
  success: boolean
  message: string
  data: {
    disputeId: string
    sellerResponse: string
    respondedAt: string
  }
}

/**
 * Get seller returns
 */
export async function getSellerReturns(
  page: number = 1,
  limit: number = 20
): Promise<SellerReturnsListResponse['data']> {
  const response = await apiClient.get<SellerReturnsListResponse>(
    `/api/seller/returns?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch returns')
}

/**
 * Submit seller response to return
 */
export async function submitSellerResponse(
  returnId: string,
  request: SubmitResponseRequest
): Promise<SubmitResponseResponse['data']> {
  const response = await apiClient.post<SubmitResponseResponse>(
    `/api/seller/returns/${returnId}/respond`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to submit response')
}
