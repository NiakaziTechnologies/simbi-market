/**
 * Seller fulfilment queue widgets
 */

import { apiClient } from "./api-client"

export type SellerOrderStatus =
  | "PROCESSING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | string

export interface FulfilmentQueuePreviewItem {
  id: string
  orderNumber: string
  status: SellerOrderStatus
  createdAt: string
  sellerAcceptedAt: string | null
  dispatchedAt: string | null
  actualDeliveryDate: string | null
  ageHours: number
}

export interface FulfilmentQueueData {
  newOrders24hCount: number
  pendingShipmentOver48hCount: number
  pendingPayoutCount: number
  preview: FulfilmentQueuePreviewItem[]
}

export interface FulfilmentQueueResponse {
  success: boolean
  data?: FulfilmentQueueData
  message?: string
  timestamp?: string
}

export async function getFulfilmentQueue(previewLimit = 10): Promise<FulfilmentQueueData> {
  const res = await apiClient.get<FulfilmentQueueResponse>(
    `/api/seller/dashboard/fulfilment-queue?previewLimit=${encodeURIComponent(String(previewLimit))}`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load fulfilment queue")
}

