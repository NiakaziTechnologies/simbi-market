"use client"

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSellerAuth } from '@/lib/auth/seller-auth-context'
import { Loader2 } from 'lucide-react'
import { getAuthToken } from '@/lib/auth/auth-utils'

interface SellerAuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[] // Optional: specific roles allowed for this route
}

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/reset-password']

export function SellerAuthGuard({ children, allowedRoles }: SellerAuthGuardProps) {
  const { seller, staff, userType, role, loading } = useSellerAuth()
  const pathname = usePathname()
  const router = useRouter()
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    // Don't do anything if still loading
    if (loading) return
    
    // Don't redirect if we've already redirected
    if (hasRedirectedRef.current) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
    
    // Only check seller routes
    if (!pathname?.startsWith('/dashboard/seller')) return
    
    // Check if user has a token but is not seller/staff (might be buyer/admin)
    const token = getAuthToken()
    const sellerUserType = localStorage.getItem('sellerUserType')
    
    // If user has token but is not seller/staff, redirect them away from seller dashboard
    if (token && !sellerUserType && !seller && !staff) {
      // User is authenticated but not seller/staff - redirect to their appropriate dashboard based on role
      hasRedirectedRef.current = true
      
      // Get role from main auth context (stored in localStorage as 'auth_user')
      try {
        const authUserStr = localStorage.getItem('auth_user')
        if (authUserStr) {
          const authUser = JSON.parse(authUserStr)
          if (authUser.role === 'buyer') {
            router.replace('/dashboard/buyer')
          } else if (authUser.role === 'admin') {
            router.replace('/dashboard/admin')
          } else {
            router.replace('/dashboard/buyer') // Default
          }
        } else {
          router.replace('/dashboard/buyer') // Default if no role found
        }
      } catch {
        router.replace('/dashboard/buyer') // Default on error
      }
      return
    }

    // If not authenticated and trying to access protected route, redirect to login
    if (!isPublicRoute && !seller && !staff && !token) {
      hasRedirectedRef.current = true
      const returnUrl = encodeURIComponent(pathname || '/dashboard/seller')
      router.replace(`/auth/login?returnUrl=${returnUrl}`)
      return
    }

    // Check role-based access if allowedRoles is specified
    if (allowedRoles && allowedRoles.length > 0 && !isPublicRoute) {
      // Sellers always have access
      if (userType === 'seller') {
        return
      }

      // Staff must have one of the allowed roles
      if (userType === 'staff' && role) {
        if (!allowedRoles.includes(role)) {
          // Redirect to dashboard if access denied
          hasRedirectedRef.current = true
          router.replace('/dashboard/seller')
          return
        }
      } else if (userType === 'staff' && !role) {
        // Staff without role, redirect to dashboard
        hasRedirectedRef.current = true
        router.replace('/dashboard/seller')
        return
      }
    }
  }, [seller, staff, userType, role, loading, pathname, router, allowedRoles])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
  const token = getAuthToken()
  const sellerUserType = localStorage.getItem('sellerUserType')
  
  // If user has token but is not seller/staff (might be buyer/admin), show redirecting
  if (!isPublicRoute && !seller && !staff) {
    if (token && !sellerUserType) {
      // User is authenticated but not seller/staff - redirecting to their dashboard
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      )
    }
    // Not authenticated at all - redirecting to login
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && !isPublicRoute) {
    if (userType === 'staff' && role && !allowedRoles.includes(role)) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Access Denied</p>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
