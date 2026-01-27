/**
 * Staff authentication API endpoints
 */

import { apiClient } from './api-client'

/**
 * Staff login credentials
 */
export interface StaffLoginCredentials {
  email: string
  password: string
}

/**
 * Staff login response
 */
export interface StaffLoginResponse {
  success: boolean
  data?: {
    user: {
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
    accessToken: string
    refreshToken?: string
    userType: 'staff'
  }
  message?: string
}

/**
 * Staff login
 */
export async function staffLogin(
  credentials: StaffLoginCredentials
): Promise<StaffLoginResponse['data']> {
  const response = await apiClient.post<StaffLoginResponse>(
    '/api/staff/login',
    credentials
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.message || 'Staff login failed')
}
