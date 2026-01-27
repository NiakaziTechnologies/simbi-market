/**
 * Seller Profile API endpoints
 */

import { apiClient } from './api-client'

/**
 * Seller profile
 */
export interface SellerProfile {
  id: string
  email: string
  businessName: string
  tradingName: string | null
  businessAddress: string
  contactNumber: string
  tin: string
  registrationNumber: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankName: string | null
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE" | "PENDING_VERIFICATION"
  sriScore: number
  isEligible: boolean
  lastSriCalculation: string | null
  mfaEnabled: boolean
  isShadowBanned: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Get seller profile response
 */
export interface GetSellerProfileResponse {
  success: boolean
  data: SellerProfile
}

/**
 * Update seller profile request
 */
export interface UpdateSellerProfileRequest {
  businessName?: string
  tradingName?: string | null
  businessAddress?: string
  contactNumber?: string
  registrationNumber?: string | null
  bankAccountName?: string | null
  bankAccountNumber?: string | null
  bankName?: string | null
}

/**
 * Update seller profile response
 */
export interface UpdateSellerProfileResponse {
  success: boolean
  message: string
  data: SellerProfile
}

/**
 * Get seller profile
 */
export async function getSellerProfile(): Promise<SellerProfile> {
  const response = await apiClient.get<GetSellerProfileResponse>(
    `/api/seller/auth/profile`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch seller profile')
}

/**
 * Update seller profile
 */
export async function updateSellerProfile(
  request: UpdateSellerProfileRequest
): Promise<SellerProfile> {
  const response = await apiClient.patch<UpdateSellerProfileResponse>(
    `/api/seller/auth/profile`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to update seller profile')
}
