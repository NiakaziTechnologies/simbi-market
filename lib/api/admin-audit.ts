/**
 * Admin audit trail API
 */

import { apiClient } from "./api-client"
import type { AdminProfile } from "./admin-auth"

export type AuditAction =
  | "LOGIN"
  | "PASSWORD_CHANGED"
  | "ADMIN_CREATED"
  | "ADMIN_UPDATED"
  | "ADMIN_SUSPENDED"
  | "SETTINGS_UPDATED"
  | "SELLER_APPROVED"
  | "SELLER_UPDATED"
  | "ORDER_DISPATCHED"
  | "ORDER_STATUS_CHANGED"
  | "PAYOUT_RECORDED"
  | "CARRIER_CREATED"
  | "CARRIER_UPDATED"
  | "REGION_CREATED"
  | "REGION_UPDATED"
  | "MATRIX_UPDATED"
  | "DISPUTE_ASSIGNED"
  | "DISPUTE_RESOLVED"
  | "HTTP_MUTATION"
  | string

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  LOGIN: "Signed in",
  PASSWORD_CHANGED: "Changed password",
  ADMIN_CREATED: "Invited admin",
  ADMIN_UPDATED: "Updated admin",
  ADMIN_SUSPENDED: "Suspended admin",
  SETTINGS_UPDATED: "Updated settings",
  SELLER_APPROVED: "Approved seller",
  SELLER_UPDATED: "Updated seller",
  ORDER_DISPATCHED: "Dispatched order",
  ORDER_STATUS_CHANGED: "Changed order status",
  PAYOUT_RECORDED: "Recorded payout",
  CARRIER_CREATED: "Created carrier",
  CARRIER_UPDATED: "Updated carrier",
  REGION_CREATED: "Created region",
  REGION_UPDATED: "Updated region",
  MATRIX_UPDATED: "Updated shipping matrix",
  DISPUTE_ASSIGNED: "Assigned dispute",
  DISPUTE_RESOLVED: "Resolved dispute",
  HTTP_MUTATION: "API change",
}

export function formatAuditAction(action: string, metadata?: Record<string, unknown>): string {
  if (action === "HTTP_MUTATION" && metadata) {
    const method = metadata.method ?? ""
    const path = metadata.path ?? ""
    return `API change (${method} ${path})`.trim()
  }
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase()
}

export interface AuditLogEntry {
  id: string
  admin: Pick<AdminProfile, "firstName" | "lastName" | "email" | "role"> & { id?: string }
  action: AuditAction
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  createdAt: string
}

export interface ActivityLogsQuery {
  page?: number
  limit?: number
  adminId?: string
  action?: string
  from?: string
  to?: string
}

export interface ActivityLogsResponse {
  logs: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getActivityLogs(
  params: ActivityLogsQuery = {}
): Promise<ActivityLogsResponse> {
  const search = new URLSearchParams()
  if (params.page) search.set("page", String(params.page))
  if (params.limit) search.set("limit", String(params.limit))
  if (params.adminId) search.set("adminId", params.adminId)
  if (params.action) search.set("action", params.action)
  if (params.from) search.set("from", params.from)
  if (params.to) search.set("to", params.to)

  const qs = search.toString()
  const response = await apiClient.get<{
    success: boolean
    data?: {
      logs?: AuditLogEntry[]
      items?: AuditLogEntry[]
      pagination?: ActivityLogsResponse["pagination"]
      page?: number
      limit?: number
      total?: number
      totalPages?: number
    }
    message?: string
  }>(`/api/admin/audit/activity-logs${qs ? `?${qs}` : ""}`)

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to load activity logs")
  }

  const data = response.data
  const logs = data.logs ?? data.items ?? []
  const pagination = data.pagination ?? {
    page: data.page ?? params.page ?? 1,
    limit: data.limit ?? params.limit ?? 20,
    total: data.total ?? logs.length,
    totalPages: data.totalPages ?? 1,
  }

  return { logs, pagination }
}
