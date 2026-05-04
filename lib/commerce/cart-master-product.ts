/**
 * `POST /api/commerce/shipping-quote` expects `masterProductId` per line.
 * Cart Redux items use `masterProductId` when synced from API; otherwise fall back to `id`.
 */

import type { Part } from "@/lib/features/parts-slice"

export function masterProductIdForShippingQuote(item: Part & { masterProductId?: string }): string {
  return (item.masterProductId && item.masterProductId.trim()) || item.id
}
