/**
 * Public shipping config for cart & checkout (no auth).
 * GET /api/commerce/shipping-config
 */

import { API_CONFIG } from "../config"

export type CommerceShippingMode = "fixed" | "distance"
export type CommerceShippingEngine = "legacy" | "carrier_v1"

export interface CommerceDistancePricing {
  pricePerBlock: number
  kilometersPerBlock: number
}

export interface CommerceShippingConfigData {
  mode: CommerceShippingMode
  flatRatePerSellerOrder: number
  distancePricing: CommerceDistancePricing | null
  shippingEngine: CommerceShippingEngine
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

  const json = (await response.json()) as CommerceShippingConfigResponse & {
    data?: Partial<CommerceShippingConfigData> & { shippingEngine?: string }
  }
  if (!json.success || !json.data) {
    throw new Error("Invalid shipping config response")
  }
  const d = json.data
  return {
    mode: d.mode === "distance" ? "distance" : "fixed",
    flatRatePerSellerOrder: Number(d.flatRatePerSellerOrder ?? 0),
    distancePricing:
      d.distancePricing &&
      typeof d.distancePricing === "object" &&
      typeof (d.distancePricing as CommerceDistancePricing).kilometersPerBlock === "number"
        ? (d.distancePricing as CommerceDistancePricing)
        : null,
    shippingEngine: d.shippingEngine === "carrier_v1" ? "carrier_v1" : "legacy",
  }
}
