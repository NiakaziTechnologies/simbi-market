/**
 * Seller Dashboard API endpoints
 */

import { apiClient } from './api-client'

/**
 * KPI data structure
 */
export interface KPIData {
  title: string
  value: number
  description: string
  unit: string
}

/**
 * Sales summary data
 */
export interface SalesSummary {
  title: string
  period: string
  value: number
  description: string
}

/**
 * Sales performance data point
 */
export interface SalesPerformanceDataPoint {
  date: string
  sales: number
  unfulfilledOrders: number
}

/**
 * Period comparison data
 */
export interface PeriodComparison {
  value: number
  change: number
  changeType: 'up' | 'down'
  comparison: string
}

/**
 * Top category data
 */
export interface TopCategory {
  category: string
  amount: number
  percentage: number
}

/**
 * Top selling product
 */
export interface TopSellingProduct {
  inventoryId: string
  productName: string
  oemPartNumber: string
  manufacturer: string
  revenue: number
  quantitySold: number
  orderCount: number
}

/**
 * Key metrics data
 */
export interface KeyMetrics {
  orderFulfillment: {
    value: number
    unit: string
    change: number
    comparison: string
  }
  avgResponseTime: {
    value: number
    unit: string
    change: number
    comparison: string
  }
}

/**
 * Comprehensive dashboard response
 */
export interface SellerDashboardComprehensiveResponse {
  success: boolean
  message: string
  data: {
    kpis: {
      totalRevenue: KPIData
      currentBalance: KPIData
      totalProducts: KPIData
      activeStaff: KPIData
    }
    summary: {
      currentBalance: KPIData
      totalRevenue: KPIData
      totalOrders: KPIData
      inventoryItems: KPIData
    }
    salesSummary: {
      daily: SalesSummary
      weekly: SalesSummary
      monthly: SalesSummary
    }
    salesPerformanceAnalytics: {
      title: string
      subtitle: string
      data: SalesPerformanceDataPoint[]
    }
    periodComparison: {
      thisMonth: PeriodComparison
      thisWeek: PeriodComparison
    }
    topCategories: TopCategory[]
    topSellingProducts: {
      title: string
      subtitle: string
      data: TopSellingProduct[]
      totalRevenue: number
    }
    keyMetrics: KeyMetrics
  }
  timestamp?: string
}

/**
 * Top products report response
 */
export interface TopProductsReportResponse {
  success: boolean
  message: string
  data: {
    summary: {
      totalProducts: number
      totalRevenue: number
      totalQuantity: number
      totalOrders: number
      avgRevenuePerProduct: number
      period: Record<string, any>
    }
    products: Array<{
      inventoryId: string
      productName: string
      oemPartNumber: string
      manufacturer: string
      category: {
        id: string
        name: string
      }
      currentPrice: number
      currency: string
      imageUrls: string[]
      totalRevenue: number
      totalQuantity: number
      orderCount: number
      avgOrderValue: number
      avgQuantityPerOrder: number
      salesTrend: Array<{
        date: string
        revenue: number
        quantity: number
      }>
      monthlyData: Array<{
        month: string
        revenue: number
        quantity: number
      }>
    }>
    categoryBreakdown: Array<{
      categoryName: string
      productCount: number
      totalRevenue: number
      totalQuantity: number
    }>
    combinedTrend: Array<{
      date: string
      revenue: number
      quantity: number
      productCount: number
    }>
  }
  timestamp?: string
}

/**
 * Get comprehensive dashboard data
 */
export async function getSellerDashboardComprehensive(): Promise<SellerDashboardComprehensiveResponse['data']> {
  const response = await apiClient.get<SellerDashboardComprehensiveResponse>(
    '/api/seller/dashboard/comprehensive'
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch dashboard data')
}

/**
 * Get top products report
 */
export async function getSellerTopProductsReport(): Promise<TopProductsReportResponse['data']> {
  const response = await apiClient.get<TopProductsReportResponse>(
    '/api/seller/reports/top-products'
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch top products report')
}
