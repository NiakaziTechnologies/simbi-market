/**
 * Component to load cart from API when user is authenticated
 */

"use client"

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../lib/auth/auth-context'
import { useCart } from '../lib/hooks/use-cart'
import { clearCart } from '../lib/features/cart-slice'

export function CartLoader() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { loadCart } = useCart()
  const dispatch = useDispatch()

  useEffect(() => {
    // Only load cart if authentication is complete
    if (!authLoading) {
      if (isAuthenticated) {
        // Load cart from API if authenticated
        loadCart()
      } else {
        // Clear cart if not authenticated
        dispatch(clearCart())
      }
    }
  }, [isAuthenticated, authLoading, loadCart, dispatch])

  // This component doesn't render anything
  return null
}
