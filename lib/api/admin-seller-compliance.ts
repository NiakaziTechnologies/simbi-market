/**
 * Admin — seller compliance documents + audit scoring
 */

import { apiClient } from "./api-client"

export type SellerDocumentType =
  | "ZIMRA_CERTIFICATE"
  | "TIN_CERTIFICATE"
  | "KYC_DOCUMENT"
  | string

export type SellerDocumentStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "MISSING" | string

export interface SellerDocument {
  id: string
  sellerId: string
  documentType: SellerDocumentType
  status: SellerDocumentStatus
  fileUrl: string
  fileHash?: string | null
  issuedDate: string | null
  expiryDate: string | null
  uploadedAt: string
  approvedAt: string | null
  approvedBy: string | null
  rejectionReason: string | null
}

export interface SellerDocumentsResponse {
  success: boolean
  data?: SellerDocument[]
  message?: string
  timestamp?: string
}

export async function getSellerDocuments(sellerId: string): Promise<SellerDocument[]> {
  const res = await apiClient.get<SellerDocumentsResponse>(
    `/api/admin/sellers/${encodeURIComponent(sellerId)}/documents`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load seller documents")
}

export async function getPendingDocuments(): Promise<SellerDocument[]> {
  const res = await apiClient.get<SellerDocumentsResponse>("/api/admin/sellers/documents/pending")
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load pending documents")
}

export async function getExpiringDocuments(): Promise<SellerDocument[]> {
  const res = await apiClient.get<SellerDocumentsResponse>("/api/admin/sellers/documents/expiring")
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load expiring documents")
}

export async function getExpiredDocuments(): Promise<SellerDocument[]> {
  const res = await apiClient.get<SellerDocumentsResponse>("/api/admin/sellers/documents/expired")
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load expired documents")
}

export interface ApproveDocumentResponse {
  success: boolean
  data?: SellerDocument
  message?: string
}

export async function approveSellerDocument(docId: string): Promise<SellerDocument> {
  const res = await apiClient.post<ApproveDocumentResponse>(
    `/api/admin/sellers/documents/${encodeURIComponent(docId)}/approve`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Approve failed")
}

export interface RejectDocumentResponse {
  success: boolean
  data?: SellerDocument
  message?: string
}

export async function rejectSellerDocument(docId: string, reason: string): Promise<SellerDocument> {
  const res = await apiClient.post<RejectDocumentResponse>(
    `/api/admin/sellers/documents/${encodeURIComponent(docId)}/reject`,
    { reason }
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Reject failed")
}

export interface CreateComplianceAuditBody {
  score: number
  notes?: string
}

export interface ComplianceAuditRecord {
  id: string
  sellerId: string
  score: number
  notes: string | null
  auditedBy: string
  createdAt: string
}

export interface CreateComplianceAuditResponse {
  success: boolean
  data?: ComplianceAuditRecord
  message?: string
  timestamp?: string
}

export async function createComplianceAudit(
  sellerId: string,
  body: CreateComplianceAuditBody
): Promise<ComplianceAuditRecord> {
  const res = await apiClient.post<CreateComplianceAuditResponse>(
    `/api/admin/sellers/${encodeURIComponent(sellerId)}/compliance-audit`,
    body
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to create audit")
}

export interface ComplianceAuditSummary {
  latest: { score: number; createdAt: string } | null
  history: Array<{ score: number; createdAt: string }>
}

export interface ComplianceAuditSummaryResponse {
  success: boolean
  data?: ComplianceAuditSummary
  message?: string
  timestamp?: string
}

export async function getComplianceAuditSummary(sellerId: string, limit = 10): Promise<ComplianceAuditSummary> {
  const res = await apiClient.get<ComplianceAuditSummaryResponse>(
    `/api/admin/sellers/${encodeURIComponent(sellerId)}/compliance-audit?limit=${encodeURIComponent(String(limit))}`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load audit history")
}

