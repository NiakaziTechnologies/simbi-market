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
  model?: string
  year?: string
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

/**
 * Map raw API product to Part interface
 */
function mapProductToPart(product: any): Part {
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
  
  // Determine if product is in stock - check multiple possible field names
  // API might return: inStock, isInStock, stock, available, quantity, stockStatus
  // Default to true if no stock info is available (to allow adding to cart)
  const isInStock = 
    product.inStock === true ||
    product.inStock === 'true' ||
    product.isInStock === true ||
    product.isInStock === 'true' ||
    product.stock > 0 ||
    product.stock === true ||
    product.stock === 'true' ||
    product.available === true ||
    product.available === 'true' ||
    product.quantity > 0 ||
    product.stockStatus === 'in_stock' ||
    product.stockStatus === 'available' ||
    product.stockStatus === 'In Stock' ||
    // Default to true if no stock field exists (better UX - allows adding to cart)
    (product.inStock === undefined && product.isInStock === undefined && product.stock === undefined && product.available === undefined && product.quantity === undefined && product.stockStatus === undefined)
  
  return {
    id: product.id || '',
    name: product.name || 'Unnamed Product',
    category: product.category || '',
    price: product.displayPrice || product.lowestPrice || 0,
    image: normalizeImageUrl(firstImage),
    description: product.description || '',
    compatibility: compatibility,
    inStock: isInStock,
    brand: product.manufacturer || product.make,
    sku: product.sku || product.oemPartNumber,
    // Map additional fields
    vehicleModels: vehicleModels.length > 0 ? vehicleModels : undefined,
    vehicleYears: vehicleYears.length > 0 ? vehicleYears : undefined,
    partCategory: product.subcategory || product.category,
    // Map all available images
    images: product.imageUrls ? product.imageUrls.map((url: string) => normalizeImageUrl(url)) : undefined,
    // Map inventory ID (required for cart operations)
    inventoryId: product.inventoryId,
    // Map OEM part number if available
    oemPartNumber: product.oemPartNumber,
    // Map seller information if needed
    sellerName: product.sellerName,
    sellerId: product.sellerId,
    // Map rating information
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    // Map part type (original/aftermarket/OEM/Genuine) - check multiple possible field names
    // If seller is the same as manufacturer, it's likely OEM/Original
    partType: product.partType || 
              product.isOriginal === true || product.isOriginal === 'true' 
                ? 'original' 
                : product.isAftermarket === true || product.isAftermarket === 'true' 
                  ? 'aftermarket' 
                  : product.type === 'OEM' || product.type === 'Genuine'
                    ? product.type
                    : product.quality === 'OEM' || product.quality === 'Genuine'
                      ? product.quality
                      : product.condition === 'new' || product.condition === 'New'
                        ? 'OEM'
                        : product.sellerName === product.manufacturer || product.sellerName === product.brand
                          ? 'OEM'
                          : product.isVerified === true
                            ? 'OEM'
                            : undefined,
    // Map VIN if available
    vin: product.vin || product.vinNumber,
    // Map SKU if available
    sku: product.sku || product.sellerSku,
  }
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
  if (filters.model) params.append('model', filters.model)
  if (filters.year) {
    // Send year as string (URLSearchParams converts to string anyway)
    // Some APIs might expect it as a number, but query params are always strings
    params.append('year', filters.year)
  }
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
    
    // Extract products from the response data array
    const rawProducts = response.data || []
    
    // Map API response fields to Part interface based on actual API structure
    const mappedProducts: Part[] = rawProducts.map(mapProductToPart)
    
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

/**
 * Fetch a single product by ID from the marketplace API endpoint
 */
export async function fetchProductById(productId: string): Promise<Part | null> {
  try {
    // First try searching by exact ID using the search endpoint
    // Use a broad search to find the product
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
    }>(`/api/buyer/products/marketplace?limit=50`)
    
    // Find the product in the response by ID
    const rawProducts = response.data || []
    
    // Try exact match first, then try finding by ID in the results
    let product = rawProducts.find((p: any) => p.id === productId)
    
    // If not found by exact ID match, try partial match
    if (!product) {
      product = rawProducts.find((p: any) => 
        p.id && (p.id.includes(productId) || productId.includes(p.id))
      )
    }
    
    if (product) {
      return mapProductToPart(product)
    }
    
    return null
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    throw error
  }
}
