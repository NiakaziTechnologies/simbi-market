/**
 * Admin security — manual suspected fraud flag.
 */

import { apiClient } from "./api-client"

export interface SuspectedFraudBody {
  notes: string
  sellerId?: string
  orderId?: string
}

export interface SuspectedFraudResponse {
  success: boolean
  data?: { id: string; alertCode: string }
  message?: string
  timestamp?: string
}

export async function postSuspectedFraud(body: SuspectedFraudBody): Promise<{ id: string; alertCode: string }> {
  const res = await apiClient.post<SuspectedFraudResponse>("/api/admin/security/suspected-fraud", body)
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Could not create fraud investigation alert")
}
