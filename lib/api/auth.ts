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
      expiresIn?: number
      // Additional user fields may be included in response
      id?: string
      email?: string
      name?: string
      [key: string]: any // Allow for additional fields
    }
    message?: string
  }>('/api/auth/login', credentials)

  if (response.success && response.data) {
    // Map userType from API to role for internal use
    const userTypeToRole: Record<string, 'buyer' | 'seller' | 'admin'> = {
      'buyer': 'buyer',
      'seller': 'seller',
      'admin': 'admin',
      'staff': 'admin', // Map staff to admin for access control
    }
    
    const role = userTypeToRole[response.data.userType] || 'buyer'
    
    // Create user object from response data
    // The API may include user fields directly in data, or they may need to be extracted
    const user: User = {
      id: response.data.id || '',
      email: response.data.email || credentials.email,
      name: response.data.name || credentials.email.split('@')[0],
      role: role,
    }
    
    // Store token
    setAuthToken(response.data.accessToken, response.data.expiresIn)
    
    // Store user data
    setUser(user)
    
    return {
      user: user,
      tokens: {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
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
