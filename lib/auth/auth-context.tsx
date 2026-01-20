"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from './auth-utils'
import { 
  getUser, 
  isAuthenticated, 
  getUserRole,
  clearAuth as clearAuthStorage 
} from './auth-utils'
import { getCurrentUser, logout as logoutApi } from '../api/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  role: 'buyer' | 'seller' | 'admin' | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          // Try to get user from storage first (faster)
          const storedUser = getUser()
          if (storedUser) {
            setUser(storedUser)
          }
          
          // Then try to fetch fresh user data from API
          // Don't clear auth if API call fails - might be network issue
          try {
            const currentUser = await getCurrentUser()
            if (currentUser) {
              setUser(currentUser)
            } else {
              // Only clear auth if token is explicitly invalid (not just API error)
              // Keep stored user data if API fails but token exists
              console.warn('Failed to get current user, but token exists. Keeping stored user data.')
            }
          } catch (apiError: any) {
            // Only clear auth if it's actually a token/auth error (401 with token error)
            // Don't clear for network errors or other issues
            if (apiError?.status === 401 && apiError?.message?.includes('Authentication')) {
              console.warn('Token authentication failed during init, clearing auth')
              clearAuthStorage()
              setUser(null)
            } else {
              // Network or other error - keep the stored auth
              console.warn('Auth API call failed, but keeping stored auth:', apiError?.message || 'Unknown error')
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Don't clear auth on unexpected errors - might be a temporary issue
        // Only clear if we can't even check authentication
        if (typeof window === 'undefined') {
          // Server-side, can't access localStorage anyway
          setUser(null)
        }
        // On client-side, keep existing auth even if initialization has issues
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback((userData: User) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      clearAuthStorage()
      // Clear cart from localStorage/sessionStorage if needed
      // (cart will be cleared from Redux by CartLoader when isAuthenticated becomes false)
      router.push('/auth/login')
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: isAuthenticated() && user !== null,
    login,
    logout,
    refreshUser,
    role: getUserRole(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
