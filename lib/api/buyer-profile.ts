/**
 * Buyer profile API endpoints
 */

import { apiClient } from './api-client'

export interface BuyerProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  buyerType: 'COMMERCIAL' | 'INDIVIDUAL'
  status: string
  loyaltyPoints: number
  loyaltyTier: string
  companyName: string | null
  registrationNumber: string | null
  taxId: string | null
  contactEmail: string | null
  contactPhone: string | null
  billingAddress: string | null
  shippingAddress: string | null
  creditLimit: number | null
  creditUsed: number
  paymentTermDays: number | null
  currency: string | null
  monthlySpendingLimit: number | null
  businessType: string | null
  industry: string | null
  website: string | null
  description: string | null
  numberOfEmployees: number | null
  establishedYear: number | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  country: string | null
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'SMS' | null
  marketingConsent: boolean
  termsAccepted: boolean
  createdAt: string
  updatedAt: string
  addresses: Array<{
    id: string
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
  }>
}

export interface BuyerProfileResponse {
  success: boolean
  data: BuyerProfile
}

export interface UpdateBuyerProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  companyName?: string | null
  registrationNumber?: string | null
  taxId?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  billingAddress?: string | null
  shippingAddress?: string | null
  creditLimit?: number | null
  paymentTermDays?: number | null
  currency?: string | null
  monthlySpendingLimit?: number | null
  businessType?: string | null
  industry?: string | null
  website?: string | null
  description?: string | null
  numberOfEmployees?: number | null
  establishedYear?: number | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  province?: string | null
  postalCode?: string | null
  country?: string | null
  preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | null
  marketingConsent?: boolean | null
  termsAccepted?: boolean | null
}

export interface UpdateBuyerProfileResponse {
  success: boolean
  message: string
  data: {
    buyer: BuyerProfile
    accessToken: string
    refreshToken: string
  }
}

/**
 * Get buyer profile
 */
export async function getBuyerProfile(): Promise<BuyerProfile> {
  const response = await apiClient.get<BuyerProfileResponse>('/api/buyer/auth/profile')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.message || 'Failed to fetch buyer profile')
}

/**
 * Update buyer profile
 */
export async function updateBuyerProfile(data: UpdateBuyerProfileRequest): Promise<BuyerProfile> {
  const response = await apiClient.patch<UpdateBuyerProfileResponse>('/api/buyer/auth/profile', data)
  if (response.success && response.data) {
    return response.data.buyer
  }
  throw new Error(response.message || 'Failed to update buyer profile')
}
