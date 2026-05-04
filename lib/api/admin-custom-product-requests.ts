/**
 * Admin: custom product requests (queue, detail, review actions).
 */

import { apiClient } from "./api-client"
import type {
  CustomProductRequestBase,
  CustomProductRequestSellerSnapshot,
  ListPagination,
} from "./custom-product-request-types"
import {
  extractEntity,
  extractStatsRecord,
  normalizeListEnvelope,
} from "./normalize-api-response"

const BASE = "/api/admin/products/custom-requests"

export interface CustomProductRequestAdmin extends CustomProductRequestBase {
  seller: CustomProductRequestSellerSnapshot
}

const LIST_ARRAY_KEYS = ["data", "requests", "items", "rows"]

export async function listAdminCustomProductRequests(params?: {
  overdue?: boolean
  status?: string
  sellerId?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  data: CustomProductRequestAdmin[]
  pagination?: ListPagination
  message?: string
}> {
  const q = new URLSearchParams()
  if (params?.overdue === true) q.set("overdue", "true")
  if (params?.overdue === false) q.set("overdue", "false")
  if (params?.status) q.set("status", params.status)
  if (params?.sellerId) q.set("sellerId", params.sellerId)
  if (params?.page != null) q.set("page", String(params.page))
  if (params?.limit != null) q.set("limit", String(params.limit))
  const suffix = q.toString() ? `?${q.toString()}` : ""
  const raw = await apiClient.get<Record<string, unknown>>(`${BASE}${suffix}`)
  return normalizeListEnvelope<CustomProductRequestAdmin>(raw, LIST_ARRAY_KEYS)
}

export async function getAdminCustomProductRequestStats(): Promise<{
  success: boolean
  data?: Record<string, number>
  message?: string
}> {
  const raw = await apiClient.get<Record<string, unknown>>(`${BASE}/stats`)
  if (!raw || typeof raw !== "object") {
    return { success: false }
  }
  const r = raw as Record<string, unknown>
  const data = extractStatsRecord(raw)
  const success = r.success !== false
  const message =
    typeof r.message === "string" ? r.message : undefined
  return { success, data, message }
}

export async function getAdminCustomProductRequest(
  id: string
): Promise<{
  success: boolean
  data?: CustomProductRequestAdmin
  message?: string
}> {
  const raw = await apiClient.get<Record<string, unknown>>(
    `${BASE}/${encodeURIComponent(id)}`
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const data = extractEntity<CustomProductRequestAdmin>(raw, [
    "data",
    "request",
    "item",
  ])
  const r = raw as Record<string, unknown>
  const success = r.success !== false
  const message =
    typeof r.message === "string"
      ? r.message
      : typeof r.error === "string"
        ? r.error
        : undefined
  return { success, data, message }
}

export async function verifyCounterfeitDocumentation(
  id: string,
  body: { notes: string }
): Promise<{ success: boolean; data?: CustomProductRequestAdmin; message?: string }> {
  return apiClient.post(
    `${BASE}/${encodeURIComponent(id)}/verify-counterfeit`,
    body
  )
}

export async function approveCustomProductRequest(
  id: string,
  body?: { adminNotes?: string }
): Promise<{ success: boolean; data?: CustomProductRequestAdmin; message?: string }> {
  return apiClient.post(
    `${BASE}/${encodeURIComponent(id)}/approve`,
    body || {}
  )
}

export async function rejectCustomProductRequest(
  id: string,
  body: { adminNotes?: string; rejectionReason?: string }
): Promise<{ success: boolean; data?: CustomProductRequestAdmin; message?: string }> {
  return apiClient.post(
    `${BASE}/${encodeURIComponent(id)}/reject`,
    body
  )
}

export async function requestMoreInfoCustomProduct(
  id: string,
  body: { adminNotes: string }
): Promise<{ success: boolean; data?: CustomProductRequestAdmin; message?: string }> {
  return apiClient.post(
    `${BASE}/${encodeURIComponent(id)}/request-info`,
    body
  )
}
