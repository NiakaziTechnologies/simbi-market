"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'buyer' | 'seller' | 'admin'
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated, redirect to login
      if (!isAuthenticated) {
        // Store the attempted URL to redirect back after login
        const returnUrl = encodeURIComponent(pathname || '/')
        router.push(`${redirectTo}?returnUrl=${returnUrl}`)
        return
      }

      // Check role if required
      if (requiredRole && role !== requiredRole) {
        // User doesn't have required role, redirect to their dashboard
        if (role === 'buyer') {
          router.push('/dashboard/buyer')
        } else if (role === 'seller') {
          router.push('/dashboard/seller')
        } else if (role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
        return
      }
    }
  }, [isAuthenticated, isLoading, role, requiredRole, router, pathname, redirectTo])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  // Not authenticated or wrong role, don't render children
  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
