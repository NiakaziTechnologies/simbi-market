/**
 * Admin Reviews API endpoints
 */

import { apiClient } from './api-client'

/**
 * Review
 */
export interface AdminReview {
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
    companyName: string | null
  }
  inventory: {
    id: string
    sellerId: string
    masterProductId: string
    sellerPrice: number
    currency: string
    quantity: number
    lowStockThreshold: number
    isActive: boolean
    condition: string
    reorderPoint: number
    sellerSku: string
    sellerNotes: string | null
    masterProduct: {
      id: string
      name: string
    }
    seller: {
      id: string
      businessName: string
      email: string
    }
  }
  response: any | null
  moderations: any[]
}

/**
 * Reviews list response
 */
export interface AdminReviewsListResponse {
  success: boolean
  data: {
    reviews: AdminReview[]
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
 * Get admin reviews
 */
export async function getAdminReviews(page: number = 1, limit: number = 20): Promise<AdminReviewsListResponse['data']> {
  const response = await apiClient.get<AdminReviewsListResponse>(`/api/admin/reviews?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Failed to fetch reviews')
}
