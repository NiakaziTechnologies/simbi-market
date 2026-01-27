/**
 * Seller Coupons API endpoints
 */

import { apiClient } from './api-client'

/**
 * Seller coupon
 */
export interface SellerCoupon {
  id: string
  code: string
  name: string
  description: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minimumOrderAmount: number
  maximumDiscount: number | null
  couponType: "PRODUCT_SPECIFIC" | "CATEGORY_SPECIFIC" | "GENERAL"
  sellerId: string
  applicableCategories: string[] | null
  applicableProducts: string[]
  isActive: boolean
  usageLimit: number | null
  usageCount: number
  userUsageLimit: number | null
  validFrom: string
  validUntil: string
  createdBy: string
  createdByType: string
  createdAt: string
  updatedAt: string
  _count: {
    usages: number
  }
}

/**
 * Seller coupons list response
 */
export interface SellerCouponsListResponse {
  success: boolean
  data: {
    coupons: SellerCoupon[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

/**
 * Create coupon request
 */
export interface CreateCouponRequest {
  name: string
  description?: string
  discountValue: number
  minimumOrderAmount: number
  maximumDiscount?: number
  productId?: string
  isActive?: boolean
  usageLimit?: number
  userUsageLimit?: number
  validFrom: string
  validUntil: string
}

/**
 * Create coupon response
 */
export interface CreateCouponResponse {
  success: boolean
  message: string
  data: SellerCoupon
}

/**
 * Get seller coupons
 */
export async function getSellerCoupons(
  page: number = 1,
  limit: number = 20
): Promise<SellerCouponsListResponse['data']> {
  const response = await apiClient.get<SellerCouponsListResponse>(
    `/api/seller/coupons?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch coupons')
}

/**
 * Create seller coupon
 */
export async function createSellerCoupon(
  request: CreateCouponRequest
): Promise<CreateCouponResponse['data']> {
  const response = await apiClient.post<CreateCouponResponse>(
    `/api/seller/coupons`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to create coupon')
}
