/**
 * Seller Staff API endpoints
 */

import { apiClient } from './api-client'

/**
 * Staff member
 */
export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  role: string
  salary: number
  hourlyRate: number
  startDate: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}

/**
 * Staff list response
 */
export interface StaffListResponse {
  success: boolean
  message: string
  data: {
    staff: StaffMember[]
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
 * Payroll run
 */
export interface PayrollRun {
  id: string
  sellerId: string
  period: "weekly" | "monthly" | "biweekly"
  periodStart: string
  periodEnd: string
  month: number | null
  year: number | null
  weekStart: string
  totalAmount: number
  staffCount: number
  payslipsCount: number
  status: "PROCESSED" | "PENDING" | "FAILED"
  processedAt: string | null
  processedBy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  payslips: Array<{
    id: string
    staffId: string
    sellerId: string
    payrollRunId: string
    periodStart: string
    periodEnd: string
    grossPay: number
    totalHours: number | null
    hourlyPay: number | null
    salaryForPeriod: number
    netPay: number
    emailSent: boolean
    emailSentAt: string | null
    pdfUrl: string | null
    generatedAt: string
    paidAt: string | null
    staff: {
      id: string
      firstName: string
      lastName: string
      email: string
      position: string
      department: string
    }
  }>
}

/**
 * Payroll runs response
 */
export interface PayrollRunsResponse {
  success: boolean
  message: string
  data: {
    payrollRuns: PayrollRun[]
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
 * Process payroll request
 */
export interface ProcessPayrollRequest {
  period: "weekly" | "monthly" | "biweekly"
  weekStartDate?: string
  month?: number
  year?: number
}

/**
 * Process payroll response
 */
export interface ProcessPayrollResponse {
  success: boolean
  message: string
  data: PayrollRun
  timestamp?: string
}

/**
 * Activity log
 */
export interface ActivityLog {
  id: string
  staffId: string
  sellerId: string
  action: string | null
  entityType: string | null
  entityId: string | null
  description: string
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  activityType: string
  staff: {
    firstName: string
    lastName: string
  }
}

/**
 * Activity logs response
 */
export interface ActivityLogsResponse {
  success: boolean
  message: string
  data: ActivityLog[]
  timestamp?: string
}

/**
 * Get staff members
 */
export async function getStaffMembers(
  page: number = 1,
  limit: number = 20
): Promise<StaffListResponse['data']> {
  const response = await apiClient.get<StaffListResponse>(
    `/api/seller/staff?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch staff members')
}

/**
 * Get payroll runs
 */
export async function getPayrollRuns(
  page: number = 1,
  limit: number = 20
): Promise<PayrollRunsResponse['data']> {
  const response = await apiClient.get<PayrollRunsResponse>(
    `/api/seller/staff/payroll/runs?page=${page}&limit=${limit}`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch payroll runs')
}

/**
 * Process payroll
 */
export async function processPayroll(
  request: ProcessPayrollRequest
): Promise<ProcessPayrollResponse['data']> {
  const response = await apiClient.post<ProcessPayrollResponse>(
    `/api/seller/staff/payroll/process`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to process payroll')
}

/**
 * Preview payroll
 */
export async function previewPayroll(
  request: ProcessPayrollRequest
): Promise<any> {
  const response = await apiClient.post(
    `/api/seller/staff/payroll/preview`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to preview payroll')
}

/**
 * Get activity logs
 */
export async function getActivityLogs(): Promise<ActivityLog[]> {
  const response = await apiClient.get<ActivityLogsResponse>(
    `/api/seller/staff/activity-logs`
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to fetch activity logs')
}

/**
 * Create staff member request
 */
export interface CreateStaffMemberRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  role: string
  position: string
  salary: number
  hourlyRate?: number
  startDate: string
}

/**
 * Create staff member response
 */
export interface CreateStaffMemberResponse {
  success: boolean
  message: string
  data: {
    staff: StaffMember
    tempPassword: string
  }
  timestamp?: string
}

/**
 * Create staff member
 */
export async function createStaffMember(
  request: CreateStaffMemberRequest
): Promise<CreateStaffMemberResponse['data']> {
  const response = await apiClient.post<CreateStaffMemberResponse>(
    `/api/seller/staff`,
    request
  )

  if (response.success && response.data) {
    return response.data
  }

  throw new Error(response.error || response.message || 'Failed to create staff member')
}
