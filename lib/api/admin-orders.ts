/**
 * Admin Orders API endpoints
 */

import { apiClient } from './api-client'

/**
 * Order item
 */
export interface AdminOrderItem {
  id: string
  quantity: number
  unitPrice: number
  displayPrice: number
  inventory: {
    id: string
    sellerSku: string
    masterProduct: {
      id: string
      name: string
      oemPartNumber: string
      manufacturer: string
    }
    seller: {
      id: string
      businessName: string
    }
  }
}

/**
 * Driver
 */
export interface AdminDriver {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  licenseNumber?: string
  vehicleType?: string
  vehiclePlate?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  _count?: {
    orders?: number
  }
}

/**
 * Admin Order
 */
export interface AdminOrder {
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
  createdAt: string
  updatedAt: string
  buyer: {
    id: string
    firstName: string
    lastName: string
    companyName: string | null
    email: string
  }
  shippingAddress: {
    id: string
    fullName: string
    addressLine1: string
    city: string
    province: string
    addressLine2?: string
    postalCode?: string
    country?: string
  }
  items: AdminOrderItem[]
  driver: AdminDriver | null
  _count: {
    items: number
  }
}

/**
 * Orders list response
 */
export interface AdminOrdersListResponse {
  success: boolean
  data: {
    orders: AdminOrder[]
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
 * Detailed Admin Order (from detail endpoint)
 */
export interface AdminOrderDetail extends AdminOrder {
  buyer: {
    id: string
    firstName: string
    lastName: string
    companyName: string | null
    email: string
    phoneNumber?: string
  }
  seller: {
    id: string
    email: string
    businessName: string
    tradingName?: string
    businessAddress?: string
    contactNumber?: string
    tin?: string
    registrationNumber?: string
    bankAccountName?: string
    bankAccountNumber?: string
    bankName?: string
    status?: string
    sriScore?: number
    createdAt?: string
    updatedAt?: string
  }
  items: Array<AdminOrderItem & {
    orderId: string
    inventoryId: string
    commission: number
    inventory: {
      id: string
      sellerId: string
      masterProductId: string
      sellerPrice: number
      currency: string
      quantity: number
      lowStockThreshold: number
      isActive: boolean
      condition: string
      reorderPoint: number
      sellerImages?: string[]
      sellerNotes?: string
      sellerSku: string
      masterProduct: {
        id: string
        name: string
        oemPartNumber: string
        manufacturer: string
      }
      seller: {
        id: string
        businessName: string
        email: string
        tradingName?: string
        contactNumber?: string
        businessAddress?: string
        tin?: string
        registrationNumber?: string
        status?: string
      }
    }
  }>
  payment: any | null
  shipment: any | null
}

/**
 * Order detail response
 */
export interface AdminOrderDetailResponse {
  success: boolean
  data: AdminOrderDetail
  timestamp?: string
}

/**
 * Payment info
 */
export interface AdminOrderPaymentInfo {
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    currency: string
  }
  payment: {
    totalToBePaid: number
    paid: number
    remaining: number
    isFullyPaid: boolean
    isPartiallyPaid: boolean
    hasNoPayment: boolean
  }
  paymentDetails: any | null
  paymentHistory: any[]
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

/**
 * Payment info response
 */
export interface AdminOrderPaymentResponse {
  success: boolean
  data: AdminOrderPaymentInfo
  timestamp?: string
}

/**
 * Get admin orders
 */
export async function getAdminOrders(page: number = 1, limit: number = 20): Promise<AdminOrdersListResponse['data']> {
  const response = await apiClient.get<AdminOrdersListResponse>(`/api/admin/orders?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Failed to fetch orders')
}

/**
 * Get admin order details
 */
export async function getAdminOrderDetail(orderId: string): Promise<AdminOrderDetail> {
  const response = await apiClient.get<AdminOrderDetailResponse>(`/api/admin/orders/${orderId}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Failed to fetch order details')
}

/**
 * Get admin order payment info
 */
export async function getAdminOrderPayment(orderId: string): Promise<AdminOrderPaymentInfo> {
  const response = await apiClient.get<AdminOrderPaymentResponse>(`/api/admin/orders/${orderId}/payment`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Failed to fetch payment info')
}

/**
 * Dispatch order request
 */
export interface DispatchOrderRequest {
  driverId: string
  estimatedDeliveryDate?: string
  dispatchNotes?: string
}

/**
 * Dispatch order response
 */
export interface DispatchOrderResponse {
  success: boolean
  message: string
  data: {
    id: string
    orderNumber: string
    status: string
    driverId: string
    estimatedDeliveryDate: string | null
    dispatchNotes: string | null
    dispatchedAt: string
    dispatchedBy: string
    totalAmount: number
    createdAt: string
    updatedAt: string
    driver: {
      id: string
      firstName: string
      lastName: string
      phoneNumber: string
      vehicleType: string | null
      vehiclePlate: string | null
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
    }
  }
  timestamp?: string
}

/**
 * Dispatch an order
 */
export async function dispatchOrder(orderId: string, request: DispatchOrderRequest): Promise<DispatchOrderResponse['data']> {
  const response = await apiClient.patch<DispatchOrderResponse>(`/api/admin/orders/${orderId}/dispatch`, request)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || response.message || 'Failed to dispatch order')
}

/**
 * Mark order as delivered response
 */
export interface MarkOrderDeliveredResponse {
  success: boolean
  message: string
  data: AdminOrderDetail
  timestamp?: string
}

/**
 * Mark an order as delivered
 */
export async function markOrderDelivered(orderId: string): Promise<AdminOrderDetail> {
  const response = await apiClient.patch<MarkOrderDeliveredResponse>(`/api/admin/orders/${orderId}/mark-delivered`, {})
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || response.message || 'Failed to mark order as delivered')
}

/**
 * Record payment request
 */
export interface RecordPaymentRequest {
  amount: number
  notes?: string
}

/**
 * Record payment response
 */
export interface RecordPaymentResponse {
  success: boolean
  message: string
  data: {
    payment: {
      id: string
      orderId: string
      amount: number
      amountPaid: number
      currency: string
      paymentMethod: string
      status: string
      paidAt: string
      partialPayments: Array<{
        date: string
        notes: string
        amount: number
        recordedBy: string
      }>
    }
    order: {
      id: string
      orderNumber: string
      status: string
      paymentStatus: string
      totalAmount: number
      paidAmount: number
      remainingBalance: number
    }
    accounting: {
      entriesCreated: number
      summary: {
        totalPayment: number
        commission: number
        netRevenue: number
        newBalance: number
      }
      commission: number
      netRevenue: number
    }
  }
  timestamp?: string
}

/**
 * Record payment for an order
 */
export async function recordPayment(orderId: string, request: RecordPaymentRequest): Promise<RecordPaymentResponse['data']> {
  const response = await apiClient.post<RecordPaymentResponse>(`/api/admin/orders/${orderId}/record-payment`, request)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || response.message || 'Failed to record payment')
}
