/**
 * Product Reviews and Ratings API endpoints
 */

import { apiClient } from './api-client'

/**
 * Product Rating Data
 */
export interface ProductRating {
  averageRating: number
  reviewCount: number
  distribution: {
    "1": number
    "2": number
    "3": number
    "4": number
    "5": number
  }
}

/**
 * Product Rating Response
 */
export interface ProductRatingResponse {
  success: boolean
  data: ProductRating
  timestamp?: string
}

/**
 * Product Review
 */
export interface ProductReview {
  id: string
  inventoryId: string
  buyerId: string
  orderId: string
  orderItemId: string
  rating: number
  title: string
  comment: string
  status: string
  flaggedReason: string | null
  moderatedBy: string | null
  moderatedAt: string | null
  createdAt: string
  updatedAt: string
  buyer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  response: any | null
}

/**
 * Product Reviews Response
 */
export interface ProductReviewsResponse {
  success: boolean
  data: {
    reviews: ProductReview[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  timestamp?: string
}

/**
 * Get product rating
 */
export async function getProductRating(inventoryId: string): Promise<ProductRating> {
  const response = await apiClient.get<ProductRatingResponse>(`/api/products/${inventoryId}/rating`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch product rating')
}

/**
 * Get product reviews
 */
export async function getProductReviews(
  inventoryId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest'
): Promise<ProductReviewsResponse['data']> {
  const response = await apiClient.get<ProductReviewsResponse>(
    `/api/products/${inventoryId}/reviews?page=${page}&limit=${limit}&sortBy=${sortBy}`
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch product reviews')
}
