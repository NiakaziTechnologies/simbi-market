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
 * Mock seller profile for development
 */
const mockSellerProfile: SellerProfile = {
  id: 'seller-001',
  email: 'seller@autoparts.co.zw',
  businessName: 'AutoParts Wholesalers Ltd',
  tradingName: 'AutoPro Parts',
  businessAddress: '123 Industrial Road, Harare, Zimbabwe',
  contactNumber: '+263 77 123 4567',
  tin: 'TIN12345678',
  registrationNumber: 'CR/12345',
  bankAccountName: 'AutoParts Wholesalers Ltd',
  bankAccountNumber: '1234567890',
  bankName: 'ZB Bank',
  status: 'ACTIVE',
  sriScore: 87.5,
  isEligible: true,
  lastSriCalculation: '2024-10-25T10:30:00Z',
  mfaEnabled: true,
  isShadowBanned: false,
  createdAt: '2024-06-15T09:00:00Z',
  updatedAt: '2024-10-25T15:45:00Z'
}

/**
 * delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get seller profile
 */
export async function getSellerProfile(): Promise<SellerProfile> {
  await delay(1000)
  return mockSellerProfile
}

/**
 * Update seller profile
 */
export async function updateSellerProfile(
  request: UpdateSellerProfileRequest
): Promise<SellerProfile> {
  await delay(1500)
  const updatedProfile = {
    ...mockSellerProfile,
    ...request,
    updatedAt: new Date().toISOString(),
  }
  return updatedProfile as SellerProfile
}

