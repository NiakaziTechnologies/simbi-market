import type { CommerceShippingConfigData } from "@/lib/api/commerce-shipping-config"

/** Same rounding as server: cents, 2 decimal places */
export function roundShippingCents(raw: number): number {
  return Math.round((raw + Number.EPSILON) * 100) / 100
}

/** Distinct sellers in cart; minimum 1 so we never show $0 shipping from an empty seller set */
export function countDistinctSellers(items: { sellerId?: string }[]): number {
  const ids = new Set<string>()
  for (const item of items) {
    if (item.sellerId) ids.add(item.sellerId)
  }
  return Math.max(1, ids.size)
}

export interface ShippingEstimateResult {
  /** Total estimated shipping for all seller sub-orders; null until delivery distance is known in distance mode */
  amount: number | null
  usedDistanceFormula: boolean
  /** True when distance pricing missing — flat per seller used */
  usedFlatFallback: boolean
  /** Distance mode but user has not chosen a map point yet — UI shows … and excludes shipping from total */
  pendingDistanceSelection?: boolean
  /** carrier_v1: per-seller quotes still loading */
  pendingCarrierQuotes?: boolean
  /** carrier_v1: at least one seller quote failed */
  carrierQuoteError?: boolean
  usedCarrierQuotes?: boolean
  /** Optional UX hint */
  hint?: string
}

/**
 * Estimated total shipping: per-seller charge × seller count.
 * Distance: (km / kilometersPerBlock) * pricePerBlock per seller, then × sellers (shared distance).
 */
export function estimateShippingTotal(
  config: CommerceShippingConfigData,
  sellerCount: number,
  deliveryDistanceKm?: number | null
): ShippingEstimateResult {
  const flatTotal = roundShippingCents(config.flatRatePerSellerOrder * sellerCount)

  if (config.mode === "fixed") {
    return {
      amount: flatTotal,
      usedDistanceFormula: false,
      usedFlatFallback: false,
      pendingDistanceSelection: false,
    }
  }

  const dp = config.distancePricing
  if (!dp || dp.kilometersPerBlock <= 0 || dp.pricePerBlock < 0) {
    return {
      amount: flatTotal,
      usedDistanceFormula: false,
      usedFlatFallback: true,
      pendingDistanceSelection: false,
      hint: "Distance pricing unavailable; using flat fallback.",
    }
  }

  if (
    deliveryDistanceKm != null &&
    Number.isFinite(deliveryDistanceKm) &&
    deliveryDistanceKm >= 0
  ) {
    const raw = (deliveryDistanceKm / dp.kilometersPerBlock) * dp.pricePerBlock
    const perSeller = roundShippingCents(raw)
    return {
      amount: roundShippingCents(perSeller * sellerCount),
      usedDistanceFormula: true,
      usedFlatFallback: false,
      pendingDistanceSelection: false,
    }
  }

  return {
    amount: null,
    usedDistanceFormula: false,
    usedFlatFallback: false,
    pendingDistanceSelection: true,
    hint: "Tap Map, set your pin, then Save. Cost is from straight-line distance and your rates.",
  }
}
