/**
 * Seller Inventory API endpoints
 */

import { apiClient } from "./api-client"
import { getAuthToken } from "../auth/auth-utils"

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
  masterPartId?: string
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

export interface SellerInventoryListParams {
  page?: number
  limit?: number
  isActive?: boolean
  lowStock?: boolean
}

/**
 * Get inventory listings (supports filters per spec)
 */
export async function getSellerInventoryListings(
  params: SellerInventoryListParams = {}
): Promise<InventoryListResponse["data"]> {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const qs = new URLSearchParams()
  qs.set("page", String(page))
  qs.set("limit", String(limit))
  if (typeof params.isActive === "boolean") qs.set("isActive", String(params.isActive))
  if (typeof params.lowStock === "boolean") qs.set("lowStock", String(params.lowStock))

  const response = await apiClient.get<InventoryListResponse>(`/api/seller/inventory/listings?${qs.toString()}`)
  if (response.success && response.data) return response.data
  throw new Error(response.error || response.message || "Failed to fetch inventory")
}

export interface QuickUpdateListingBody {
  sellerPrice?: number
  quantity?: number
}

export interface QuickUpdateListingResponse {
  success: boolean
  message?: string
  data?: InventoryListing
  timestamp?: string
}

/**
 * Quick update listing (price/quantity)
 */
export async function quickUpdateListing(
  id: string,
  body: QuickUpdateListingBody
): Promise<InventoryListing> {
  const response = await apiClient.patch<QuickUpdateListingResponse>(
    `/api/seller/inventory/listings/${encodeURIComponent(id)}/quick-update`,
    body
  )
  if (response.success && response.data) return response.data
  throw new Error(response.message || response.error || "Failed to update listing")
}

export interface LowStockAlertItem {
  id: string
  masterProductId: string
  product: {
    id: string
    name: string
    oemPartNumber: string
    masterPartId: string
    manufacturer: string
  }
  quantity: number
  lowStockThreshold: number
  sellerPrice: number
  currency: string
  updatedAt: string
}

export interface LowStockAlertsResponse {
  success: boolean
  data?: LowStockAlertItem[]
  message?: string
  timestamp?: string
}

export async function getLowStockAlerts(limit = 5): Promise<LowStockAlertItem[]> {
  const response = await apiClient.get<LowStockAlertsResponse>(
    `/api/seller/inventory/low-stock-alerts?limit=${encodeURIComponent(String(limit))}`
  )
  if (response.success && response.data) return response.data
  throw new Error(response.message || "Failed to load low stock alerts")
}

/**
 * CSV export/import
 */
export async function downloadInventoryCsv(): Promise<Blob> {
  const token = getAuthToken()
  const res = await fetch(`/api/seller/inventory/export.csv`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Export failed (${res.status})`)
  return await res.blob()
}

export async function downloadBulkTemplate(): Promise<Blob> {
  const token = getAuthToken()
  const res = await fetch(`/api/seller/inventory/bulk-upload/template`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Template download failed (${res.status})`)
  return await res.blob()
}

export interface BulkUploadAcceptedResponse {
  success: boolean
  uploadId?: string
  message?: string
  data?: { uploadId?: string }
}

export async function uploadBulkCsv(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const res = await apiClient.postFormData<BulkUploadAcceptedResponse>(
    `/api/seller/inventory/bulk-upload`,
    form
  )
  const uploadId =
    (res as BulkUploadAcceptedResponse).uploadId ||
    (res as BulkUploadAcceptedResponse).data?.uploadId
  if (uploadId) return uploadId
  throw new Error((res as BulkUploadAcceptedResponse).message || "Upload did not return an uploadId")
}

export interface BulkUploadStatusResponse {
  success: boolean
  data?: Record<string, unknown>
  message?: string
}

export async function getBulkUploadStatus(uploadId: string): Promise<Record<string, unknown>> {
  const res = await apiClient.get<BulkUploadStatusResponse>(
    `/api/seller/inventory/bulk-upload/${encodeURIComponent(uploadId)}/status`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load upload status")
}

