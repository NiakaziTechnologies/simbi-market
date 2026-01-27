/**
 * Admin Dashboard API endpoints
 */

import { apiClient } from './api-client'

/**
 * Comprehensive dashboard response
 */
export interface ComprehensiveDashboardResponse {
  success: boolean
  data: {
    totalSellers: number
    totalBuyers: number
    totalProducts: number
    totalOrders: number
    avgOrderValue: number
    gmv: number
    revenue30Days: number
    financial: {
      totalTransactions: number
      totalPayouts: number
      totalCommissions: number
      pendingPayouts: number
      chargebacks: number
      refunds: number
      varianceRate: number
    }
    compliance: {
      sriViolations: number
      sriViolationRate: number
      documentExpirations: number
      documentExpiryRate: number
      complianceScore: number
    }
    disputes: {
      totalDisputes: number
      openDisputes: number
      resolvedDisputes: number
      avgResolutionTime: number
      faultBasedDisputes: number
      noFaultDisputes: number
    }
    logistics: {
      totalCarriers: number
      activeCarriers: number
      totalShipments: number
      deliveredShipments: number
      deliveryRate: number
    }
    security: {
      tier1Alerts: number
      tier2Alerts: number
      tier3Alerts: number
      unauthorizedAccessAttempts: number
      securityAnomalies: number
    }
    performance: {
      failedTransactionRate: number
      apiUptime: number
      avgResponseTime: number
      systemHealth: string
    }
    recentActivity: any[]
    regulatory: {
      vatReports: number
      taxReports: number
      zimraCompliance: number
      mfaEnforcement: number
      passwordPolicyCompliance: number
    }
    monitoring: {
      paymentGatewayStatus: string
      vinDecoderStatus: string
      apiStatus: string
      databaseStatus: string
      lastHealthCheck: string
    }
    currency: {
      currentExchangeRate: number
      currencyPair: string
      lastUpdated: string
      varianceThreshold: number
    }
    staff: {
      totalAdmins: number
      activeAdmins: number
      finOpsAnalysts: number
      complianceManagers: number
      logisticsCoordinators: number
      techSupport: number
    }
    audit: {
      totalAuditLogs: number
      recentAuditActions: number
      complianceViolations: number
      lastAuditCheck: string
    }
    revenueTrends: {
      daily: Array<{
        date: string
        revenue: number
        orders: number
      }>
      weekly: Array<{
        week: string
        revenue: number
        orders: number
      }>
      monthly: Array<{
        month: string
        revenue: number
        orders: number
      }>
    }
  }
  timestamp: string
}

/**
 * Analytics dashboard response
 */
export interface AnalyticsDashboardResponse {
  success: boolean
  data: {
    productPerformance: {
      title: string
      subtitle: string
      categories: Array<{
        category: string
        revenue: number | null
        orders: number
        products: number
      }>
    }
    systemPerformance: {
      title: string
      subtitle: string
      metrics: {
        apiResponseTime: {
          value: number
          unit: string
          percentage: number
        }
        systemUptime: {
          value: number
          unit: string
          percentage: number
        }
        openDisputes: {
          value: number
          unit: string
          percentage: number
        }
      }
    }
  }
  timestamp: string
}

/**
 * Activity dashboard response
 */
export interface ActivityDashboardResponse {
  success: boolean
  data: {
    liveActivity: {
      title: string
      subtitle: string
      activities: Array<{
        id: string
        userType: string
        type: string
        description: string
        timestamp: string
        user: string
        entityType?: string
        entityId?: string
      }>
    }
    recentOrders: {
      title: string
      subtitle: string
      orders: Array<{
        id: string
        orderNumber: string
        buyerName: string
        sellerName: string
        totalAmount: number
        status: string
        createdAt: string
        itemsCount: number
      }>
    }
  }
  timestamp: string
}

/**
 * Reports dashboard response
 */
export interface ReportsDashboardResponse {
  success: boolean
  data: {
    userEngagement: {
      title: string
      subtitle: string
      metrics: {
        activeSellers: {
          label: string
          description: string
          value: number
          percentage: string
        }
        activeProducts: {
          label: string
          description: string
          value: number
          percentage: string
        }
        openDisputes: {
          label: string
          description: string
          value: number
          percentage: string
        }
      }
    }
    systemHealth: {
      title: string
      subtitle: string
      statuses: Array<{
        label: string
        status: string
        timestamp?: string
      }>
    }
  }
  timestamp: string
}

/**
 * Get comprehensive dashboard data
 */
export async function getComprehensiveDashboard(): Promise<ComprehensiveDashboardResponse['data']> {
  const response = await apiClient.get<ComprehensiveDashboardResponse>('/api/admin/dashboard/comprehensive')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch comprehensive dashboard data')
}

/**
 * Get analytics dashboard data
 */
export async function getAnalyticsDashboard(): Promise<AnalyticsDashboardResponse['data']> {
  const response = await apiClient.get<AnalyticsDashboardResponse>('/api/admin/dashboard/analytics')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch analytics dashboard data')
}

/**
 * Get activity dashboard data
 */
export async function getActivityDashboard(): Promise<ActivityDashboardResponse['data']> {
  const response = await apiClient.get<ActivityDashboardResponse>('/api/admin/dashboard/activity')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch activity dashboard data')
}

/**
 * Get reports dashboard data
 */
export async function getReportsDashboard(): Promise<ReportsDashboardResponse['data']> {
  const response = await apiClient.get<ReportsDashboardResponse>('/api/admin/dashboard/reports')
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch reports dashboard data')
}

/**
 * Business Intelligence response
 */
export interface BusinessIntelligenceResponse {
  success: boolean
  data: {
    kpis: {
      totalRevenue: {
        value: number
        change: number
        changeType: 'positive' | 'negative'
        previousValue: number
      }
      totalOrders: {
        value: number
        change: number
        changeType: 'positive' | 'negative'
        previousValue: number
      }
      avgOrderValue: {
        value: number
        change: number
        changeType: 'positive' | 'negative'
        previousValue: number
      }
    }
    monthlyRevenueTrend: {
      title: string
      subtitle: string
      data: Array<{
        month: string
        revenue: number
      }>
    }
    salesByCategory: {
      title: string
      subtitle: string
      data: Array<{
        category: string
        amount: number
        percentage: number
        orderCount: number
      }>
    }
    period: {
      from: string
      to: string
      previousFrom: string
      previousTo: string
    }
  }
  timestamp: string
}

/**
 * Get business intelligence data
 */
export async function getBusinessIntelligence(
  dateFrom: string,
  dateTo: string
): Promise<BusinessIntelligenceResponse['data']> {
  const response = await apiClient.get<BusinessIntelligenceResponse>(
    `/api/admin/analytics/business-intelligence?dateFrom=${dateFrom}&dateTo=${dateTo}`
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error((response as any).error || (response as any).message || 'Failed to fetch business intelligence data')
}
