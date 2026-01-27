/**
 * Buyer Reviews API endpoints
 */

import { apiClient } from './api-client'

/**
 * Create Review Request
 */
export interface CreateReviewRequest {
  inventoryId: string
  orderId: string
  orderItemId: string
  rating: number
  title: string
  comment: string
}

/**
 * Create Review Response
 */
export interface CreateReviewResponse {
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp?: string
}

/**
 * Create a product review
 */
export async function createReview(request: CreateReviewRequest): Promise<CreateReviewResponse['data']> {
  const response = await apiClient.post<CreateReviewResponse>('/api/buyer/reviews', request)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || response.message || 'Failed to create review')
}
