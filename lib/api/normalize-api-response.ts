/**
 * Normalize list/detail responses from backends that use different key names
 * (e.g. `requests` vs `data`, top-level `total` vs `pagination`).
 */

import type { ListPagination } from "./custom-product-request-types"

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v)
}

/**
 * First matching array on `raw` for any of the given keys.
 */
export function extractArray<T = unknown>(raw: unknown, keys: string[]): T[] {
  if (!isRecord(raw)) return []
  for (const k of keys) {
    const v = raw[k]
    if (Array.isArray(v)) return v as T[]
  }
  return []
}

/**
 * Build pagination from nested `pagination` or top-level page/total/totalPages/limit.
 */
export function extractPagination(
  raw: unknown,
  listLength: number
): ListPagination | undefined {
  if (!isRecord(raw)) return undefined
  const nested = raw.pagination
  if (isRecord(nested)) {
    const page = Number(nested.page ?? 1)
    const limit = Number(nested.limit ?? listLength)
    const total = Number(nested.total ?? listLength)
    const totalPages = Number(nested.totalPages ?? 1)
    if (Number.isFinite(page) && Number.isFinite(total)) {
      return { page, limit, total, totalPages }
    }
  }
  if (raw.page != null || raw.total != null || raw.totalPages != null) {
    return {
      page: Number(raw.page ?? 1),
      limit: Number(
        raw.limit != null && raw.limit !== "" ? raw.limit : Math.max(1, listLength)
      ),
      total: Number(raw.total ?? listLength),
      totalPages: Number(raw.totalPages ?? 1),
    }
  }
  return undefined
}

export function normalizeListEnvelope<T>(raw: unknown, arrayKeys: string[]): {
  success: boolean
  data: T[]
  pagination?: ListPagination
  message?: string
} {
  if (!isRecord(raw)) {
    return { success: false, data: [] }
  }
  const data = extractArray<T>(raw, arrayKeys)
  const success = raw.success !== false
  const message =
    typeof raw.message === "string"
      ? raw.message
      : typeof raw.error === "string"
        ? raw.error
        : undefined
  const pagination = extractPagination(raw, data.length)
  return { success, data, pagination, message }
}

/**
 * First non-null object value for any of the keys (detail GETs).
 */
export function extractEntity<T = unknown>(raw: unknown, keys: string[]): T | undefined {
  if (!isRecord(raw)) return undefined
  for (const k of keys) {
    const v = raw[k]
    if (v != null && typeof v === "object" && !Array.isArray(v)) {
      return v as T
    }
  }
  return undefined
}

/**
 * stats / key-value summary: `data` | `stats` | `counts`
 */
export function extractStatsRecord(raw: unknown): Record<string, number> | undefined {
  if (!isRecord(raw)) return undefined
  const bag = raw.data ?? raw.stats ?? raw.counts
  if (bag != null && typeof bag === "object" && !Array.isArray(bag)) {
    return bag as Record<string, number>
  }
  return undefined
}
