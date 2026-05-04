/**
 * Admin logistics — carriers, regions, shipping matrix, shipments.
 * Base: /api/admin/logistics
 */

import { apiClient } from "./api-client"

export type ShippingTier = "SMALL" | "MEDIUM" | "LARGE" | string

export interface LogisticsCarrier {
  id: string
  name: string
  code?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  serviceLevels?: unknown[] | null
  isActive?: boolean
  hasApiIntegration?: boolean | null
  supportsWebhook?: boolean | null
  pollingIntervalMinutes?: number | null
  displayPriority?: number | null
  integrationConfig?: Record<string, unknown> | null
  integrationSecrets?: Record<string, unknown> | null
  slaConfig?: Record<string, unknown> | null
  apiKey?: string | null
  apiEndpoint?: string | null
  [key: string]: unknown
}

export interface LogisticsRegion {
  id: string
  regionCode: string
  name?: string | null
  primaryCarrierId: string
  failoverCarrierIds?: string[]
  [key: string]: unknown
}

export interface ShippingMatrixRow {
  id: string
  currency: string
  tier: ShippingTier
  maxLengthCm: number
  maxWidthCm: number
  maxHeightCm: number
  maxWeightKg: number
  baseCost: number
  baselineEtaHours: number
  isActive?: boolean
  [key: string]: unknown
}

export interface ShipmentTrackingEvent {
  standardStatus: string
  statusLabel: string
  rawStatus?: string | null
  location?: string | null
  notes?: string | null
  source?: "WEBHOOK" | "POLL" | "ADMIN" | string
  createdAt: string
  [key: string]: unknown
}

export interface LogisticsShipment {
  id: string
  orderId?: string | null
  carrierId?: string | null
  trackingEvents?: ShipmentTrackingEvent[]
  [key: string]: unknown
}

function pick<T = unknown>(raw: Record<string, unknown>, camel: string, snake: string): T | undefined {
  if (raw[camel] !== undefined && raw[camel] !== null) return raw[camel] as T
  if (raw[snake] !== undefined && raw[snake] !== null) return raw[snake] as T
  return undefined
}

function asObjectRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>
  return null
}

/** Some stacks return JSON columns as serialized strings. */
function parseMaybeJsonObject(v: unknown): Record<string, unknown> | null {
  if (v == null) return null
  let x: unknown = v
  if (typeof x === "string") {
    const t = x.trim()
    if (!t) return null
    try {
      x = JSON.parse(t) as unknown
    } catch {
      return null
    }
  }
  return asObjectRecord(x)
}

function parseMaybeJsonArray(v: unknown): unknown[] | null {
  if (v == null) return null
  if (Array.isArray(v)) return v
  if (typeof v === "string") {
    const t = v.trim()
    if (!t) return null
    try {
      const x = JSON.parse(t) as unknown
      return Array.isArray(x) ? x : null
    } catch {
      return null
    }
  }
  return null
}

/** Map list/detail payloads that use snake_case into camelCase for the admin UI. */
export function coerceLogisticsCarrier(input: unknown): LogisticsCarrier {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>
  const codeVal = raw.code ?? raw.carrier_code
  const slRaw = pick<unknown>(raw, "serviceLevels", "service_levels")
  const sl = parseMaybeJsonArray(slRaw)
  const pollRaw = pick(raw, "pollingIntervalMinutes", "polling_interval_minutes")
  const dispRaw = pick(raw, "displayPriority", "display_priority")
  const swRaw = pick(raw, "supportsWebhook", "supports_webhook")
  const supportsWebhook = swRaw != null ? swRaw !== false : true

  return {
    ...raw,
    id: String(raw.id ?? ""),
    name: String(pick(raw, "name", "name") ?? ""),
    code: codeVal != null ? String(codeVal) : null,
    contactEmail:
      pick(raw, "contactEmail", "contact_email") != null
        ? String(pick(raw, "contactEmail", "contact_email"))
        : null,
    contactPhone:
      pick(raw, "contactPhone", "contact_phone") != null
        ? String(pick(raw, "contactPhone", "contact_phone"))
        : null,
    serviceLevels: sl,
    hasApiIntegration: Boolean(pick(raw, "hasApiIntegration", "has_api_integration")),
    supportsWebhook,
    pollingIntervalMinutes:
      pollRaw != null && Number.isFinite(Number(pollRaw)) ? Number(pollRaw) : null,
    displayPriority: dispRaw != null && Number.isFinite(Number(dispRaw)) ? Number(dispRaw) : null,
    integrationConfig: parseMaybeJsonObject(pick(raw, "integrationConfig", "integration_config")),
    slaConfig: parseMaybeJsonObject(pick(raw, "slaConfig", "sla_config")),
    integrationSecrets: parseMaybeJsonObject(pick(raw, "integrationSecrets", "integration_secrets")),
    apiEndpoint: pick(raw, "apiEndpoint", "api_endpoint") != null ? String(pick(raw, "apiEndpoint", "api_endpoint")) : null,
    apiKey: pick(raw, "apiKey", "api_key") != null ? String(pick(raw, "apiKey", "api_key")) : null,
  } as LogisticsCarrier
}

export function coerceLogisticsRegion(input: unknown): LogisticsRegion {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>
  const foRaw = pick<unknown>(raw, "failoverCarrierIds", "failover_carrier_ids")
  const fo = parseMaybeJsonArray(foRaw) ?? (Array.isArray(foRaw) ? foRaw : null)
  return {
    ...raw,
    id: String(raw.id ?? ""),
    regionCode: String(pick(raw, "regionCode", "region_code") ?? ""),
    name: pick(raw, "name", "name") != null ? String(pick(raw, "name", "name")) : null,
    primaryCarrierId: String(pick(raw, "primaryCarrierId", "primary_carrier_id") ?? ""),
    failoverCarrierIds: Array.isArray(fo) ? (fo as string[]).map(String) : [],
  } as LogisticsRegion
}

export function coerceLogisticsShipment(input: unknown): LogisticsShipment {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>
  const evRaw = pick<unknown>(raw, "trackingEvents", "tracking_events")
  const ev = parseMaybeJsonArray(evRaw) ?? (Array.isArray(evRaw) ? evRaw : null)
  return {
    ...raw,
    id: String(raw.id ?? ""),
    orderId: pick(raw, "orderId", "order_id") != null ? String(pick(raw, "orderId", "order_id")) : null,
    carrierId: pick(raw, "carrierId", "carrier_id") != null ? String(pick(raw, "carrierId", "carrier_id")) : null,
    trackingEvents: Array.isArray(ev) ? (ev as ShipmentTrackingEvent[]) : undefined,
  } as LogisticsShipment
}

function okList<T>(res: { success?: boolean; data?: T[]; message?: string }): T[] {
  if (res.success !== false && Array.isArray(res.data)) return res.data
  throw new Error(res.message || "Request failed")
}

function okOne<T>(res: { success?: boolean; data?: T; message?: string }): T {
  if (res.success !== false && res.data != null) return res.data
  throw new Error(res.message || "Request failed")
}

export async function listLogisticsCarriers(): Promise<LogisticsCarrier[]> {
  const res = await apiClient.get<{ success?: boolean; data?: LogisticsCarrier[]; message?: string }>(
    "/api/admin/logistics/carriers"
  )
  return okList(res)
}

export async function getLogisticsCarrier(id: string): Promise<LogisticsCarrier> {
  const res = await apiClient.get<{ success?: boolean; data?: LogisticsCarrier; message?: string }>(
    `/api/admin/logistics/carriers/${encodeURIComponent(id)}`
  )
  return okOne(res)
}

export async function createLogisticsCarrier(body: Record<string, unknown>): Promise<LogisticsCarrier> {
  const res = await apiClient.post<{ success?: boolean; data?: LogisticsCarrier; message?: string }>(
    "/api/admin/logistics/carriers",
    body
  )
  return okOne(res)
}

export async function updateLogisticsCarrier(id: string, body: Record<string, unknown>): Promise<LogisticsCarrier> {
  const res = await apiClient.put<{ success?: boolean; data?: LogisticsCarrier; message?: string }>(
    `/api/admin/logistics/carriers/${encodeURIComponent(id)}`,
    body
  )
  return okOne(res)
}

export async function deleteLogisticsCarrier(id: string): Promise<void> {
  await apiClient.delete<{ success?: boolean; message?: string }>(
    `/api/admin/logistics/carriers/${encodeURIComponent(id)}`
  )
}

export async function listLogisticsRegions(): Promise<LogisticsRegion[]> {
  const res = await apiClient.get<{ success?: boolean; data?: LogisticsRegion[]; message?: string }>(
    "/api/admin/logistics/regions"
  )
  return okList(res)
}

export async function createLogisticsRegion(body: {
  regionCode: string
  primaryCarrierId: string
  name?: string
  failoverCarrierIds?: string[]
}): Promise<LogisticsRegion> {
  const res = await apiClient.post<{ success?: boolean; data?: LogisticsRegion; message?: string }>(
    "/api/admin/logistics/regions",
    body
  )
  return okOne(res)
}

export async function updateLogisticsRegion(
  id: string,
  body: Partial<{
    regionCode: string
    primaryCarrierId: string
    name: string
    failoverCarrierIds: string[]
  }>
): Promise<LogisticsRegion> {
  const res = await apiClient.put<{ success?: boolean; data?: LogisticsRegion; message?: string }>(
    `/api/admin/logistics/regions/${encodeURIComponent(id)}`,
    body
  )
  return okOne(res)
}

export async function deleteLogisticsRegion(id: string): Promise<void> {
  await apiClient.delete<{ success?: boolean; message?: string }>(
    `/api/admin/logistics/regions/${encodeURIComponent(id)}`
  )
}

export async function listShippingMatrix(): Promise<ShippingMatrixRow[]> {
  const res = await apiClient.get<{ success?: boolean; data?: ShippingMatrixRow[]; message?: string }>(
    "/api/admin/logistics/shipping-matrix"
  )
  return okList(res)
}

export async function upsertShippingMatrixRow(body: {
  currency: string
  tier: ShippingTier
  maxLengthCm: number
  maxWidthCm: number
  maxHeightCm: number
  maxWeightKg: number
  baseCost: number
  baselineEtaHours: number
  isActive?: boolean
}): Promise<ShippingMatrixRow> {
  const res = await apiClient.post<{ success?: boolean; data?: ShippingMatrixRow; message?: string }>(
    "/api/admin/logistics/shipping-matrix",
    body
  )
  return okOne(res)
}

export async function listLogisticsShipments(): Promise<LogisticsShipment[]> {
  const res = await apiClient.get<{ success?: boolean; data?: LogisticsShipment[]; message?: string }>(
    "/api/admin/logistics/shipments"
  )
  return okList(res)
}

export async function getLogisticsShipment(id: string): Promise<LogisticsShipment> {
  const res = await apiClient.get<{ success?: boolean; data?: LogisticsShipment; message?: string }>(
    `/api/admin/logistics/shipments/${encodeURIComponent(id)}`
  )
  return okOne(res)
}

export async function pollLogisticsShipments(): Promise<void> {
  await apiClient.post<{ success?: boolean; message?: string }>("/api/admin/logistics/shipments/poll-updates")
}
