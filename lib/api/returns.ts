/**
 * Buyer returns/disputes API
 */

import { apiClient } from "./api-client"
import { API_CONFIG } from "../config"
import { getAuthToken } from "../auth/auth-utils"

export type DisputeType = "OTHER" | string
export type RequestType = "RETURN" | "EXCHANGE" | string
export type ReturnReason = "WRONG_PART" | string
export type ReturnStatus = string

export interface ReturnOrderItemInventory {
  id: string
  sellerImages?: string[]
  masterProduct?: {
    id: string
    name: string
  }
}

export interface ReturnOrderItem {
  id: string
  quantity: number
  unitPrice: number
  inventory?: ReturnOrderItemInventory
}

export interface ReturnOrderSummary {
  id: string
  orderNumber: string
  totalAmount: number
  currency: string
  status: string
  createdAt: string
  items: ReturnOrderItem[]
}

export interface BuyerReturn {
  id: string
  orderId: string
  disputeType: DisputeType
  requestType: RequestType
  returnReason: ReturnReason | null
  status: ReturnStatus
  buyerDescription: string | null
  sellerResponse: string | null
  adminNotes: string | null
  buyerEvidenceUrls: string[] | null
  sellerEvidenceUrls: string[] | null
  resolutionDate: string | null
  resolutionOutcome: string | null
  isFaultBased: boolean
  faultClassification: string | null
  returnLogisticsCost: number | null
  logisticsCostChargedTo: string | null
  createdAt: string
  updatedAt: string
  order?: ReturnOrderSummary
  metadata?: any
}

export interface ReturnsListResponse {
  success: boolean
  data: {
    returns: BuyerReturn[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ReturnDetailResponse {
  success: boolean
  data: BuyerReturn
}

export async function getReturns(page: number = 1, limit: number = 20): Promise<ReturnsListResponse["data"]> {
  const res = await apiClient.get<ReturnsListResponse>(`/api/buyer/returns?page=${page}&limit=${limit}`)
  if (res.success && res.data) return res.data
  throw new Error("Failed to fetch returns")
}

export async function getReturnById(returnId: string): Promise<BuyerReturn> {
  const res = await apiClient.get<ReturnDetailResponse>(`/api/buyer/returns/${returnId}`)
  if (res.success && res.data) return res.data
  throw new Error("Failed to fetch return details")
}

export type CreateReturnRequestType = "RETURN" | "EXCHANGE" | "DISPUTE"
export type CreateReturnReason = "WRONG_PART" | "DEFECTIVE" | "CHANGE_OF_MIND" | "COUNTERFEIT"

export interface CreateReturnJsonRequest {
  orderId: string
  requestType: CreateReturnRequestType
  description: string
  returnReason?: CreateReturnReason
  evidenceUrls: string[]
}

export interface CreateReturnResponse {
  success: boolean
  data: BuyerReturn
  message?: string
}

/**
 * Create return request (JSON) - requires at least 1 evidence URL.
 */
export async function createReturnJson(payload: CreateReturnJsonRequest): Promise<BuyerReturn> {
  const res = await apiClient.post<CreateReturnResponse>("/api/buyer/returns", payload)
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to create return request")
}

export interface CreateReturnMultipartRequest {
  orderId: string
  requestType: CreateReturnRequestType
  description: string
  returnReason?: CreateReturnReason
  evidenceUrls?: string[]
  files: File[]
}

/**
 * Create return request (multipart/form-data) - requires at least 1 evidence item via files and/or evidenceUrls.
 *
 * Note: we bypass apiClient here because it always sets JSON headers; FormData must not set Content-Type manually.
 */
export async function createReturnMultipart(payload: CreateReturnMultipartRequest): Promise<BuyerReturn> {
  const token = getAuthToken()
  if (!token) throw new Error("Authentication required")

  const form = new FormData()
  form.append("orderId", payload.orderId)
  form.append("requestType", payload.requestType)
  if (payload.returnReason) form.append("returnReason", payload.returnReason)
  form.append("description", payload.description)

  const urls = (payload.evidenceUrls || []).filter(Boolean)
  for (const url of urls) form.append("evidenceUrls[]", url)
  for (const f of payload.files) form.append("files", f)

  const resp = await fetch(`${API_CONFIG.baseURL}/api/buyer/returns`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  const json = (await resp.json().catch(() => null)) as CreateReturnResponse | null
  if (!resp.ok) {
    throw new Error(json?.message || `Failed to create return request (HTTP ${resp.status})`)
  }
  if (json?.success && json.data) return json.data
  throw new Error(json?.message || "Failed to create return request")
}


