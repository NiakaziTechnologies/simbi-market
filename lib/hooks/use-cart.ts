/**
 * Custom hook for cart operations with authentication checks
 */

"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useAuth } from '../auth/auth-context'
import { addItemToCart, getCart, updateCartItemQuantity, removeCartItem, clearCart as clearCartApi, type CartItem as ApiCartItem, type CartSummary } from '../api/cart'
import { setCartItems, setCartLoading, updateCartItem, clearCart as clearCartAction } from '../features/cart-slice'
import type { Part } from '../features/parts-slice'

/**
 * Helper to convert API cart item to Redux cart item
 */
function apiCartItemToCartItem(apiItem: ApiCartItem): Part & { quantity: number; cartItemId: string; inventoryId: string } {
  const firstImage = apiItem.product.imageUrls && apiItem.product.imageUrls.length > 0
    ? apiItem.product.imageUrls[0]
    : '/placeholder.svg'
  
  // Normalize image URL
  const normalizeImageUrl = (url: string): string => {
    if (url.startsWith('//')) {
      return `https:${url}`
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return url
  }

  return {
    id: apiItem.product.id,
    name: apiItem.product.name,
    category: apiItem.product.category || apiItem.product.subcategory || '',
    price: apiItem.pricing.displayPrice,
    image: normalizeImageUrl(firstImage),
    description: apiItem.product.name, // API doesn't provide full description in cart
    compatibility: [],
    inStock: apiItem.stock.inStock,
    brand: apiItem.product.manufacturer,
    sku: apiItem.product.oemPartNumber,
    partCategory: apiItem.product.subcategory || apiItem.product.category,
    images: apiItem.product.imageUrls ? apiItem.product.imageUrls.map(normalizeImageUrl) : undefined,
    oemPartNumber: apiItem.product.oemPartNumber,
    sellerId: apiItem.seller.id,
    sellerName: apiItem.seller.businessName,
    quantity: apiItem.quantity,
    cartItemId: apiItem.id,
    inventoryId: apiItem.inventoryId,
  }
}

/**
 * Custom hook for cart operations
 */
export function useCart() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()

  /**
   * Check authentication and redirect if not logged in
   */
  const ensureAuthenticated = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
      return false
    }
    return true
  }, [isAuthenticated, router])

  /**
   * Add item to cart (with authentication check)
   */
  const addToCart = useCallback(async (part: Part, quantity: number = 1) => {
    if (!ensureAuthenticated()) {
      return false
    }

    if (!part.inventoryId) {
      console.error('Product missing inventoryId, cannot add to cart')
      return false
    }

    try {
      dispatch(setCartLoading(true))
      const cartResponse = await addItemToCart({
        inventoryId: part.inventoryId,
        quantity,
      })

      // Update Redux store with API cart data
      const cartItems = cartResponse.items.map(apiCartItemToCartItem)
      dispatch(setCartItems({
        items: cartItems,
        summary: cartResponse.summary,
      }))

      return true
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      // Show error message to user
      alert(error.message || 'Failed to add item to cart')
      return false
    } finally {
      dispatch(setCartLoading(false))
    }
  }, [ensureAuthenticated, dispatch])

  /**
   * Load cart from API
   */
  const loadCart = useCallback(async () => {
    console.log('useCart: loadCart called, isAuthenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      // Clear cart if not authenticated
      console.log('useCart: Not authenticated, clearing cart')
      dispatch(clearCartAction())
      return
    }

    try {
      console.log('useCart: Fetching cart from API...')
      dispatch(setCartLoading(true))
      const cartResponse = await getCart()
      console.log('useCart: Cart API response:', cartResponse)
      
      // Update Redux store with API cart data
      const cartItems = cartResponse.items.map(apiCartItemToCartItem)
      console.log('useCart: Mapped cart items:', cartItems)
      dispatch(setCartItems({
        items: cartItems,
        summary: cartResponse.summary,
      }))
      console.log('useCart: Cart loaded successfully')
    } catch (error: any) {
      console.error('useCart: Error loading cart:', error)
      // Don't show error if cart is just empty
      if (error.status !== 404) {
        console.error('useCart: Failed to load cart:', error.message)
      }
    } finally {
      dispatch(setCartLoading(false))
    }
  }, [isAuthenticated, dispatch])

  /**
   * Update cart item quantity
   */
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!ensureAuthenticated()) {
      return false
    }

    try {
      dispatch(setCartLoading(true))
      const cartResponse = await updateCartItemQuantity(cartItemId, quantity)

      // Update Redux store with API cart data
      const cartItems = cartResponse.items.map(apiCartItemToCartItem)
      dispatch(setCartItems({
        items: cartItems,
        summary: cartResponse.summary,
      }))

      return true
    } catch (error: any) {
      console.error('Error updating cart item:', error)
      alert(error.message || 'Failed to update cart item')
      return false
    } finally {
      dispatch(setCartLoading(false))
    }
  }, [ensureAuthenticated, dispatch])

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!ensureAuthenticated()) {
      return false
    }

    try {
      dispatch(setCartLoading(true))
      const cartResponse = await removeCartItem(cartItemId)

      // Update Redux store with API cart data
      const cartItems = cartResponse.items.map(apiCartItemToCartItem)
      dispatch(setCartItems({
        items: cartItems,
        summary: cartResponse.summary,
      }))

      return true
    } catch (error: any) {
      console.error('Error removing cart item:', error)
      alert(error.message || 'Failed to remove cart item')
      return false
    } finally {
      dispatch(setCartLoading(false))
    }
  }, [ensureAuthenticated, dispatch])

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    if (!ensureAuthenticated()) {
      return false
    }

    try {
      dispatch(setCartLoading(true))
      await clearCartApi()

      // Clear Redux store
      dispatch(clearCartAction())

      return true
    } catch (error: any) {
      console.error('Error clearing cart:', error)
      alert(error.message || 'Failed to clear cart')
      return false
    } finally {
      dispatch(setCartLoading(false))
    }
  }, [ensureAuthenticated, dispatch])

  return {
    addToCart,
    loadCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
}
