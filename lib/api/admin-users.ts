/**
 * Admin Users API endpoints
 */

import { apiClient } from './api-client'

/**
 * User object
 */
export interface AdminUser {
  id: string
  email: string
  name: string
  userType: 'buyer' | 'seller' | 'admin' | 'staff'
  isSeller: boolean
  isBuyer: boolean
  status?: string
  firstName?: string
  lastName?: string
  companyName?: string | null
  businessName?: string
  tradingName?: string
  phone?: string
  phoneNumber?: string
  contactNumber?: string
  buyerType?: 'INDIVIDUAL' | 'COMMERCIAL'
  tin?: string
  sriScore?: number
  isEligible?: boolean
  createdAt?: string
  updatedAt?: string
  _count?: {
    orders?: number
    addresses?: number
  }
  [key: string]: any // Allow for additional fields
}

/**
 * Users list response
 */
export interface AdminUsersListResponse {
  success: boolean
  data: {
    users: AdminUser[]
    pagination: {
      page: number
      limit: number
      total: number
      sellerCount: number
      buyerCount: number
      pages: number
    }
  }
  timestamp?: string
}

/**
 * Get admin users list
 */
export async function getAdminUsers(page: number = 1, limit: number = 100): Promise<AdminUsersListResponse['data']> {
  const response = await apiClient.get<AdminUsersListResponse>(`/api/admin/users?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error('Failed to fetch users')
}
