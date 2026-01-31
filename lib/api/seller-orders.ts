/**
 * Seller Orders API endpoints
 */

import { apiClient } from './api-client'

/**
 * Buyer information
 */
export interface OrderBuyer {
  id: string
  email: string
  firstName: string
  lastName: string
  companyName: string | null
}

/**
 * Shipping address
 */
export interface OrderShippingAddress {
  id: string
  fullName: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
}

/**
 * Seller order
 */
export interface SellerOrder {
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
  exchangeRate: number | null
  exchangeRateTimestamp: string | null
  status: string
  paymentStatus: string
  sellerAcceptedAt: string | null
  sellerRejectedAt: string | null
  rejectionReason: string | null
  estimatedDeliveryDate: string | null
  actualDeliveryDate: string | null
  ipAddress: string | null
  userAgent: string | null
  driverId: string | null
  dispatchNotes: string | null
  dispatchedAt: string | null
  dispatchedBy: string | null
  eccBaselineUploaded: boolean
  eccBaselineUploadedAt: string | null
  eccBaselineUrls: string[] | null
  isGuestOrder: boolean
  guestAccessToken: string | null
  mobileNumber: string | null
  paymentToken: string | null
  guestFirstName: string | null
  guestLastName: string | null
  guestEmail: string | null
  guestPhoneNumber: string | null
  createdAt: string
  updatedAt: string
  buyer: OrderBuyer | null
  shippingAddress: OrderShippingAddress | null
}

/**
 * Seller orders list response
 */
export interface SellerOrdersListResponse {
  success: boolean
  data: SellerOrder[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

/**
 * Payment information
 */
export interface PaymentInfo {
  totalToBePaid: number
  paid: number
  remaining: number
  isFullyPaid: boolean
  isPartiallyPaid: boolean
  hasNoPayment: boolean
}

/**
 * Payment details
 */
export interface PaymentDetails {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  paidAt: string | null
  createdAt: string
}

/**
 * Payment history entry
 */
export interface PaymentHistoryEntry {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  paidAt: string
  createdAt: string
  notes: string | null
}

/**
 * Order payment response
 */
export interface OrderPaymentResponse {
  success: boolean
  data: {
    order: {
      id: string
      orderNumber: string
      status: string
      paymentStatus: string
      currency: string
    }
    payment: PaymentInfo
    paymentDetails: PaymentDetails | null
    paymentHistory: PaymentHistoryEntry[]
    buyer: {
      id: string
      firstName: string
      lastName: string
      companyName: string | null
      email: string
    }
    seller: {
      id: string
      businessName: string
      email: string
    }
  }
  timestamp?: string
}

/**
 * Update order status request
 */
export interface UpdateOrderStatusRequest {
  status: "ACCEPTED" | "REJECTED"
  rejectionReason?: string
}

/**
 * Update order status response
 */
export interface UpdateOrderStatusResponse {
  success: boolean
  message: string
  data: SellerOrder
}

/**
 * Get seller orders
 */
export async function getSellerOrders(): Promise<SellerOrdersListResponse['data']> {
  const response = await apiClient.get<SellerOrdersListResponse>(
    `/api/seller/orders`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch orders')
}

/**
 * Get order payment information
 */
export async function getOrderPayment(orderId: string): Promise<OrderPaymentResponse['data']> {
  const response = await apiClient.get<OrderPaymentResponse>(
    `/api/orders/${orderId}/payment`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch payment information')
}

/**
 * Update order status (accept or reject)
 */
export async function updateOrderStatus(
  orderId: string,
  request: UpdateOrderStatusRequest
): Promise<UpdateOrderStatusResponse['data']> {
  const response = await apiClient.patch<UpdateOrderStatusResponse>(
    `/api/seller/orders/${orderId}/status`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to update order status')
}
