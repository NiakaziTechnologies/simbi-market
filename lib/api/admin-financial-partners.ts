/**
 * Admin: financial partners & loan applications.
 * Backend: {BASE}/api/admin/financial-partners (Bearer admin JWT).
 */

import { apiClient } from "./api-client"

const BASE = "/api/admin/financial-partners"

export interface PartnerFieldDefinition {
  key: string
  label: string
  type: string
  required?: boolean
}

/** Non-secret HTTP integration config (templates may reference {{secrets.key}}) */
export interface IntegrationConfigJson {
  baseUrl?: string
  submitPath?: string
  submitMethod?: string
  statusPath?: string
  statusMethod?: string
  timeoutMs?: number
  promoteToPartnerEnteredOnHttp2xx?: boolean
  headers?: Record<string, string>
  [key: string]: unknown
}

export interface FinancialPartnerSummary {
  id: string
  name: string
  slug: string
  description?: string | null
  minAmount?: number | null
  maxAmount?: number | null
  interestRate?: number | null
  termMonths?: number | null
  logo?: string | null
  contactEmail?: string | null
  feesAndTermsSummary?: string | null
  isActive: boolean
  fieldDefinitionsJson: PartnerFieldDefinition[]
  integrationConfigJson: IntegrationConfigJson
  hasIntegrationSecrets: boolean
  apiEndpoint?: string | null
  apiKey?: string | null
  webhookUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export type FinancialPartnerDetail = FinancialPartnerSummary

export interface CreateFinancialPartnerBody {
  name: string
  slug: string
  description?: string | null
  minAmount?: number | null
  maxAmount?: number | null
  interestRate?: number | null
  termMonths?: number | null
  logo?: string | null
  contactEmail?: string | null
  feesAndTermsSummary?: string | null
  isActive?: boolean
  fieldDefinitionsJson?: PartnerFieldDefinition[]
  integrationConfigJson?: IntegrationConfigJson
  /** Only on create / never returned on GET list */
  integrationSecretsJson?: Record<string, string>
  apiEndpoint?: string | null
  apiKey?: string | null
  webhookUrl?: string | null
}

export type UpdateFinancialPartnerBody = Partial<Omit<CreateFinancialPartnerBody, "integrationSecretsJson">>

export interface LoanApplicationPartnerRef {
  id: string
  name: string
  slug: string
}

export interface LoanApplicationSellerRef {
  id: string
  businessName: string
  email: string
}

export interface AdminLoanApplicationRow {
  id: string
  partnerId?: string
  sellerId?: string
  status: string
  requestedAmount?: number | null
  approvedAmount?: number | null
  partnerReferenceId?: string | null
  rejectionReason?: string | null
  customFieldsJson?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
  partner: LoanApplicationPartnerRef
  seller: LoanApplicationSellerRef
}

export interface LoanApplicationsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ListPartnersResponse {
  success: boolean
  data: FinancialPartnerSummary[]
  message?: string
}

export interface PartnerOneResponse {
  success: boolean
  data: FinancialPartnerDetail
  message?: string
}

export interface LoanApplicationsResponse {
  success: boolean
  data: AdminLoanApplicationRow[]
  pagination: LoanApplicationsPagination
  message?: string
}

export interface MutationResponse {
  success: boolean
  data?: FinancialPartnerDetail
  message?: string
}

export async function listFinancialPartners(): Promise<ListPartnersResponse> {
  return apiClient.get<ListPartnersResponse>(BASE)
}

export async function getFinancialPartner(id: string): Promise<PartnerOneResponse> {
  return apiClient.get<PartnerOneResponse>(`${BASE}/${encodeURIComponent(id)}`)
}

export async function createFinancialPartner(
  body: CreateFinancialPartnerBody
): Promise<MutationResponse> {
  return apiClient.post<MutationResponse>(BASE, body)
}

export async function updateFinancialPartner(
  id: string,
  body: UpdateFinancialPartnerBody
): Promise<MutationResponse> {
  return apiClient.put<MutationResponse>(`${BASE}/${encodeURIComponent(id)}`, body)
}

/** Merge/replace secret keys; omit or null/empty string removes a key (per API contract) */
export async function updateFinancialPartnerSecrets(
  id: string,
  body: Record<string, string | null | undefined>
): Promise<{ success: boolean; message?: string }> {
  return apiClient.put(`${BASE}/${encodeURIComponent(id)}/secrets`, body)
}

export async function deleteFinancialPartner(
  id: string
): Promise<{ success: boolean; message?: string }> {
  return apiClient.delete(`${BASE}/${encodeURIComponent(id)}`)
}

export interface LoanApplicationsQuery {
  partnerId?: string
  status?: string
  page?: number
  limit?: number
}

export async function listLoanApplications(
  query: LoanApplicationsQuery = {}
): Promise<LoanApplicationsResponse> {
  const params = new URLSearchParams()
  if (query.partnerId) params.set("partnerId", query.partnerId)
  if (query.status) params.set("status", query.status)
  if (query.page != null) params.set("page", String(query.page))
  if (query.limit != null) params.set("limit", String(Math.min(100, Math.max(1, query.limit))))
  const qs = params.toString()
  const path = qs ? `${BASE}/loan-applications?${qs}` : `${BASE}/loan-applications`
  return apiClient.get<LoanApplicationsResponse>(path)
}
