/**
 * Buyer analytics API endpoints
 */

import { apiClient } from './api-client'

export interface KPIMetric {
  value: number
  change: number
  changePercentage: number
  trend: 'up' | 'down' | 'neutral'
}

export interface KPIs {
  totalSpendYTD: KPIMetric
  openPurchaseOrders: KPIMetric
  pendingInvoiceTotal: KPIMetric
  availableMonthlyBudget: KPIMetric
}

export interface ChartDataPoint {
  month?: string
  category?: string
  supplier?: string
  amount: number
  value?: number
}

export interface MonthlySpendingTrend {
  title: string
  subtitle: string
  data: Array<{ month: string; amount: number }>
}

export interface SpendingByCategory {
  title: string
  subtitle: string
  data: Array<{ category: string; amount: number }>
}

export interface SupplierPerformance {
  title: string
  subtitle: string
  data: Array<{ supplier: string; amount: number }>
}

export interface BudgetUtilization {
  title: string
  subtitle: string
  used: number
  total: number
  percentage: number
  remaining: number
}

export interface RecentOrder {
  orderId: string
  orderNumber: string
  poNumber: string | null
  status: string
  costCenter: string | null
  total: number
  items: number
  date: string
  sellerName: string
}

export interface ComprehensiveAnalytics {
  kpis: KPIs
  charts: {
    monthlySpendingTrend: MonthlySpendingTrend
    spendingByCategory: SpendingByCategory
    supplierPerformance: SupplierPerformance
    budgetUtilization: BudgetUtilization
  }
  recentOrders: RecentOrder[]
}

export interface ComprehensiveAnalyticsResponse {
  success: boolean
  message: string
  data: ComprehensiveAnalytics
}

/**
 * Get comprehensive dashboard analytics
 */
export async function getComprehensiveAnalytics(): Promise<ComprehensiveAnalytics> {
  const response = await apiClient.get<ComprehensiveAnalyticsResponse>('/api/buyer/analytics/comprehensive')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.message || 'Failed to fetch analytics')
}
