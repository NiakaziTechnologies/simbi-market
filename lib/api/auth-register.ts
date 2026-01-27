/**
 * Registration API endpoints
 */

import { apiClient } from './api-client'

/**
 * Register buyer request (Individual)
 */
export interface RegisterBuyerIndividualRequest {
  userType: "buyer"
  buyerType: "INDIVIDUAL"
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
}

/**
 * Register buyer request (Commercial)
 */
export interface RegisterBuyerCommercialRequest {
  userType: "buyer"
  buyerType: "COMMERCIAL"
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  companyName: string
  registrationNumber?: string
  taxId?: string
  contactEmail?: string
  contactPhone?: string
  billingAddress?: string
  shippingAddress?: string
  creditLimit?: number
  paymentTermDays?: number
  currency?: string
  monthlySpendingLimit?: number
  businessType?: string
  industry?: string
  website?: string
  description?: string
  numberOfEmployees?: number
  establishedYear?: number
  addressLine1?: string
  addressLine2?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  preferredContactMethod?: string
  marketingConsent?: boolean
  termsAccepted?: boolean
}

/**
 * Register seller request
 */
export interface RegisterSellerRequest {
  userType: "seller"
  email: string
  password: string
  businessName: string
  tradingName?: string
  businessAddress: string
  contactNumber: string
  tin: string
  registrationNumber?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankName?: string
}

/**
 * Registration response
 */
export interface RegistrationResponse {
  success: boolean
  message: string
  data: {
    user: any
    userType: "buyer" | "seller"
  }
  timestamp?: string
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest {
  email: string
  code: string
}

/**
 * Verify email response
 */
export interface VerifyEmailResponse {
  success: boolean
  message: string
  data: {
    buyer?: any
    seller?: any
    accessToken: string
    refreshToken?: string
  }
}

/**
 * Resend verification request
 */
export interface ResendVerificationRequest {
  email: string
}

/**
 * Resend verification response
 */
export interface ResendVerificationResponse {
  success: boolean
  message: string
}

/**
 * Register user (buyer or seller)
 */
export async function registerUser(
  request: RegisterBuyerIndividualRequest | RegisterBuyerCommercialRequest | RegisterSellerRequest
): Promise<RegistrationResponse['data']> {
  const response = await apiClient.post<RegistrationResponse>(
    `/api/auth/register`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to register user')
}

/**
 * Verify buyer email
 */
export async function verifyBuyerEmail(
  request: VerifyEmailRequest
): Promise<VerifyEmailResponse['data']> {
  const response = await apiClient.post<VerifyEmailResponse>(
    `/api/buyer/auth/verify-email`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to verify email')
}

/**
 * Verify seller email
 */
export async function verifySellerEmail(
  request: VerifyEmailRequest
): Promise<VerifyEmailResponse['data']> {
  const response = await apiClient.post<VerifyEmailResponse>(
    `/api/seller/auth/verify-email`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to verify email')
}

/**
 * Resend buyer verification code
 */
export async function resendBuyerVerification(
  request: ResendVerificationRequest
): Promise<void> {
  const response = await apiClient.post<ResendVerificationResponse>(
    `/api/buyer/auth/resend-verification`,
    request
  )

  if (!response.success) {
    throw new Error(response.error || response.message || 'Failed to resend verification code')
  }
}

/**
 * Resend seller verification code
 */
export async function resendSellerVerification(
  request: ResendVerificationRequest
): Promise<void> {
  const response = await apiClient.post<ResendVerificationResponse>(
    `/api/seller/auth/resend-verification`,
    request
  )

  if (!response.success) {
    throw new Error(response.error || response.message || 'Failed to resend verification code')
  }
}
