/**
 * API service for fetching products from the marketplace endpoint
 */

import { apiClient } from './api-client'
import type { Part } from '../features/parts-slice'

export interface ProductFilters {
  q?: string // Search query
  category?: string
  minPrice?: number
  maxPrice?: number
  make?: string
  inStock?: boolean
  page?: number
  limit?: number
}

export interface ProductsResponse {
  products: Part[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Fetch products from the marketplace API endpoint
 */
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams()
  
  // Add query parameters if provided
  if (filters.q) params.append('q', filters.q)
  if (filters.category) params.append('category', filters.category)
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString())
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
  if (filters.make) params.append('make', filters.make)
  if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString())
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const endpoint = `/api/buyer/products/marketplace${params.toString() ? `?${params.toString()}` : ''}`
  
  try {
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: any[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }>(endpoint)
    
    // Helper function to normalize image URLs (handle protocol-relative URLs)
    const normalizeImageUrl = (url: string | undefined): string => {
      if (!url) return '/placeholder.svg'
      if (url.startsWith('//')) {
        return `https:${url}`
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      return url
    }
    
    // Extract products from the response data array
    const rawProducts = response.data || []
    
    // Map API response fields to Part interface based on actual API structure
    const mappedProducts: Part[] = rawProducts.map((product: any) => {
      // Get the first image from imageUrls array, or use placeholder
      const firstImage = product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls[0] 
        : '/placeholder.svg'
      
      // Build compatibility array from make, model, year
      const compatibility: string[] = []
      if (product.make) compatibility.push(product.make)
      if (product.model) compatibility.push(product.model)
      if (product.year) compatibility.push(product.year.toString())
      
      // Build vehicle models array
      const vehicleModels: string[] = []
      if (product.make) vehicleModels.push(product.make)
      if (product.model) vehicleModels.push(product.model)
      
      // Build vehicle years array
      const vehicleYears: number[] = []
      if (product.year) vehicleYears.push(product.year)
      
      return {
        id: product.id || '',
        name: product.name || 'Unnamed Product',
        category: product.category || '',
        price: product.displayPrice || product.lowestPrice || 0,
        image: normalizeImageUrl(firstImage),
        description: product.description || '',
        compatibility: compatibility,
        inStock: product.inStock !== undefined ? product.inStock : true,
        brand: product.manufacturer || product.make,
        sku: product.sku || product.oemPartNumber,
        // Map additional fields
        vehicleModels: vehicleModels.length > 0 ? vehicleModels : undefined,
        vehicleYears: vehicleYears.length > 0 ? vehicleYears : undefined,
        partCategory: product.subcategory || product.category,
        // Map all available images
        images: product.imageUrls ? product.imageUrls.map((url: string) => normalizeImageUrl(url)) : undefined,
        // Map inventory ID (required for cart operations)
        ...(product.inventoryId && { inventoryId: product.inventoryId }),
        // Map OEM part number if available
        ...(product.oemPartNumber && { oemPartNumber: product.oemPartNumber }),
        // Map seller information if needed
        ...(product.sellerName && { sellerName: product.sellerName }),
        ...(product.sellerId && { sellerId: product.sellerId }),
        // Map rating information
        ...(product.averageRating !== undefined && { averageRating: product.averageRating }),
        ...(product.reviewCount !== undefined && { reviewCount: product.reviewCount }),
      }
    })
    
    // Extract pagination info
    const pagination = response.pagination || {}
    
    return {
      products: mappedProducts,
      total: pagination.total || mappedProducts.length,
      page: pagination.page || filters.page || 1,
      limit: pagination.limit || filters.limit || 20,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || mappedProducts.length) / (pagination.limit || 20)),
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}
