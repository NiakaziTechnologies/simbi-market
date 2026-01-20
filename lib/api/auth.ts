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
  } catch (error) {
    // Even if logout fails on server, clear local auth
    console.error('Logout error:', error)
  } finally {
    // Always clear local auth
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
  } catch (error) {
    console.error('Get current user error:', error)
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
  } catch (error) {
    console.error('Refresh token error:', error)
    return null
  }
}
