/**
 * Seller loans: partners, applications, sync, cancel.
 * Base: {BASE}/api/seller/loans — seller or staff JWT.
 */

import { apiClient } from "./api-client"
import {
  extractArray,
  extractEntity,
  normalizeListEnvelope,
} from "./normalize-api-response"

const BASE = "/api/seller/loans"

export type LoanAppStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PARTNER_ENTERED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DISBURSED"
  | "ACTIVE"
  | "PAID_OFF"
  | "DEFAULTED"
  | "CANCELLED"

export interface SellerLoanFieldDefinition {
  key: string
  label: string
  type: string
  required?: boolean
}

/** Seller-safe partner (no integration secrets) */
export interface SellerLoanPartner {
  id: string
  name: string
  slug?: string
  description?: string | null
  minAmount?: number | null
  maxAmount?: number | null
  interestRate?: number | null
  termMonths?: number | null
  logo?: string | null
  contactEmail?: string | null
  feesAndTermsSummary?: string | null
  fieldDefinitionsJson?: SellerLoanFieldDefinition[]
  isActive?: boolean
}

export interface LoanStatusEvent {
  id: string
  fromStatus: string | null
  toStatus: string
  source: string
  note?: string | null
  rawPayload?: unknown
  createdAt: string
}

export interface LoanApplicationSellerView {
  id: string
  partnerId: string
  partner: {
    id: string
    name: string
    slug?: string
    logo?: string | null
  }
  status: string
  requestedAmount: number
  purpose?: string | null
  collateralDescription?: string | null
  customFields?: Record<string, unknown>
  approvedAmount?: number | null
  rejectionReason?: string | null
  partnerReferenceId?: string | null
  last6MonthsRevenue?: number | null
  inventoryValue?: number | null
  storeHealthScore?: number | null
  monthlyOrderCount?: number | null
  verifiedSnapshot?: Record<string, unknown> | null
  statusEvents?: LoanStatusEvent[]
  createdAt: string
  updatedAt?: string
}

export interface SubmitLoanApplicationBody {
  partnerId: string
  requestedAmount: number
  purpose: string
  collateralDescription?: string
  customFields?: Record<string, string | number | boolean>
}

export async function listSellerLoanPartners(): Promise<{
  success: boolean
  data: SellerLoanPartner[]
  message?: string
}> {
  const raw = await apiClient.get<Record<string, unknown>>(`${BASE}/partners`)
  const n = normalizeListEnvelope<SellerLoanPartner>(raw, [
    "data",
    "partners",
    "items",
    "rows",
  ])
  return { success: n.success, data: n.data, message: n.message }
}

export async function listSellerLoanApplications(params?: {
  status?: string
}): Promise<{
  success: boolean
  data: LoanApplicationSellerView[]
  message?: string
}> {
  const q = params?.status ? `?status=${encodeURIComponent(params.status)}` : ""
  const raw = await apiClient.get<Record<string, unknown>>(
    `${BASE}/applications${q}`
  )
  const n = normalizeListEnvelope<LoanApplicationSellerView>(raw, [
    "data",
    "applications",
    "requests",
    "items",
    "loans",
    "rows",
  ])
  return { success: n.success, data: n.data, message: n.message }
}

export async function getSellerLoanApplication(id: string): Promise<{
  success: boolean
  data?: LoanApplicationSellerView
  message?: string
}> {
  const raw = await apiClient.get<Record<string, unknown>>(
    `${BASE}/applications/${encodeURIComponent(id)}`
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const r = raw as Record<string, unknown>
  const data = extractEntity<LoanApplicationSellerView>(raw, [
    "data",
    "application",
    "item",
  ])
  return {
    success: r.success !== false && data != null,
    data: data ?? undefined,
    message:
      typeof r.message === "string"
        ? r.message
        : typeof r.error === "string"
          ? r.error
          : undefined,
  }
}

export async function getSellerLoanStatusEvents(id: string): Promise<{
  success: boolean
  data: LoanStatusEvent[]
  message?: string
}> {
  const raw = await apiClient.get<Record<string, unknown>>(
    `${BASE}/applications/${encodeURIComponent(id)}/status-events`
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, data: [], message: "Invalid response" }
  }
  const r = raw as Record<string, unknown>
  const data = extractArray<LoanStatusEvent>(raw, [
    "data",
    "events",
    "statusEvents",
    "items",
  ])
  return {
    success: r.success !== false,
    data,
    message:
      typeof r.message === "string"
        ? r.message
        : typeof r.error === "string"
          ? r.error
          : undefined,
  }
}

export async function submitSellerLoanApplication(
  body: SubmitLoanApplicationBody
): Promise<{
  success: boolean
  data?: LoanApplicationSellerView
  message?: string
}> {
  const raw = await apiClient.post<Record<string, unknown>>(
    `${BASE}/applications`,
    body
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const r = raw as Record<string, unknown>
  const data = extractEntity<LoanApplicationSellerView>(raw, [
    "data",
    "application",
    "item",
  ])
  return {
    success: r.success !== false,
    data: data ?? undefined,
    message:
      typeof r.message === "string"
        ? r.message
        : typeof r.error === "string"
          ? r.error
          : undefined,
  }
}

export async function syncSellerLoanApplicationStatus(id: string): Promise<{
  success: boolean
  message?: string
  data?: LoanApplicationSellerView
}> {
  const raw = await apiClient.post<Record<string, unknown>>(
    `${BASE}/applications/${encodeURIComponent(id)}/sync-status`,
    {}
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const r = raw as Record<string, unknown>
  const data = extractEntity<LoanApplicationSellerView>(raw, [
    "data",
    "application",
    "item",
  ])
  return {
    success: r.success !== false,
    message:
      typeof r.message === "string"
        ? r.message
        : typeof r.error === "string"
          ? r.error
          : undefined,
    data: data ?? undefined,
  }
}

export async function cancelSellerLoanApplication(id: string): Promise<{
  success: boolean
  message?: string
}> {
  return apiClient.post(`${BASE}/applications/${encodeURIComponent(id)}/cancel`, {})
}

/** UI helper: human-readable status */
export const LOAN_STATUS_COPY: Record<string, string> = {
  DRAFT: "Draft — not submitted",
  SUBMITTED: "Sent to platform; partner delivery may be in progress",
  PARTNER_ENTERED: "Partner acknowledged / received",
  UNDER_REVIEW: "Under review at the bank",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
  ACTIVE: "Active loan",
  PAID_OFF: "Paid off",
  DEFAULTED: "Defaulted",
  CANCELLED: "Cancelled by you",
}

export function loanStatusLabel(status: string): string {
  return LOAN_STATUS_COPY[status] ?? status.replace(/_/g, " ")
}

export function isLoanStatusInPipeline(status: string): boolean {
  return ["SUBMITTED", "PARTNER_ENTERED", "UNDER_REVIEW", "DRAFT"].includes(
    status
  )
}

export function isLoanStatusApprovedGroup(status: string): boolean {
  return ["APPROVED", "DISBURSED", "ACTIVE"].includes(status)
}

export function isLoanStatusRejectedGroup(status: string): boolean {
  return ["REJECTED", "DEFAULTED", "CANCELLED", "PAID_OFF"].includes(status)
}

export function canCancelLoanApplication(status: string): boolean {
  return ["SUBMITTED", "PARTNER_ENTERED", "UNDER_REVIEW"].includes(status)
}
