/**
 * Seller compliance health (dashboard widget) + uploads
 */

import { apiClient } from "./api-client"

export type ComplianceRag = "GREEN" | "AMBER" | "RED"
export type ComplianceDocKey = "ZIMRA" | "TIN" | "KYC"
export type ComplianceDocumentStatus = "APPROVED" | "PENDING" | "REJECTED" | "EXPIRED" | "MISSING"

export type ComplianceDocumentType =
  | "ZIMRA_CERTIFICATE"
  | "TIN_CERTIFICATE"
  | "KYC_DOCUMENT"
  | string

export interface ComplianceHealthDocument {
  key: ComplianceDocKey
  label: string
  documentType: ComplianceDocumentType
  statusRag: ComplianceRag
  documentStatus: ComplianceDocumentStatus
  fileUrl: string | null
  issuedDate: string | null
  expiryDate: string | null
  daysUntilExpiry: number | null
  isExpiringSoon: boolean
  rejectionReason: string | null
  lastUploadedAt: string | null
}

export interface ComplianceNearestExpiry {
  documentType: ComplianceDocumentType
  expiryDate: string
  daysUntilExpiry: number
  isExpiringSoon: boolean
}

export interface ComplianceAuditScore {
  score: number
  auditedAt: string | null
  notes?: string | null
}

export interface ComplianceHealthData {
  documents: ComplianceHealthDocument[]
  nearestExpiry: ComplianceNearestExpiry | null
  auditScore: ComplianceAuditScore
}

export interface ComplianceHealthResponse {
  success: boolean
  data?: ComplianceHealthData
  message?: string
  timestamp?: string
}

export async function getComplianceHealth(): Promise<ComplianceHealthData> {
  const res = await apiClient.get<ComplianceHealthResponse>("/api/seller/dashboard/compliance-health")
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load compliance health")
}

export interface UploadComplianceResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    sellerId: string
    documentType: ComplianceDocumentType
    status: "PENDING" | "APPROVED" | "REJECTED" | string
    fileUrl: string
    issuedDate: string | null
    expiryDate: string | null
    uploadedAt: string
  }
  timestamp?: string
}

export interface UploadComplianceBody {
  file: File
  issuedDate?: string
  expiryDate?: string
}

function buildComplianceFormData(body: UploadComplianceBody): FormData {
  const form = new FormData()
  form.append("file", body.file)
  if (body.issuedDate) form.append("issuedDate", body.issuedDate)
  if (body.expiryDate) form.append("expiryDate", body.expiryDate)
  return form
}

export async function uploadZimra(body: UploadComplianceBody): Promise<UploadComplianceResponse> {
  const form = buildComplianceFormData(body)
  return await apiClient.postFormData<UploadComplianceResponse>("/api/seller/compliance/zimra", form)
}

export async function uploadTin(body: UploadComplianceBody): Promise<UploadComplianceResponse> {
  const form = buildComplianceFormData(body)
  return await apiClient.postFormData<UploadComplianceResponse>("/api/seller/compliance/tin", form)
}

export async function uploadKyc(body: UploadComplianceBody): Promise<UploadComplianceResponse> {
  const form = buildComplianceFormData(body)
  return await apiClient.postFormData<UploadComplianceResponse>("/api/seller/compliance/kyc", form)
}

