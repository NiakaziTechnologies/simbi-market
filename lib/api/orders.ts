/**
 * Orders API endpoints
 */

import { apiClient } from './api-client'

/**
 * Order item for creating order
 */
export interface OrderItem {
  productId: string // Inventory ID
  quantity: number
}

/**
 * Shipping address for order
 */
export interface ShippingAddress {
  fullName?: string
  phoneNumber?: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode?: string
  country?: string
  isDefault?: boolean
}

/**
 * Create order from items request
 */
export interface CreateOrderRequest {
  items: OrderItem[]
  shippingAddressId?: string
  shippingAddress?: ShippingAddress
  poNumber?: string
  costCenter?: string
  notes?: string
  couponCode?: string
}

/**
 * Create order from cart request
 */
export interface CreateOrderFromCartRequest {
  shippingAddressId?: string
  shippingAddress?: ShippingAddress
  poNumber?: string
  costCenter?: string
  notes?: string
  couponCode?: string
}

/**
 * Order summary in response
 */
export interface OrderSummary {
  id: string
  orderNumber: string
  sellerId: string
  sellerName: string
  totalAmount: number
  itemCount: number
  status: string
}

/**
 * Create order response
 */
export interface CreateOrderResponse {
  orders: OrderSummary[]
  totalOrders: number
  totalAmount: number
}

/**
 * Create order from items
 */
export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await apiClient.post<{
    success: boolean
    message: string
    data: CreateOrderResponse
  }>('/api/buyer/orders', request)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Failed to create order')
}

/**
 * Create order from cart
 */
export async function createOrderFromCart(request: CreateOrderFromCartRequest = {}): Promise<CreateOrderResponse> {
  const response = await apiClient.post<{
    success: boolean
    message: string
    data: CreateOrderResponse
  }>('/api/buyer/orders/from-cart', request)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Failed to create order from cart')
}

/**
 * Reorder from previous order
 */
export async function reorder(orderId: string, request: Partial<CreateOrderFromCartRequest> = {}): Promise<CreateOrderResponse> {
  const response = await apiClient.post<{
    success: boolean
    message: string
    data: CreateOrderResponse
  }>(`/api/buyer/orders/${orderId}/reorder`, request)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Failed to reorder')
}

/**
 * Order item from API response
 */
export interface OrderItemResponse {
  id: string
  orderId: string
  inventoryId: string
  quantity: number
  unitPrice: number
  displayPrice: number
  commission: number
  createdAt: string
  inventory: {
    id: string
    sellerId: string
    masterProductId: string
    sellerPrice: number
    currency: string
    quantity: number
    condition: string
    sellerImages: string[]
    sellerNotes: string
    sellerSku: string
    masterProduct: {
      id: string
      masterPartId: string
      oemPartNumber: string
      name: string
      description: string
      manufacturer: string
      imageUrls: string[]
      vehicleCompatibility: {
        make: string
        year: string
        model: string
      }
    }
  }
}

/**
 * Shipping address from API response
 */
export interface ShippingAddressResponse {
  id: string
  buyerId: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Order from API response
 */
export interface OrderResponse {
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
  sellerAcceptedAt: string | null
  sellerRejectedAt: string | null
  rejectionReason: string | null
  estimatedDeliveryDate: string | null
  actualDeliveryDate: string | null
  createdAt: string
  updatedAt: string
  items: OrderItemResponse[]
  shippingAddress: ShippingAddressResponse
}

/**
 * Orders list response
 */
export interface OrdersListResponse {
  success: boolean
  data: OrderResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Payment details response
 */
export interface PaymentDetailsResponse {
  success: boolean
  data: {
    order: {
      id: string
      orderNumber: string
      status: string
      paymentStatus: string
      currency: string
      createdAt: string
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
  }
}

/**
 * Get buyer orders
 */
export async function getOrders(page: number = 1, limit: number = 20): Promise<OrdersListResponse> {
  const response = await apiClient.get<OrdersListResponse>(`/api/buyer/orders?page=${page}&limit=${limit}`)
  return response
}

/**
 * Get order payment details
 */
export async function getOrderPayment(orderId: string): Promise<PaymentDetailsResponse['data']> {
  const response = await apiClient.get<PaymentDetailsResponse>(`/api/buyer/orders/${orderId}/payment`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error('Failed to fetch payment details')
}
