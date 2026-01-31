/**
 * Guest Orders API endpoints (for individual buyers without authentication)
 */

import { apiClient } from './api-client'

/**
 * Guest order request
 */
export interface GuestOrderRequest {
  // Buyer Information (Required)
  firstName: string
  lastName: string
  email: string
  phoneNumber: string

  // Shipping Address (Required)
  shippingAddress: {
    fullName: string
    phoneNumber: string
    addressLine1: string
    addressLine2?: string
    city: string
    province: string
    postalCode?: string
  }

  // Order Items (Required)
  items: Array<{
    inventoryId: string
    quantity: number
  }>

  // Optional Fields
  notes?: string
  currency?: "USD" | "ZWL"
}

/**
 * Order item in response
 */
export interface OrderItem {
  id: string
  inventoryId: string
  quantity: number
  unitPrice: number
  productName: string
}

/**
 * Seller information in order
 */
export interface OrderSeller {
  id: string
  businessName: string
}

/**
 * Single order in response
 */
export interface GuestOrder {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  currency: string
  isGuestOrder: boolean
  items: OrderItem[]
  seller: OrderSeller
}

/**
 * Guest order response
 */
export interface GuestOrderResponse {
  orders: GuestOrder[]
  orderNumber: string // Primary order number (first order if multiple)
}

/**
 * Create a guest order (no authentication required)
 */
export async function createGuestOrder(request: GuestOrderRequest): Promise<GuestOrderResponse> {
  // Use direct fetch call since apiClient always adds auth token
  // Import config to get base URL
  const { API_CONFIG } = await import('../config')
  const url = `${API_CONFIG.baseURL}/api/guest/orders`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // NO Authorization header for guest orders
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error: any = {
      message: errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
      status: response.status,
      data: errorData,
    }
    throw error
  }

  const data = await response.json()

  if (data.success && data.data) {
    return data.data
  }

  throw new Error(data.message || 'Failed to create guest order')
}
