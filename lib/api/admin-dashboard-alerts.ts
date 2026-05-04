/**
 * Admin dashboard alerts (RBAC-filtered list, acknowledge, resolve).
 */

import { apiClient } from "./api-client"
import type { ApiError } from "./api-client"

export type AdminAlertTier = "CRITICAL" | "HIGH" | "LOW" | string
export type AdminAlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | string

export interface AdminAlert {
  id: string
  tier: AdminAlertTier
  status: AdminAlertStatus
  title: string
  message: string
  alertCode: string
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  assignedAdmin?: { id?: string; email?: string; name?: string } | null
  [key: string]: unknown
}

export interface AdminAlertsListResponse {
  success: boolean
  data?: AdminAlert[]
  message?: string
  timestamp?: string
}

export interface ListAdminAlertsParams {
  tier?: AdminAlertTier
  status?: AdminAlertStatus
  /** ISO-8601 — alerts with createdAt >= since */
  since?: string
  afterId?: string
}

function buildQuery(params?: ListAdminAlertsParams): string {
  if (!params) return ""
  const q = new URLSearchParams()
  if (params.tier) q.set("tier", params.tier)
  if (params.status) q.set("status", params.status)
  if (params.since) q.set("since", params.since)
  if (params.afterId) q.set("afterId", params.afterId)
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function listAdminDashboardAlerts(params?: ListAdminAlertsParams): Promise<AdminAlert[]> {
  const res = await apiClient.get<AdminAlertsListResponse>(
    `/api/admin/dashboard/alerts${buildQuery(params)}`
  )
  if (res.success && Array.isArray(res.data)) return res.data
  throw new Error(res.message || "Failed to load alerts")
}

export async function acknowledgeAdminAlert(alertId: string): Promise<void> {
  await apiClient.post<{ success?: boolean; message?: string }>(
    `/api/admin/dashboard/alerts/${encodeURIComponent(alertId)}/acknowledge`
  )
}

export async function resolveAdminAlert(alertId: string, resolutionNotes: string): Promise<void> {
  await apiClient.post<{ success?: boolean; message?: string }>(
    `/api/admin/dashboard/alerts/${encodeURIComponent(alertId)}/resolve`,
    { resolutionNotes }
  )
}

export function isForbiddenAlertAction(err: unknown): boolean {
  return typeof err === "object" && err != null && "status" in err && (err as ApiError).status === 403
}
