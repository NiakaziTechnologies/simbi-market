"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '../api/api-client'
import { getAuthToken, setAuthToken, clearAuth } from './auth-utils'

/**
 * Seller Profile
 */
export interface SellerProfile {
  id: string
  email: string
  businessName: string
  tradingName?: string | null
  businessAddress: string
  contactNumber: string
  tin: string
  status: string
  [key: string]: any
}

/**
 * Staff Profile
 */
export interface StaffProfile {
  id: string
  sellerId: string
  email: string
  firstName: string
  lastName: string
  department: string
  position: string
  role: 'STOCK_MANAGER' | 'DISPATCHER' | 'FINANCE_VIEW' | 'FULL_ACCESS'
  status: string
  userType: 'staff'
  [key: string]: any
}

/**
 * Seller Auth Context Type
 */
interface SellerAuthContextType {
  seller: SellerProfile | null
  staff: StaffProfile | null
  userType: 'seller' | 'staff' | null
  role: string | null // Staff role or null for sellers
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined)

export function SellerAuthProvider({ children }: { children: React.ReactNode }) {
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [staff, setStaff] = useState<StaffProfile | null>(null)
  const [userType, setUserType] = useState<'seller' | 'staff' | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUserType = localStorage.getItem('sellerUserType') as 'seller' | 'staff' | null
        const storedRole = localStorage.getItem('sellerUserRole')
        const storedToken = getAuthToken()
        const storedSeller = localStorage.getItem('sellerProfile')
        const storedStaff = localStorage.getItem('staffProfile')

        // Only initialize if we have a token AND sellerUserType is set
        // This prevents buyer/admin users from initializing seller auth
        if (storedToken && storedUserType) {
          setAccessToken(storedToken)

          if (storedUserType === 'staff' && storedStaff) {
            try {
              const staffData = JSON.parse(storedStaff)
              setStaff(staffData)
              setUserType('staff')
              setRole(storedRole || staffData.role || null)
            } catch (e) {
              console.error('Failed to parse staff profile:', e)
            }
          } else if (storedUserType === 'seller') {
            // Try to get seller profile from API if not in localStorage
            if (storedSeller) {
              try {
                const sellerData = JSON.parse(storedSeller)
                setSeller(sellerData)
                setUserType('seller')
                setRole(null)
              } catch (e) {
                console.error('Failed to parse seller profile:', e)
              }
            } else {
              // Fetch seller profile from API
              try {
                const response = await apiClient.get<{
                  success: boolean
                  data: SellerProfile
                }>('/api/seller/auth/profile')
                
                if (response.success && response.data) {
                  setSeller(response.data)
                  setUserType('seller')
                  setRole(null)
                  localStorage.setItem('sellerProfile', JSON.stringify(response.data))
                }
              } catch (error) {
                console.error('Failed to fetch seller profile:', error)
              }
            }
          }
        } else {
          // No seller/staff token or userType, mark as not loading
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  /**
   * Login function - tries seller login first, then staff login
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      // Try seller login first
      try {
        const sellerResponse = await apiClient.post<{
          success: boolean
          data?: {
            seller: SellerProfile
            accessToken: string
            userType: 'seller'
          }
          message?: string
        }>('/api/seller/auth/login', { email, password })

        if (sellerResponse.success && sellerResponse.data?.seller) {
          const { seller: sellerData, accessToken: token } = sellerResponse.data
          
          // Set seller state
          setSeller(sellerData)
          setStaff(null)
          setUserType('seller')
          setRole(null)
          setAccessToken(token)
          
          // Store in localStorage
          setAuthToken(token)
          localStorage.setItem('sellerUserType', 'seller')
          localStorage.setItem('sellerProfile', JSON.stringify(sellerData))
          localStorage.removeItem('staffProfile')
          localStorage.removeItem('sellerUserRole')
          
          return { success: true, message: 'Login successful' }
        }
      } catch (sellerError: any) {
        // Seller login failed, try staff login
        console.log('Seller login failed, trying staff login...')
      }

      // Try staff login
      const staffResponse = await apiClient.post<{
        success: boolean
        data?: {
          user: StaffProfile
          accessToken: string
          userType: 'staff'
        }
        message?: string
      }>('/api/staff/login', { email, password })

      if (staffResponse.success && staffResponse.data?.user) {
        const { user: staffData, accessToken: token } = staffResponse.data
        
        // Set staff state
        setStaff(staffData)
        setSeller(null)
        setUserType('staff')
        setRole(staffData.role)
        setAccessToken(token)
        
        // Store in localStorage
        setAuthToken(token)
        localStorage.setItem('sellerUserType', 'staff')
        localStorage.setItem('sellerUserRole', staffData.role)
        localStorage.setItem('staffProfile', JSON.stringify(staffData))
        localStorage.removeItem('sellerProfile')
        
        return { success: true, message: 'Login successful' }
      }

      return { success: false, message: staffResponse.message || 'Login failed' }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials.' 
      }
    }
  }, [])

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    setSeller(null)
    setStaff(null)
    setUserType(null)
    setRole(null)
    setAccessToken(null)
    
    // Clear localStorage
    clearAuth()
    localStorage.removeItem('sellerProfile')
    localStorage.removeItem('staffProfile')
    localStorage.removeItem('sellerUserType')
    localStorage.removeItem('sellerUserRole')
    
    router.push('/auth/login')
  }, [router])

  /**
   * Refresh profile
   */
  const refreshProfile = useCallback(async () => {
    if (!accessToken) return

    try {
      if (userType === 'seller') {
        const response = await apiClient.get<{
          success: boolean
          data: SellerProfile
        }>('/api/seller/auth/profile')
        
        if (response.success && response.data) {
          setSeller(response.data)
          localStorage.setItem('sellerProfile', JSON.stringify(response.data))
        }
      } else if (userType === 'staff') {
        const response = await apiClient.get<{
          success: boolean
          data: StaffProfile
        }>('/api/staff/profile')
        
        if (response.success && response.data) {
          setStaff(response.data)
          setRole(response.data.role)
          localStorage.setItem('staffProfile', JSON.stringify(response.data))
          localStorage.setItem('sellerUserRole', response.data.role)
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }, [accessToken, userType])

  const value: SellerAuthContextType = {
    seller,
    staff,
    userType,
    role,
    accessToken,
    loading,
    login,
    logout,
    refreshProfile,
  }

  return <SellerAuthContext.Provider value={value}>{children}</SellerAuthContext.Provider>
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext)
  if (context === undefined) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider')
  }
  return context
}
