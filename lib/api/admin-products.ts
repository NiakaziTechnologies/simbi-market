/**
 * Admin Products API endpoints
 */

import { apiClient } from './api-client'

/**
 * Seller Product object
 */
export interface SellerProduct {
  id: string
  sellerId: string
  masterProductId: string
  sellerPrice: number
  currency: string
  quantity: number
  lowStockThreshold: number
  isActive: boolean
  lastPriceUpdate: string | null
  priceUpdateCount: number
  averageRating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  condition: string
  reorderPoint: number
  sellerImages: string[]
  sellerNotes?: string
  sellerSku?: string
  seller: {
    id: string
    email: string
    businessName: string
    tradingName: string
    contactNumber: string
    status: string
    sriScore: number
    isEligible: boolean
  }
  masterProduct: {
    id: string
    masterPartId: string
    oemPartNumber: string
    name: string
    description: string
    manufacturer: string
    categoryId: string
    category: {
      id: string
      name: string
      slug: string
    }
    vehicleCompatibility: {
      make: string
      year: string
      model: string
    }
    imageUrls: string[]
    isActive: boolean
  }
  _count?: {
    orderItems?: number
  }
}

/**
 * Master Product object
 */
export interface MasterProduct {
  id: string
  masterPartId: string
  oemPartNumber: string
  name: string
  description: string
  categoryId: string
  manufacturer: string
  length: number | null
  width: number | null
  height: number | null
  weight: number | null
  unit: string
  vehicleCompatibility: {
    make: string
    year: string
    model: string
  }
  imageUrls: string[]
  specSheetUrl: string | null
  isActive: boolean
  isCustom: boolean
  approvedAt: string | null
  approvedBy: string | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  }
}

/**
 * Seller Products list response
 */
export interface SellerProductsListResponse {
  success: boolean
  data: {
    products: SellerProduct[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  timestamp?: string
}

/**
 * Master Products list response
 */
export interface MasterProductsListResponse {
  success: boolean
  data: {
    products: MasterProduct[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

/**
 * Get seller products
 */
export async function getSellerProducts(page: number = 1, limit: number = 100): Promise<SellerProductsListResponse['data']> {
  const response = await apiClient.get<SellerProductsListResponse>(`/api/admin/products/seller-products?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error('Failed to fetch seller products')
}

/**
 * Get master products
 */
export async function getMasterProducts(page: number = 1, limit: number = 20): Promise<MasterProductsListResponse['data']> {
  const response = await apiClient.get<MasterProductsListResponse>(`/api/admin/catalog/products?page=${page}&limit=${limit}`)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error('Failed to fetch master products')
}
