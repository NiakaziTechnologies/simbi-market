/**
 * Admin authentication & team management API
 */

import { apiClient, type ApiError } from "./api-client"
import { setAuthToken, setUser, type User } from "../auth/auth-utils"
import type { AdminJwtRole } from "../auth/admin-rbac"

export type AdminRole = AdminJwtRole
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface AdminProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AdminRole
  status: UserStatus
  mfaEnabled?: boolean
  lastLoginAt: string | null
  lastLoginIp?: string | null
  createdAt?: string
  updatedAt?: string
  mustChangePassword?: boolean
}

export interface AdminLoginCredentials {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface CreateAdminRequest {
  email: string
  firstName: string
  lastName: string
  role: AdminRole
}

export interface UpdateAdminRequest {
  firstName?: string
  lastName?: string
  role?: AdminRole
  status?: UserStatus
}

function parseExpiresIn(expiresIn?: number | string): number | undefined {
  if (expiresIn == null) return undefined
  if (typeof expiresIn === "number") return expiresIn
  const match = expiresIn.match(/(\d+)([dhms])/)
  if (!match) return undefined
  const value = parseInt(match[1], 10)
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return value * (multipliers[unit] || 1)
}

export function adminProfileToUser(profile: AdminProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: "admin",
    adminRole: profile.role,
    status: profile.status,
    lastLoginAt: profile.lastLoginAt,
    mustChangePassword: profile.mustChangePassword,
  }
}

export async function adminLogin(credentials: AdminLoginCredentials): Promise<{
  user: User
  token: string
}> {
  const response = await apiClient.post<{
    success: boolean
    message?: string
    data?: {
      token?: string
      accessToken?: string
      expiresIn?: number | string
      userType?: string
      user?: AdminProfile
      admin?: AdminProfile
    }
  }>("/api/admin/auth/login", credentials)

  if (!response.success || !response.data) {
    throw new Error(response.message || "Login failed")
  }

  const { data } = response
  const token = data.token || data.accessToken
  const profile = data.user || data.admin

  if (!token || !profile) {
    throw new Error(response.message || "Invalid login response")
  }

  const expiresInSeconds = parseExpiresIn(data.expiresIn)
  setAuthToken(token, expiresInSeconds)

  const user = adminProfileToUser(profile)
  setUser(user)

  // Clear seller/buyer session keys
  if (typeof window !== "undefined") {
    localStorage.removeItem("sellerUserType")
    localStorage.removeItem("sellerUserRole")
    localStorage.removeItem("sellerProfile")
    localStorage.removeItem("staffProfile")
    if (profile.mustChangePassword) {
      localStorage.setItem("admin_must_change_password", "1")
    } else {
      localStorage.removeItem("admin_must_change_password")
    }
  }

  return { user, token }
}

export async function getAdminMe(): Promise<User | null> {
  try {
    const response = await apiClient.get<{
      success: boolean
      data?: AdminProfile
    }>("/api/admin/auth/me")

    if (response.success && response.data) {
      const user = adminProfileToUser(response.data)
      setUser(user)
      if (typeof window !== "undefined") {
        if (response.data.mustChangePassword) {
          localStorage.setItem("admin_must_change_password", "1")
        } else {
          localStorage.removeItem("admin_must_change_password")
        }
      }
      return user
    }
    return null
  } catch (error: unknown) {
    const err = error as { status?: number }
    if (err?.status !== 401) {
      console.warn("getAdminMe failed:", error)
    }
    return null
  }
}

export async function changeAdminPassword(body: ChangePasswordRequest): Promise<string> {
  const response = await apiClient.put<{
    success: boolean
    message?: string
    error?: string
  }>("/api/admin/settings/change-password", body)

  if (!response?.success) {
    throw {
      message: response?.message || "Failed to change password",
      status: 400,
      data: response,
    } satisfies ApiError
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_must_change_password")
  }

  return response.message || "Password changed successfully"
}

export async function getAdmins(): Promise<AdminProfile[]> {
  const response = await apiClient.get<{
    success: boolean
    data?: AdminProfile[] | { admins: AdminProfile[] }
    message?: string
  }>("/api/admin/auth/admins")

  if (!response.success) {
    throw new Error(response.message || "Failed to load admins")
  }

  const data = response.data
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && "admins" in data) {
    return (data as { admins: AdminProfile[] }).admins
  }
  return []
}

export async function createAdmin(body: CreateAdminRequest): Promise<AdminProfile> {
  const response = await apiClient.post<{
    success: boolean
    data?: AdminProfile
    message?: string
  }>("/api/admin/auth/admins", body)

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to create admin")
  }
  return response.data
}

export async function updateAdmin(id: string, body: UpdateAdminRequest): Promise<AdminProfile> {
  const response = await apiClient.put<{
    success: boolean
    data?: AdminProfile
    message?: string
  }>(`/api/admin/auth/admins/${id}`, body)

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to update admin")
  }
  return response.data
}
