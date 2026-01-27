/**
 * Authentication API endpoints
 */

import { apiClient } from './api-client'
import { setAuthToken, setUser, type User, type AuthTokens } from '../auth/auth-utils'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // Note: Login doesn't require token, but apiClient will handle it (won't add token if none exists)
  // Use apiClient.post but it will skip adding Authorization header since no token exists yet
  const response = await apiClient.post<{
    success: boolean
    data: {
      userType: 'buyer' | 'seller' | 'admin' | 'staff'
      accessToken: string
      refreshToken?: string
      expiresIn?: number | string // Can be number (seconds) or string like "7d"
      user?: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        businessName?: string
        role?: string // Staff role: STOCK_MANAGER, DISPATCHER, FINANCE_VIEW, FULL_ACCESS
        [key: string]: any
      }
      // Additional user fields may be included in response
      id?: string
      email?: string
      name?: string
      [key: string]: any // Allow for additional fields
    }
    message?: string
  }>('/api/auth/login', credentials)

  if (response.success && response.data) {
    const { userType, accessToken, refreshToken, expiresIn, user: userData } = response.data
    
    // Handle expiresIn if it's a string like "7d"
    let expiresInSeconds: number | undefined
    if (typeof expiresIn === 'string') {
      // Parse "7d" format to seconds
      const match = expiresIn.match(/(\d+)([dhms])/)
      if (match) {
        const value = parseInt(match[1], 10)
        const unit = match[2]
        const multipliers: Record<string, number> = {
          's': 1,
          'm': 60,
          'h': 3600,
          'd': 86400,
        }
        expiresInSeconds = value * (multipliers[unit] || 1)
      }
    } else {
      expiresInSeconds = expiresIn
    }
    
    // Map userType from API to role for internal use
    const userTypeToRole: Record<string, 'buyer' | 'seller' | 'admin'> = {
      'buyer': 'buyer',
      'seller': 'seller',
      'admin': 'admin',
      'staff': 'seller', // Map staff to seller role for seller dashboard access
    }
    
    const role = userTypeToRole[userType] || 'buyer'
    
    // Extract user information
    const userId = userData?.id || response.data.id || ''
    const userEmail = userData?.email || response.data.email || credentials.email
    const userName = userData?.businessName 
      || (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : null)
      || response.data.name 
      || userEmail.split('@')[0]
    
    // Create user object from response data
    const user: User = {
      id: userId,
      email: userEmail,
      name: userName,
      role: role,
    }
    
    // Store token
    setAuthToken(accessToken, expiresInSeconds)
    
    // Store user data
    setUser(user)
    
    // Store userType and role for seller/staff dashboard
    if (userType === 'seller' || userType === 'staff') {
      localStorage.setItem('sellerUserType', userType)
      
      if (userType === 'staff' && userData) {
        // Store full staff profile with role
        const staffRole = userData.role || ''
        localStorage.setItem('sellerUserRole', staffRole)
        localStorage.setItem('staffProfile', JSON.stringify({
          ...userData,
          userType: 'staff', // Ensure userType is set
        }))
        localStorage.removeItem('sellerProfile')
      } else if (userType === 'seller') {
        // Store seller profile if available
        if (userData) {
          localStorage.setItem('sellerProfile', JSON.stringify(userData))
        }
        localStorage.removeItem('staffProfile')
        localStorage.removeItem('sellerUserRole')
      }
    } else {
      // Clear seller/staff data for other user types
      localStorage.removeItem('sellerUserType')
      localStorage.removeItem('sellerUserRole')
      localStorage.removeItem('sellerProfile')
      localStorage.removeItem('staffProfile')
    }
    
    return {
      user: user,
      tokens: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: expiresInSeconds,
      },
    }
  }

  throw new Error(response.message || 'Login failed')
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout')
  } catch (error: any) {
    // Even if logout fails on server, clear local auth
    // Only log non-network errors (like 404 if endpoint doesn't exist)
    // Network errors are expected if server is down
    if (error?.status !== undefined && error.status !== 0) {
      // Server responded with an error status
      console.warn('Logout API error:', error.message || 'Logout endpoint may not be available')
    }
    // Silently ignore network errors (server down, no connection, etc.)
  } finally {
    // Always clear local auth regardless of API call result
    const { clearAuth } = await import('../auth/auth-utils')
    clearAuth()
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<{
      success: boolean
      data: User
    }>('/api/auth/me')
    
    if (response.success && response.data) {
      setUser(response.data)
      return response.data
    }
    
    return null
  } catch (error: any) {
    // Only log meaningful errors (server errors, not network errors)
    // Network errors are expected if server is down or user is offline
    if (error?.status !== undefined && error.status !== 0) {
      // Server responded with an error status
      // Don't log 401 errors as they're expected when not authenticated
      if (error.status !== 401) {
        console.warn('Get current user API error:', error.message || 'Failed to get current user')
      }
    }
    // Silently return null for network errors and 401 (not authenticated)
    return null
  }
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await apiClient.post<{
      success: boolean
      data: {
        accessToken: string
        expiresIn?: number
      }
    }>('/api/auth/refresh')
    
    if (response.success && response.data) {
      setAuthToken(response.data.accessToken, response.data.expiresIn)
      return response.data.accessToken
    }
    
    return null
  } catch (error: any) {
    // Only log meaningful errors (server errors, not network errors)
    // Network errors are expected if server is down
    if (error?.status !== undefined && error.status !== 0) {
      // Server responded with an error status
      // Don't log 401 errors as they're expected when token is invalid
      if (error.status !== 401) {
        console.warn('Refresh token API error:', error.message || 'Failed to refresh token')
      }
    }
    // Silently return null for network errors and 401 (token invalid/expired)
    return null
  }
}
