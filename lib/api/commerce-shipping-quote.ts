/**
 * Public shipping quote (no auth) — carrier_v1 engine.
 * POST /api/commerce/shipping-quote
 */

import { API_CONFIG } from "../config"

export interface ShippingQuoteLine {
  masterProductId: string
  quantity: number
}

export interface ShippingQuoteRequest {
  sellerId: string
  lines: ShippingQuoteLine[]
  deliveryDistanceKm?: number
  regionCode?: string
  currency?: "USD" | "ZWL"
}

export interface ShippingQuoteData {
  cost: number
  etaHours: number
  paddedEtaHours?: number
  tier: string
  carrierId: string
  usedMatrixFallback?: boolean
  cacheHit?: boolean
  snapshot?: Record<string, unknown>
}

interface ShippingQuoteResponse {
  success: boolean
  data?: ShippingQuoteData
  message?: string
  timestamp?: string
}

export async function postCommerceShippingQuote(body: ShippingQuoteRequest): Promise<ShippingQuoteData> {
  const url = `${API_CONFIG.baseURL}/api/commerce/shipping-quote`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const json = (await response.json().catch(() => ({}))) as ShippingQuoteResponse & { message?: string }
  if (!response.ok) {
    throw new Error(json.message || `Shipping quote failed (${response.status})`)
  }
  if (!json.success || json.data == null) {
    throw new Error(json.message || "Invalid shipping quote response")
  }
  return json.data
}
