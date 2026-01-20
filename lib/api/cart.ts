/**
 * Cart API endpoints
 */

import { apiClient } from './api-client'

/**
 * Cart item from API
 */
export interface CartItem {
  id: string // Cart item ID
  inventoryId: string // Seller inventory ID
  quantity: number
  product: {
    id: string // Product ID
    name: string
    oemPartNumber?: string
    manufacturer?: string
    imageUrls: string[] | null
    category: string
    subcategory: string
  }
  seller: {
    id: string
    businessName: string
  }
  pricing: {
    sellerPrice: number
    currency: string
    commission: number
    displayPrice: number
    totalPrice: number
  }
  stock: {
    available: number
    inStock: boolean
  }
  createdAt: string
  updatedAt: string
}

/**
 * Cart summary
 */
export interface CartSummary {
  itemCount: number
  totalItems: number
  subtotal: number
  totalCommission: number
  totalAmount: number
  currency: string
}

/**
 * Cart response from API
 */
export interface CartResponse {
  id: string
  buyerId: string
  items: CartItem[]
  summary: CartSummary
  createdAt: string
  updatedAt: string
}

/**
 * Add item to cart
 */
export interface AddToCartRequest {
  inventoryId: string
  quantity: number
}

/**
 * Update cart item quantity
 */
export interface UpdateCartItemRequest {
  quantity: number
}

/**
 * Add item to cart
 */
export async function addItemToCart(request: AddToCartRequest): Promise<CartResponse> {
  const response = await apiClient.post<{
    success: boolean
    message: string
    data: CartResponse
    timestamp: string
  }>('/api/buyer/cart/add', request)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Failed to add item to cart')
}

/**
 * Get cart
 */
export async function getCart(): Promise<CartResponse> {
  console.log('cart API: getCart called, making request to /api/buyer/cart')
  try {
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: CartResponse
      timestamp: string
    }>('/api/buyer/cart')

    console.log('cart API: getCart response:', response)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to retrieve cart')
  } catch (error) {
    console.error('cart API: getCart error:', error)
    throw error
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartResponse> {
  const response = await apiClient.put<{
    success: boolean
    message: string
    data: CartResponse
    timestamp: string
  }>(`/api/buyer/cart/item/${cartItemId}`, { quantity })

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Failed to update cart item')
}

/**
 * Remove item from cart
 */
export async function removeCartItem(cartItemId: string): Promise<CartResponse> {
  const response = await apiClient.delete<{
    success: boolean
    message: string
    data: CartResponse
    timestamp: string
  }>(`/api/buyer/cart/item/${cartItemId}`)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Failed to remove item from cart')
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  const response = await apiClient.delete<{
    success: boolean
    message: string
    timestamp: string
  }>('/api/buyer/cart')

  if (!response.success) {
    throw new Error(response.message || 'Failed to clear cart')
  }
}
