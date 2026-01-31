/**
 * Centralized API client with token management
 */

import { API_CONFIG } from '../config'
import { getAuthToken, clearAuth } from '../auth/auth-utils'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  data?: any
}

/**
 * Centralized API client class
 */
class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_CONFIG.baseURL
  }

  /**
   * Get headers with authentication token
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const token = getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 401 Unauthorized - check if it's actually a token issue
    if (response.status === 401) {
      try {
        // Try to read the response body to check the error message
        // Clone the response so we can read it without consuming it
        const clonedResponse = response.clone()
        const errorData = await clonedResponse.json().catch(() => ({}))
        const errorMessage = (errorData.message || '').toLowerCase()
        
        // Only clear auth if it's explicitly a token/auth issue
        // Don't clear auth for other 401s like "No buyer ID found" which might be permission issues
        // Check for specific error messages that indicate token issues
        const isTokenError = 
          errorMessage.includes('token') || 
          errorMessage.includes('authentication') ||
          errorMessage.includes('expired') ||
          (errorMessage.includes('invalid') && (errorMessage.includes('token') || errorMessage.includes('credentials'))) ||
          errorMessage.includes('bearer') ||
          errorMessage.includes('jwt')
        
        // Don't clear auth for specific permission/role errors
        const isPermissionError = 
          errorMessage.includes('buyer id') ||
          errorMessage.includes('buyerid') ||
          errorMessage.includes('no buyer') ||
          errorMessage.includes('seller id') ||
          errorMessage.includes('sellerid') ||
          errorMessage.includes('no seller') ||
          errorMessage.includes('permission') ||
          errorMessage.includes('role') ||
          errorMessage.includes('access denied')
        
        // Only clear auth if it's a token error and NOT a permission error
        const shouldClearAuth = isTokenError && !isPermissionError
        
        if (shouldClearAuth) {
          console.warn('API Client: Authentication token invalid, clearing auth')
          clearAuth()
          // Redirect to login page only for token errors
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
          throw new Error('Authentication required')
        }
        
        // For other 401 errors (like missing buyer ID, permission issues), 
        // just throw the error without clearing auth
        const error: ApiError = {
          message: errorData.message || 'Unauthorized',
          status: 401,
          data: errorData,
        }
        throw error
      } catch (error: any) {
        // If we already threw an ApiError, re-throw it
        if (error && typeof error === 'object' && 'status' in error) {
          throw error
        }
        
        // If response parsing failed, be conservative
        // Only redirect to login if there was a token (user was authenticated)
        // Don't redirect guest users (users without tokens) to login
        const token = getAuthToken()
        if (token) {
          // User had a token but got 401 - token might be invalid
          clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
          throw new Error('Authentication required')
        }
        
        // No token - this is a guest user, don't redirect
        // Just throw the error so the calling code can handle it
        const error: ApiError = {
          message: 'Unauthorized',
          status: 401,
          data: {},
        }
        throw error
      }
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: ApiError = {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        data: errorData,
      }
      throw error
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    console.log('apiClient: GET request to', url)
    const headers = this.getHeaders(options?.headers)
    console.log('apiClient: GET headers:', headers)
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...options,
    })

    console.log('apiClient: GET response status:', response.status, response.statusText)
    return this.handleResponse<T>(response)
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(options?.headers),
      ...options,
    })

    return this.handleResponse<T>(response)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
