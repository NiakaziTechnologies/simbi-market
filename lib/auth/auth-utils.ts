/**
 * Authentication utilities for token management
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'token_expiry'

export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
  // Add other user fields as needed
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number // in seconds
}

/**
 * Store authentication token
 */
export function setAuthToken(token: string, expiresIn?: number): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(TOKEN_KEY, token)
  
  if (expiresIn) {
    const expiryTime = Date.now() + expiresIn * 1000
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  
  // Check if token is expired
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (expiryTime) {
    const expiry = parseInt(expiryTime, 10)
    if (isNaN(expiry)) {
      // Invalid expiry time, but token exists - assume valid
      return token
    }
    if (Date.now() >= expiry) {
      // Token expired, clear it
      console.warn('Token expired, clearing auth')
      clearAuth()
      return null
    }
  }
  
  return token
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

/**
 * Store user data
 */
export function setUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Get user data
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Get user role
 */
export function getUserRole(): 'buyer' | 'seller' | 'admin' | null {
  const user = getUser()
  return user?.role || null
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true
  
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryTime) return false // No expiry set, assume valid
  
  const expiry = parseInt(expiryTime, 10)
  return Date.now() >= expiry
}
