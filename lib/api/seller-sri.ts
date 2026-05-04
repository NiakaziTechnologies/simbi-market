/**
 * Seller SRI endpoints
 */

import { apiClient } from "./api-client"

export type SriStatusColor = "GREEN" | "YELLOW" | "RED"

export interface SellerSriSummary {
  sellerId: string
  sriScore: number
  statusColor: SriStatusColor
  isEligible: boolean
  isShadowBanned: boolean
  lastSriCalculation: string
  warning: string | null
}

export interface SellerSriBreakdownAdviceItem {
  key: string
  title: string
  detail: string
}

export interface SellerSriBreakdown {
  sellerId: string
  sriScore: number
  statusColor: SriStatusColor
  lastSriCalculation: string
  weights: {
    fulfilment: number
    delivery: number
    defect: number
    compliance: number
  }
  components: {
    fulfilmentRate: number
    onTimeDeliveryRate: number
    defectRate: number
    complianceScore: number
  }
  advice: SellerSriBreakdownAdviceItem[]
}

export interface SellerSriSummaryResponse {
  success: boolean
  data?: SellerSriSummary
  message?: string
  timestamp?: string
}

export interface SellerSriBreakdownResponse {
  success: boolean
  data?: SellerSriBreakdown
  message?: string
  timestamp?: string
}

export async function getSellerSriSummary(): Promise<SellerSriSummary> {
  const res = await apiClient.get<SellerSriSummaryResponse>("/api/seller/sri/summary")
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load SRI summary")
}

export async function getSellerSriBreakdown(): Promise<SellerSriBreakdown> {
  const res = await apiClient.get<SellerSriBreakdownResponse>("/api/seller/sri/breakdown")
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load SRI breakdown")
}

