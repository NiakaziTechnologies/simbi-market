/**
 * Component to load cart from API (authenticated buyers) or localStorage (guest users)
 */

"use client"

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../lib/auth/auth-context'
import { useCart } from '../lib/hooks/use-cart'
import { clearCart } from '../lib/features/cart-slice'

export function CartLoader() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth()
  const { loadCart } = useCart()
  const dispatch = useDispatch()

  useEffect(() => {
    // Only load cart if authentication is complete
    if (!authLoading) {
      if (isAuthenticated && role === 'buyer') {
        // Load cart from API for authenticated buyers
        loadCart()
      } else if (!isAuthenticated) {
        // Load guest cart from localStorage for non-authenticated users
        loadCart()
      } else {
        // Clear cart if authenticated but not a buyer (seller/admin)
        dispatch(clearCart())
      }
    }
  }, [isAuthenticated, authLoading, role, loadCart, dispatch])

  // This component doesn't render anything
  return null
}
