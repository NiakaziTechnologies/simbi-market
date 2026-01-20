/**
 * Addresses API endpoints
 */

import { apiClient } from './api-client'

/**
 * Address from API
 */
export interface Address {
  id: string
  buyerId: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Create address request
 */
export interface CreateAddressRequest {
  fullName?: string
  phoneNumber?: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode?: string
  country?: string
  isDefault?: boolean
}

/**
 * Get all addresses
 */
export async function getAddresses(): Promise<Address[]> {
  const response = await apiClient.get<{
    success: boolean
    data: Address[]
  }>('/api/buyer/addresses')

  if (response.success && response.data) {
    return response.data
  }

  throw new Error('Failed to fetch addresses')
}

/**
 * Create new address
 */
export async function createAddress(request: CreateAddressRequest): Promise<Address> {
  const response = await apiClient.post<{
    success: boolean
    data: Address
  }>('/api/buyer/addresses', request)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error('Failed to create address')
}
