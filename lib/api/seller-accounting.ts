/**
 * Seller Accounting API endpoints
 */

import { apiClient } from './api-client'

/**
 * Financial summary (Income Statement)
 */
export interface FinancialSummary {
  period: Record<string, any>
  revenue: {
    grossSales: number
    returnsAndRefunds: number
    netSales: number
  }
  costOfGoodsSold: {
    totalCOGS: number
    grossProfit: number
  }
  operatingExpenses: {
    RENT: number
    UTILITIES: number
    WAGES: number
    FUEL: number
    MARKETING: number
    EQUIPMENT: number
    SUPPLIES: number
    MAINTENANCE: number
    INSURANCE: number
    OTHER: number
    total: number
  }
  operatingIncome: number
  otherIncomeExpenses: {
    platformFees: number
    otherIncome: number
    otherExpenses: number
    total: number
  }
  netIncome: number
  totalRevenue: number
  totalExpenses: number
  totalCommission: number
  totalRefunds: number
  netProfit: number
}

/**
 * Financial summary response
 */
export interface FinancialSummaryResponse {
  success: boolean
  message: string
  data: FinancialSummary
  timestamp?: string
}

/**
 * Trial balance account
 */
export interface TrialBalanceAccount {
  id: string
  code: string
  name: string
  type: string
  parentId: string | null
  isActive: boolean
  isSystem: boolean
  description: string
  createdAt: string
  updatedAt: string
  accountId: string
  totalDebit: number
  totalCredit: number
  balance: number
}

/**
 * Trial balance response
 */
export interface TrialBalanceResponse {
  success: boolean
  message: string
  data: {
    accounts: TrialBalanceAccount[]
    totalDebits: number
    totalCredits: number
    difference: number
    isBalanced: boolean
  }
  timestamp?: string
}

/**
 * Ledger entry
 */
export interface LedgerEntry {
  id: string
  sellerId: string
  transactionDate: string
  type: "SALE" | "COMMISSION" | "EXPENSE" | "REFUND" | "PAYOUT" | "OTHER"
  category: string
  amountUSD: number
  amountZWL: number | null
  description: string
  referenceId: string
  debit: number
  credit: number
  balance: number
  createdAt: string
  updatedAt: string
  accountId: string
}

/**
 * Ledger response
 */
export interface LedgerResponse {
  success: boolean
  message: string
  data: {
    entries: LedgerEntry[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  timestamp?: string
}

/**
 * Expense breakdown item
 */
export interface ExpenseBreakdownItem {
  category: string
  amount: number
  percentage: number
  count: number
}

/**
 * Expense breakdown response
 */
export interface ExpenseBreakdownResponse {
  success: boolean
  message: string
  data: ExpenseBreakdownItem[]
  timestamp?: string
}

/**
 * Get financial summary (Income Statement)
 */
export async function getFinancialSummary(): Promise<FinancialSummary> {
  const response = await apiClient.get<FinancialSummaryResponse>(
    `/api/seller/accounting/summary`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch financial summary')
}

/**
 * Get trial balance
 */
export async function getTrialBalance(): Promise<TrialBalanceResponse['data']> {
  const response = await apiClient.get<TrialBalanceResponse>(
    `/api/seller/accounting/reports/trial-balance`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch trial balance')
}

/**
 * Get general ledger
 */
export async function getGeneralLedger(
  page: number = 1,
  limit: number = 20
): Promise<LedgerResponse['data']> {
  const response = await apiClient.get<LedgerResponse>(
    `/api/seller/accounting/ledger?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch general ledger')
}

/**
 * Get expense breakdown
 */
export async function getExpenseBreakdown(): Promise<ExpenseBreakdownItem[]> {
  const response = await apiClient.get<ExpenseBreakdownResponse>(
    `/api/seller/accounting/expenses/breakdown`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch expense breakdown')
}
