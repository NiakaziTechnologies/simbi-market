/**
 * Public shipping config for cart & checkout (no auth).
 * GET /api/commerce/shipping-config
 */

import { API_CONFIG } from "../config"

export type CommerceShippingMode = "fixed" | "distance"

export interface CommerceDistancePricing {
  pricePerBlock: number
  kilometersPerBlock: number
}

export interface CommerceShippingConfigData {
  mode: CommerceShippingMode
  flatRatePerSellerOrder: number
  distancePricing: CommerceDistancePricing | null
}

export interface CommerceShippingConfigResponse {
  success: boolean
  data: CommerceShippingConfigData
  timestamp?: string
}

/**
 * Fetch shipping config without JWT. Uses browser cache headers from API.
 */
export async function getCommerceShippingConfig(): Promise<CommerceShippingConfigData> {
  const url = `${API_CONFIG.baseURL}/api/commerce/shipping-config`
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ||
        `Shipping config request failed (${response.status})`
    )
  }

  const json = (await response.json()) as CommerceShippingConfigResponse
  if (!json.success || !json.data) {
    throw new Error("Invalid shipping config response")
  }
  return json.data
}
