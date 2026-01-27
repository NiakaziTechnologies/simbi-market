/**
 * Admin Drivers API endpoints
 */

import { apiClient } from './api-client'

/**
 * Driver
 */
export interface AdminDriver {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  licenseNumber?: string
  vehicleType?: string
  vehiclePlate?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  _count?: {
    orders?: number
  }
}

/**
 * Drivers list response
 */
export interface AdminDriversListResponse {
  success: boolean
  message?: string
  data: AdminDriver[]
  timestamp?: string
}

/**
 * Get admin drivers
 */
export async function getAdminDrivers(): Promise<AdminDriver[]> {
  const response = await apiClient.get<AdminDriversListResponse>(`/api/admin/drivers`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Failed to fetch drivers')
}

/**
 * Create driver request
 */
export interface CreateDriverRequest {
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  licenseNumber?: string
  vehicleType?: string
  vehiclePlate?: string
  notes?: string
}

/**
 * Create driver response
 */
export interface CreateDriverResponse {
  success: boolean
  message?: string
  data: AdminDriver
  timestamp?: string
}

/**
 * Create a driver
 */
export async function createDriver(request: CreateDriverRequest): Promise<AdminDriver> {
  const response = await apiClient.post<CreateDriverResponse>(`/api/admin/drivers`, request)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || response.message || 'Failed to create driver')
}
