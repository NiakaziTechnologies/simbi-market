/**
 * Admin JWT roles (RBAC) — must match backend `authenticateAdmin` role claims.
 */

export type AdminJwtRole =
  | "SUPER_ADMIN"
  | "FINOPS_ANALYST"
  | "COMPLIANCE_MANAGER"
  | "LOGISTICS_COORDINATOR"
  | "TECH_SUPPORT"

const ADMIN_JWT_ROLES: readonly AdminJwtRole[] = [
  "SUPER_ADMIN",
  "FINOPS_ANALYST",
  "COMPLIANCE_MANAGER",
  "LOGISTICS_COORDINATOR",
  "TECH_SUPPORT",
] as const

export function parseAdminJwtRole(raw: string | undefined | null): AdminJwtRole | null {
  if (!raw) return null
  return (ADMIN_JWT_ROLES as readonly string[]).includes(raw) ? (raw as AdminJwtRole) : null
}

/** FinOps + Super Admin can call financial reconciliation APIs (`requireFinOps`). */
export function isFinOpsAdminRole(role: AdminJwtRole | string | undefined | null): boolean {
  if (!role) return false
  return role === "SUPER_ADMIN" || role === "FINOPS_ANALYST"
}

/**
 * When `adminRole` is missing (legacy `/me` or login), treat as full admin in the UI;
 * API still enforces `requireFinOps` / fraud auth.
 */
export function canViewFinOpsReconciliation(adminRole: AdminJwtRole | string | undefined | null): boolean {
  if (adminRole == null || adminRole === "") return true
  return isFinOpsAdminRole(adminRole)
}

/** POST /api/admin/security/suspected-fraud — FinOps OR Compliance OR Super Admin. */
/** Carriers, regions, matrix mutations, shipment poll (`requireLogistics`). */
export function canEditLogisticsSettings(adminRole: AdminJwtRole | string | undefined | null): boolean {
  if (adminRole == null || adminRole === "") return true
  return adminRole === "SUPER_ADMIN" || adminRole === "LOGISTICS_COORDINATOR"
}

export function canFlagSuspectedFraud(adminRole: AdminJwtRole | string | undefined | null): boolean {
  if (adminRole == null || adminRole === "") return true
  return (
    adminRole === "SUPER_ADMIN" ||
    adminRole === "FINOPS_ANALYST" ||
    adminRole === "COMPLIANCE_MANAGER"
  )
}

export function tierSortOrder(tier: string): number {
  if (tier === "CRITICAL") return 0
  if (tier === "HIGH") return 1
  if (tier === "LOW") return 2
  return 3
}

export function hrefForAlertEntity(
  entityType: string | undefined | null,
  entityId: string | undefined | null
): string | null {
  if (!entityId?.trim()) return null
  const t = (entityType || "").toUpperCase()
  if (t.includes("SELLER")) return "/dashboard/admin/compliance"
  if (t.includes("ORDER")) return "/dashboard/admin/dispatch"
  if (t.includes("DISPUTE")) return "/dashboard/admin/returns"
  return "/dashboard/admin/users"
}

export function isFraudClassAlert(alertCode: string | undefined, metadata: unknown): boolean {
  const code = (alertCode || "").toUpperCase()
  if (code === "FRAUD_INVESTIGATION") return true
  if (code.startsWith("SECURITY_")) return true
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const k = (metadata as Record<string, unknown>).kind
    if (k === "FRAUD_RISK") return true
  }
  return false
}
