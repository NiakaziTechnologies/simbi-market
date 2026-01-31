/**
 * Custom hook for cart operations with support for both authenticated and guest carts
 */

"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../auth/auth-context'
import { addItemToCart, getCart, updateCartItemQuantity, removeCartItem, clearCart as clearCartApi, type CartItem as ApiCartItem, type CartSummary } from '../api/cart'
import { setCartItems, setCartLoading, updateCartItem, clearCart as clearCartAction, addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateQuantity as updateQuantityAction, setGuestCartItems } from '../features/cart-slice'
import type { Part, CartItem } from '../features/parts-slice'
import type { RootState } from '../store'

const GUEST_CART_KEY = 'guest_cart'

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
 * Save guest cart to localStorage
 */
function saveGuestCartToLocalStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify({
      items,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Failed to save guest cart to localStorage:', error)
  }
}

/**
 * Load guest cart from localStorage
 */
function loadGuestCartFromLocalStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY)
    if (!cartData) return []
    const parsed = JSON.parse(cartData)
    return parsed.items || []
  } catch (error) {
    console.error('Failed to load guest cart from localStorage:', error)
    return []
  }
}

/**
 * Clear guest cart from localStorage
 */
function clearGuestCartFromLocalStorage(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(GUEST_CART_KEY)
  } catch (error) {
    console.error('Failed to clear guest cart from localStorage:', error)
  }
}

/**
 * Custom hook for cart operations
 */
export function useCart() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useAuth()
  const { isGuestCart } = useSelector((state: RootState) => state.cart)

  /**
   * Add item to cart (works for both authenticated and guest users)
   */
  const addToCart = useCallback(async (part: Part, quantity: number = 1) => {
    if (!part.inventoryId) {
      console.error('Product missing inventoryId, cannot add to cart')
      return false
    }

    // If authenticated AND has a valid user, use API cart
    // Otherwise, use guest cart (localStorage)
    if (isAuthenticated && user) {
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

        dispatch(setCartLoading(false))
        return true
      } catch (error: any) {
        console.error('Error adding to cart:', error)
        dispatch(setCartLoading(false))
        // If API call fails with 401 (authentication error), fall back to guest cart
        if (error?.status === 401 || error?.message?.includes('Authentication')) {
          console.warn('API cart failed with auth error, falling back to guest cart')
          // Fall through to guest cart logic below
        } else {
          alert(error.message || 'Failed to add item to cart')
          return false
        }
      }
    }
    
    // Guest user - use localStorage cart (or fallback from failed API call)
    try {
      dispatch(setCartLoading(true))
        
        // Get current cart items
        const currentItems = loadGuestCartFromLocalStorage()
        
        // Check if item already exists
        const existingItemIndex = currentItems.findIndex(
          (item) => item.inventoryId === part.inventoryId
        )

        let updatedItems: CartItem[]
        if (existingItemIndex >= 0) {
          // Update quantity
          updatedItems = [...currentItems]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          }
        } else {
          // Add new item
          const newItem: CartItem = {
            ...part,
            quantity,
            inventoryId: part.inventoryId!,
          }
          updatedItems = [...currentItems, newItem]
        }

        // Save to localStorage
        saveGuestCartToLocalStorage(updatedItems)
        
        // Update Redux store
        dispatch(setGuestCartItems(updatedItems))

        return true
      } catch (error: any) {
        console.error('Error adding to guest cart:', error)
        alert(error.message || 'Failed to add item to cart')
        return false
      } finally {
        dispatch(setCartLoading(false))
      }
  }, [isAuthenticated, user, dispatch])

  /**
   * Load cart (from API if authenticated, from localStorage if guest)
   */
  const loadCart = useCallback(async () => {
    console.log('useCart: loadCart called, isAuthenticated:', isAuthenticated)
    
    if (isAuthenticated) {
      // Load from API for authenticated users
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
    } else {
      // Load from localStorage for guest users
      console.log('useCart: Loading guest cart from localStorage...')
      const guestItems = loadGuestCartFromLocalStorage()
      dispatch(setGuestCartItems(guestItems))
      console.log('useCart: Guest cart loaded:', guestItems.length, 'items')
    }
  }, [isAuthenticated, dispatch])

  /**
   * Update cart item quantity (works for both authenticated and guest users)
   */
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (isAuthenticated && !isGuestCart) {
      // Authenticated user - use API
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
    } else {
      // Guest user - update localStorage
      try {
        dispatch(setCartLoading(true))
        const currentItems = loadGuestCartFromLocalStorage()
        const itemIndex = currentItems.findIndex(
          (item) => item.id === cartItemId || item.cartItemId === cartItemId
        )

        if (itemIndex < 0) {
          throw new Error('Item not found in cart')
        }

        const updatedItems = [...currentItems]
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedItems.splice(itemIndex, 1)
        } else {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity,
          }
        }

        saveGuestCartToLocalStorage(updatedItems)
        dispatch(setGuestCartItems(updatedItems))

        return true
      } catch (error: any) {
        console.error('Error updating guest cart item:', error)
        alert(error.message || 'Failed to update cart item')
        return false
      } finally {
        dispatch(setCartLoading(false))
      }
    }
  }, [isAuthenticated, isGuestCart, dispatch])

  /**
   * Remove item from cart (works for both authenticated and guest users)
   */
  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (isAuthenticated && !isGuestCart) {
      // Authenticated user - use API
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
    } else {
      // Guest user - update localStorage
      try {
        dispatch(setCartLoading(true))
        const currentItems = loadGuestCartFromLocalStorage()
        const updatedItems = currentItems.filter(
          (item) => item.id !== cartItemId && item.cartItemId !== cartItemId
        )

        saveGuestCartToLocalStorage(updatedItems)
        dispatch(setGuestCartItems(updatedItems))

        return true
      } catch (error: any) {
        console.error('Error removing guest cart item:', error)
        alert(error.message || 'Failed to remove cart item')
        return false
      } finally {
        dispatch(setCartLoading(false))
      }
    }
  }, [isAuthenticated, isGuestCart, dispatch])

  /**
   * Clear entire cart (works for both authenticated and guest users)
   */
  const clearCart = useCallback(async () => {
    if (isAuthenticated && !isGuestCart) {
      // Authenticated user - use API
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
    } else {
      // Guest user - clear localStorage
      try {
        dispatch(setCartLoading(true))
        clearGuestCartFromLocalStorage()
        dispatch(clearCartAction())
        return true
      } catch (error: any) {
        console.error('Error clearing guest cart:', error)
        return false
      } finally {
        dispatch(setCartLoading(false))
      }
    }
  }, [isAuthenticated, isGuestCart, dispatch])

  return {
    addToCart,
    loadCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
}
