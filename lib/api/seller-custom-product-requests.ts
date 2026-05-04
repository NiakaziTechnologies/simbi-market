/**
 * Seller: custom product requests (multipart create/resubmit, JSON list/detail).
 */

import { apiClient } from "./api-client"
import type {
  CustomProductRequestBase,
  ListPagination,
} from "./custom-product-request-types"
import {
  extractEntity,
  normalizeListEnvelope,
} from "./normalize-api-response"

const BASE = "/api/seller/products/custom-requests"

export type { CustomProductRequestBase } from "./custom-product-request-types"

export interface CustomProductRequestSeller extends CustomProductRequestBase {
  sellerId?: string
}

export interface CustomProductRequestTextBody {
  productName: string
  category: string
  make: string
  model: string
  year?: number | null
  partCode?: string | null
  description?: string | null
}

export interface CustomProductRequestFiles {
  images: File[]
  specSheet: File
  supplierDocs: File[]
}

function appendTextFields(
  form: FormData,
  body: CustomProductRequestTextBody
) {
  form.set("productName", body.productName)
  form.set("category", body.category)
  form.set("make", body.make)
  form.set("model", body.model)
  if (body.year != null && body.year !== ("" as unknown as number)) {
    form.set("year", String(body.year))
  }
  if (body.partCode) form.set("partCode", body.partCode)
  if (body.description) form.set("description", body.description)
}

function appendFiles(form: FormData, files: CustomProductRequestFiles) {
  for (const file of files.images) {
    form.append("images", file)
  }
  form.set("specSheet", files.specSheet)
  for (const f of files.supplierDocs) {
    form.append("supplierDocs", f)
  }
}

function buildFormData(
  body: CustomProductRequestTextBody,
  files: CustomProductRequestFiles
): FormData {
  const form = new FormData()
  appendTextFields(form, body)
  appendFiles(form, files)
  return form
}

export function validateCustomRequestFiles(
  files: CustomProductRequestFiles
): string | null {
  if (files.images.length < 3) return "Add at least 3 product images"
  if (files.images.length > 10) return "Maximum 10 images"
  if (!files.specSheet) return "OEM specification PDF is required"
  if (files.supplierDocs.length < 1) return "At least one supplier PDF is required"
  if (files.supplierDocs.length > 10) return "Maximum 10 supplier documents"
  return null
}

export function validateCustomRequestText(
  body: CustomProductRequestTextBody
): string | null {
  if (!body.productName?.trim()) return "Product name is required"
  if (!body.category?.trim()) return "Category is required"
  if (!body.make?.trim()) return "Make is required"
  if (!body.model?.trim()) return "Model is required"
  return null
}

export async function createCustomProductRequest(
  body: CustomProductRequestTextBody,
  files: CustomProductRequestFiles
): Promise<{ success: boolean; data?: CustomProductRequestSeller; message?: string }> {
  const form = buildFormData(body, files)
  const raw = await apiClient.postFormData<Record<string, unknown>>(BASE, form)
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const r = raw as Record<string, unknown>
  const data = extractEntity<CustomProductRequestSeller>(raw, [
    "data",
    "request",
    "item",
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

export async function resubmitCustomProductRequest(
  id: string,
  body: CustomProductRequestTextBody,
  files: CustomProductRequestFiles
): Promise<{ success: boolean; data?: CustomProductRequestSeller; message?: string }> {
  const form = buildFormData(body, files)
  const raw = await apiClient.postFormData<Record<string, unknown>>(
    `${BASE}/${encodeURIComponent(id)}/resubmit`,
    form
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const r = raw as Record<string, unknown>
  const data = extractEntity<CustomProductRequestSeller>(raw, [
    "data",
    "request",
    "item",
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

const LIST_ARRAY_KEYS = ["data", "requests", "items", "rows"]

export async function listCustomProductRequests(params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  data: CustomProductRequestSeller[]
  pagination?: ListPagination
  message?: string
}> {
  const q = new URLSearchParams()
  if (params?.status) q.set("status", params.status)
  if (params?.page != null) q.set("page", String(params.page))
  if (params?.limit != null) q.set("limit", String(params.limit))
  const suffix = q.toString() ? `?${q.toString()}` : ""
  const raw = await apiClient.get<Record<string, unknown>>(`${BASE}${suffix}`)
  return normalizeListEnvelope<CustomProductRequestSeller>(raw, LIST_ARRAY_KEYS)
}

export async function getCustomProductRequest(
  id: string
): Promise<{
  success: boolean
  data?: CustomProductRequestSeller
  message?: string
}> {
  const raw = await apiClient.get<Record<string, unknown>>(
    `${BASE}/${encodeURIComponent(id)}`
  )
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response" }
  }
  const data = extractEntity<CustomProductRequestSeller>(raw, [
    "data",
    "request",
    "item",
  ])
  const r = raw as Record<string, unknown>
  const success = r.success !== false
  const message =
    typeof r.message === "string"
      ? r.message
      : typeof r.error === "string"
        ? r.error
        : undefined
  return { success, data, message }
}
