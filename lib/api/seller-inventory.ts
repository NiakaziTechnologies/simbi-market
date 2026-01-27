/**
 * Seller Inventory API endpoints
 */

import { apiClient } from './api-client'

/**
 * Master product category
 */
export interface MasterProductCategory {
  name: string
}

/**
 * Master product
 */
export interface MasterProduct {
  name: string
  oemPartNumber: string
  manufacturer: string
  imageUrls: string[]
  category: MasterProductCategory
}

/**
 * Inventory listing
 */
export interface InventoryListing {
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
  sellerNotes: string
  sellerSku: string
  masterProduct: MasterProduct
}

/**
 * Inventory list response
 */
export interface InventoryListResponse {
  success: boolean
  message: string
  data: {
    inventory: InventoryListing[]
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
 * Category value data
 */
export interface CategoryValue {
  name: string
  value: number
  count: number
  percentage: number
}

/**
 * Inventory value by category response
 */
export interface InventoryValueByCategoryResponse {
  success: boolean
  message: string
  data: {
    categories: CategoryValue[]
    totalValue: number
  }
  timestamp?: string
}

/**
 * Get inventory listings
 */
export async function getSellerInventory(
  page: number = 1,
  limit: number = 20
): Promise<InventoryListResponse['data']> {
  const response = await apiClient.get<InventoryListResponse>(
    `/api/seller/inventory/listings?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch inventory')
}

/**
 * Get inventory value by category
 */
export async function getInventoryValueByCategory(): Promise<InventoryValueByCategoryResponse['data']> {
  const response = await apiClient.get<InventoryValueByCategoryResponse>(
    `/api/seller/inventory/value-by-category`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch inventory value by category')
}

/**
 * Master catalog product
 */
export interface MasterCatalogProduct {
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
 * Master catalog response
 */
export interface MasterCatalogResponse {
  success: boolean
  message: string
  data: {
    products: MasterCatalogProduct[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
      hasMore: boolean
    }
  }
  timestamp?: string
}

/**
 * Get master catalog products
 */
export async function getMasterCatalog(search?: string): Promise<MasterCatalogResponse['data']> {
  const url = search
    ? `/api/seller/inventory/catalog?search=${encodeURIComponent(search)}`
    : `/api/seller/inventory/catalog`
  
  const response = await apiClient.get<MasterCatalogResponse>(url)

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch catalog products')
}

/**
 * Create inventory listing request
 */
export interface CreateInventoryListingRequest {
  masterProductId: string
  sellerPrice: number
  currency: string
  quantity: number
  lowStockThreshold: number
  reorderPoint: number
  condition: string
  sellerNotes?: string
  sellerSku?: string
}

/**
 * Create inventory listing response
 */
export interface CreateInventoryListingResponse {
  success: boolean
  message: string
  data: InventoryListing
  timestamp?: string
}

/**
 * Create inventory listing
 */
export async function createInventoryListing(
  request: CreateInventoryListingRequest
): Promise<CreateInventoryListingResponse['data']> {
  const response = await apiClient.post<CreateInventoryListingResponse>(
    `/api/seller/inventory/listings`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to create inventory listing')
}
