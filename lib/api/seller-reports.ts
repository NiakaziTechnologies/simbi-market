/**
 * Seller Reports API endpoints
 */

import { apiClient } from './api-client'

/**
 * Sales Report
 */
export interface SalesReport {
  summary: {
    totalOrders: number
    totalRevenue: number
    totalItems: number
    totalCommission: number
    netRevenue: number
    avgOrderValue: number
    growth: number
  }
  trends: {
    period: string
    data: Array<{
      period: string
      orderCount: number
      totalRevenue: number
      totalItems: number
      totalCommission: number
      netRevenue: number
    }>
  }
  daily: {
    data: Array<{
      date: string
      orderCount: number
      totalRevenue: number
      totalItems: number
      totalCommission: number
      netRevenue: number
      avgOrderValue: number
    }>
  }
  byCategory: {
    data: Array<{
      category: string
      orderCount: number
      totalRevenue: number | null
      totalItems: number
      avgOrderValue: number | null
    }>
  }
  breakdown: {
    byStatus: {
      delivered: number
      processing: number
      shipped: number
    }
    byPayment: {
      paid: number
      partial: number
      unpaid: number
    }
  }
  topCustomers: Array<{
    buyerId: string
    buyerName: string
    buyerEmail: string
    orderCount: number
    totalSpent: number
  }>
  period: Record<string, any>
}

/**
 * Products Report
 */
export interface ProductsReport {
  summary: {
    totalProducts: number
    activeProducts: number
    inactiveProducts: number
    lowStockCount: number
    outOfStockCount: number
    totalStockValue: number
    activeStockValue: number
  }
  products: Array<{
    inventoryId: string
    productName: string
    oemPartNumber: string
    manufacturer: string
    category: string
    currentPrice: number
    currency: string
    currentStock: number
    stockValue: number
    isLowStock: boolean
    isActive: boolean
    isOutOfStock: boolean
    totalSold: number
    totalRevenue: number | null
    orderCount: number
    avgOrderValue: number | null
    sellThroughRate: number
    salesTrend: Array<{
      date: string
      count: number
    }>
  }>
  topProducts: Array<{
    inventoryId: string
    productName: string
    oemPartNumber: string
    manufacturer: string
    category: string
    currentPrice: number
    currency: string
    currentStock: number
    stockValue: number
    isLowStock: boolean
    isActive: boolean
    isOutOfStock: boolean
    totalSold: number
    totalRevenue: number | null
    orderCount: number
    avgOrderValue: number | null
    sellThroughRate: number
    salesTrend: Array<{
      date: string
      count: number
    }>
  }>
  categoryPerformance: Array<{
    categoryName: string
    productCount: number
    totalSold: number
    totalRevenue: number | null
    stockValue: number
    avgRevenuePerProduct: number | null
  }>
  inventoryStatus: {
    active: any[]
    inactive: any[]
    lowStock: any[]
    outOfStock: any[]
  }
  period: Record<string, any>
}

/**
 * Financial Report
 */
export interface FinancialReport {
  incomeStatement: {
    period: Record<string, any>
    revenue: {
      grossSales: number
      returnsAndRefunds: number
      netSales: number
    }
    costOfGoodsSold: {
      totalCOGS: number
      grossProfit: number
    }
    operatingExpenses: {
      RENT: number
      UTILITIES: number
      WAGES: number
      FUEL: number
      MARKETING: number
      EQUIPMENT: number
      SUPPLIES: number
      MAINTENANCE: number
      INSURANCE: number
      OTHER: number
      total: number
    }
    operatingIncome: number
    otherIncomeExpenses: {
      platformFees: number
      otherIncome: number
      otherExpenses: number
      total: number
    }
    netIncome: number
    totalRevenue: number
    totalExpenses: number
    totalCommission: number
    totalRefunds: number
    netProfit: number
  }
  cashFlow: {
    summary: {
      totalInflow: number
      totalOutflow: number
      netCashFlow: number
    }
    byType: {
      sales: number
      expenses: number
      commission: number
      refunds: number
      payouts: number
    }
    trends: Array<{
      date: string
      inflow: number
      outflow: number
      net: number
    }>
  }
  revenue: {
    total: number
    trends: Array<{
      date: string
      revenue: number
    }>
  }
  expenses: {
    total: number
    breakdown: any[]
    byCategory: {
      RENT: number
      UTILITIES: number
      WAGES: number
      FUEL: number
      MARKETING: number
      EQUIPMENT: number
      SUPPLIES: number
      MAINTENANCE: number
      INSURANCE: number
      OTHER: number
      total: number
    }
    trends: Array<{
      date: string
      expenses: number
    }>
  }
  profit: {
    total: number
    trends: Array<{
      date: string
      revenue: number
      expenses: number
      profit: number
    }>
  }
  monthly: {
    data: Array<{
      month: string
      revenue: number
      expenses: number
      commission: number
      refunds: number
      netIncome: number
    }>
  }
  profitability: {
    grossProfitMargin: number
    operatingMargin: number
    netProfitMargin: number
  }
  period: Record<string, any>
}

/**
 * Returns Report
 */
export interface ReturnsReport {
  summary: {
    totalRefunds: number
    refundCount: number
    avgRefundAmount: number
    refundRate: number
    totalSales: number
    totalReturnRequests: number
    exchangeRequestCount: number
    returnRequestCount: number
  }
  refunds: any[]
  returnRequests: Array<{
    id: string
    orderId: string
    orderNumber: string
    requestType: string
    returnReason: string
    status: string
    buyerName: string
    buyerEmail: string
    orderAmount: number
    createdAt: string
    faultClassification: string | null
    isFaultBased: boolean
    resolvedAt?: string
  }>
  breakdown: {
    byReason: Array<{
      reason: string
      count: number
    }>
    byStatus: Array<{
      status: string
      count: number
    }>
  }
  trends: any[]
  period: Record<string, any>
}

/**
 * Get sales report
 */
export async function getSalesReport(
  period: string = "daily",
  startDate?: string,
  endDate?: string
): Promise<SalesReport> {
  const params = new URLSearchParams({ period })
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  const response = await apiClient.get<{ success: boolean; message: string; data: SalesReport }>(
    `/api/seller/reports/sales?${params.toString()}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch sales report')
}

/**
 * Get products report
 */
export async function getProductsReport(
  startDate?: string,
  endDate?: string
): Promise<ProductsReport> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  const response = await apiClient.get<{ success: boolean; message: string; data: ProductsReport }>(
    `/api/seller/reports/products?${params.toString()}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch products report')
}

/**
 * Get financial report
 */
export async function getFinancialReport(
  startDate?: string,
  endDate?: string
): Promise<FinancialReport> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  const response = await apiClient.get<{ success: boolean; message: string; data: FinancialReport }>(
    `/api/seller/reports/financial?${params.toString()}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch financial report')
}

/**
 * Get returns report
 */
export async function getReturnsReport(
  startDate?: string,
  endDate?: string
): Promise<ReturnsReport> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  const response = await apiClient.get<{ success: boolean; message: string; data: ReturnsReport }>(
    `/api/seller/reports/returns?${params.toString()}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch returns report')
}
