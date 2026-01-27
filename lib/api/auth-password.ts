/**
 * Password reset API endpoints
 */

import { apiClient } from './api-client'

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string
  userType?: "buyer" | "seller"
}

/**
 * Forgot password response
 */
export interface ForgotPasswordResponse {
  success: boolean
  message: string
  timestamp?: string
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string
  newPassword: string
  userType?: "buyer" | "seller" | "staff" | "admin"
}

/**
 * Reset password response
 */
export interface ResetPasswordResponse {
  success: boolean
  message: string
  timestamp?: string
}

/**
 * Request password reset
 */
export async function forgotPassword(
  request: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    `/api/auth/forgot-password`,
    request
  )

  if (response.success) {
    return response
  }

  throw new Error(response.error || response.message || 'Failed to send password reset email')
}

/**
 * Reset password with token
 */
export async function resetPassword(
  request: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    `/api/auth/reset-password`,
    request
  )

  if (response.success) {
    return response
  }

  throw new Error(response.error || response.message || 'Failed to reset password')
}
