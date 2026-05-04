/**
 * Admin financial reconciliation — daily rollup + auditable minute window.
 */

import { apiClient } from "./api-client"

export interface ReconciliationLine {
  orderId: string
  orderNumber?: string | null
  currency: string
  paidAt: string
  grossOrderTotal: number
  orderPlatformCommission: number
  sumGatewayTxnFees: number
  payoutGatewayFee?: number | null
  payoutNetAmount?: number | null
  payoutPlatformCommission?: number | null
  gatewayVariance: number
  gatewayVariancePct: number
  commissionVariance: number
  commissionVariancePct: number
  exceedsTolerance: boolean
  flags?: string[] | null
  [key: string]: unknown
}

export interface DailyReconciliationData {
  date: string
  totalOrders: number
  grossRevenue: number
  platformCommission: number
  gatewayFees: number
  sellerPayouts: number
  netRevenue: number
  variance: number
  variancePercentage: number
  linesExceedingTolerance: number
  tolerancePercent: number
  lines: ReconciliationLine[]
  records?: unknown[]
  [key: string]: unknown
}

export interface DailyReconciliationResponse {
  success: boolean
  data?: DailyReconciliationData
  message?: string
}

export async function getDailyReconciliation(date?: string): Promise<DailyReconciliationData> {
  const q = date ? `?date=${encodeURIComponent(date)}` : ""
  const res = await apiClient.get<DailyReconciliationResponse>(
    `/api/admin/financial/reconciliation/daily${q}`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load daily reconciliation")
}

export interface WindowReconciliationData {
  from: string
  to: string
  currency?: string
  lines: ReconciliationLine[]
  records?: unknown[]
  [key: string]: unknown
}

export interface WindowReconciliationResponse {
  success: boolean
  data?: WindowReconciliationData
  message?: string
}

export interface WindowReconciliationParams {
  from: string
  to: string
  currency?: "USD" | "ZWL" | string
}

function buildWindowQuery(p: WindowReconciliationParams): string {
  const q = new URLSearchParams()
  q.set("from", p.from)
  q.set("to", p.to)
  if (p.currency) q.set("currency", p.currency)
  return `?${q.toString()}`
}

export async function getReconciliationWindow(
  params: WindowReconciliationParams
): Promise<WindowReconciliationData> {
  const res = await apiClient.get<WindowReconciliationResponse>(
    `/api/admin/financial/reconciliation/window${buildWindowQuery(params)}`
  )
  if (res.success && res.data) return res.data
  throw new Error(res.message || "Failed to load reconciliation window")
}

/** Spec: sort by exceedsTolerance first, then gatewayVariancePct descending. */
export function sortReconciliationLines(lines: ReconciliationLine[]): ReconciliationLine[] {
  return [...lines].sort((a, b) => {
    if (a.exceedsTolerance !== b.exceedsTolerance) return a.exceedsTolerance ? -1 : 1
    return (b.gatewayVariancePct ?? 0) - (a.gatewayVariancePct ?? 0)
  })
}

export function reconciliationLinesToCsv(lines: ReconciliationLine[]): string {
  const headers = [
    "orderId",
    "orderNumber",
    "currency",
    "paidAt",
    "grossOrderTotal",
    "orderPlatformCommission",
    "sumGatewayTxnFees",
    "payoutGatewayFee",
    "payoutNetAmount",
    "payoutPlatformCommission",
    "gatewayVariance",
    "gatewayVariancePct",
    "commissionVariance",
    "commissionVariancePct",
    "exceedsTolerance",
    "flags",
  ]
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const rows = lines.map((line) =>
    headers
      .map((h) => {
        if (h === "flags") return esc(Array.isArray(line.flags) ? line.flags.join(";") : line.flags ?? "")
        return esc(line[h as keyof ReconciliationLine])
      })
      .join(",")
  )
  return [headers.join(","), ...rows].join("\n")
}
