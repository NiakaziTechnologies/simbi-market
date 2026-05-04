/**
 * Admin commerce pricing settings (shipping & platform commission)
 * GET any admin; PUT super admin only.
 */

import { apiClient } from "./api-client"

export type ShippingMode = "fixed" | "distance"
export type CommerceShippingEngineSetting = "legacy" | "carrier_v1"

export interface CommercePricingData {
  shippingMode: ShippingMode
  shippingFlatRate: number
  shippingDynamicPrice: number
  shippingDynamicDistanceKm: number
  commissionPercent: number
  useAdvancedProductRules: boolean
  shippingEngine: CommerceShippingEngineSetting
}

export interface CommercePricingGetResponse {
  success: boolean
  data: CommercePricingData
  keys?: Record<string, string>
  timestamp?: string
}

export interface CommercePricingPutResponse {
  success: boolean
  message?: string
  data: CommercePricingData
  timestamp?: string
}

/** Normalize API data if older responses omit new shipping fields */
export function normalizeCommercePricing(raw: Partial<CommercePricingData>): CommercePricingData {
  return {
    shippingMode: raw.shippingMode === "distance" ? "distance" : "fixed",
    shippingFlatRate: Number(raw.shippingFlatRate ?? 10),
    shippingDynamicPrice: Number(raw.shippingDynamicPrice ?? 5),
    shippingDynamicDistanceKm: Number(raw.shippingDynamicDistanceKm ?? 10),
    commissionPercent: Number(raw.commissionPercent ?? 10),
    useAdvancedProductRules: Boolean(raw.useAdvancedProductRules ?? true),
    shippingEngine: raw.shippingEngine === "carrier_v1" ? "carrier_v1" : "legacy",
  }
}

export async function getCommercePricing(): Promise<CommercePricingGetResponse> {
  return apiClient.get<CommercePricingGetResponse>("/api/admin/settings/commerce-pricing")
}

export async function updateCommercePricing(
  body: Partial<CommercePricingData>
): Promise<CommercePricingPutResponse> {
  try {
    return await apiClient.patch<CommercePricingPutResponse>(
      "/api/admin/settings/commerce-pricing",
      body
    )
  } catch (e: unknown) {
    const err = e as { status?: number }
    if (err.status === 404 || err.status === 405) {
      return apiClient.put<CommercePricingPutResponse>(
        "/api/admin/settings/commerce-pricing",
        body
      )
    }
    throw e
  }
}
