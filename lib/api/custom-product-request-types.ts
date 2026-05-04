/**
 * Shared types for custom master-product requests (seller + admin UIs).
 */

export type CustomProductRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "MORE_INFO_NEEDED"

export interface CustomRequestSlo {
  reviewDueAt: string | null
  hoursRemaining: number | null
  isSloOverdue: boolean
  sloBreachedOnDecision?: boolean | null
}

export interface CustomProductRequestSellerSnapshot {
  id: string
  businessName?: string
  email?: string
  sri?: number | string | null
  [key: string]: unknown
}

export interface CustomProductRequestCreatedRef {
  id?: string
  masterProductId?: string
  [key: string]: unknown
}

export interface CustomProductRequestBase {
  id: string
  status: CustomProductRequestStatus
  productName: string
  category: string
  make: string
  model: string
  year?: number | null
  partCode?: string | null
  description?: string | null
  imageUrls: string[]
  specSheetUrl: string | null
  supplierDocUrls: string[]
  reviewDueAt: string | null
  slo: CustomRequestSlo
  adminNotes?: string | null
  rejectionReason?: string | null
  counterfeitCheckVerified?: boolean
  counterfeitCheckNotes?: string | null
  counterfeitCheckVerifiedAt?: string | null
  createdProduct?: CustomProductRequestCreatedRef | null
  createdAt?: string
  updatedAt?: string
}

export interface ListPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
