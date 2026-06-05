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

export function formatAdminRoleLabel(role: AdminJwtRole | string | undefined | null): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin"
    case "FINOPS_ANALYST":
      return "FinOps"
    case "COMPLIANCE_MANAGER":
      return "Compliance"
    case "LOGISTICS_COORDINATOR":
      return "Logistics"
    case "TECH_SUPPORT":
      return "Tech Support"
    default:
      return role ? String(role).replace(/_/g, " ") : "Admin"
  }
}

function hasAdminRole(
  adminRole: AdminJwtRole | string | undefined | null,
  allowed: readonly AdminJwtRole[]
): boolean {
  if (!adminRole) return allowed.includes("SUPER_ADMIN")
  if (adminRole === "SUPER_ADMIN") return true
  return (allowed as readonly string[]).includes(adminRole)
}

export function canAccessTeamSettings(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN"])
}

export function canAccessAuditTrail(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN"])
}

export function canAccessPayouts(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "FINOPS_ANALYST"])
}

export function canAccessReports(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "FINOPS_ANALYST"])
}

export function canAccessCompliance(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "COMPLIANCE_MANAGER"])
}

export function canAccessUsers(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "COMPLIANCE_MANAGER", "TECH_SUPPORT"])
}

export function canAccessDispatch(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "LOGISTICS_COORDINATOR"])
}

export function canAccessLogistics(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "LOGISTICS_COORDINATOR"])
}

export function canAccessReturns(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "COMPLIANCE_MANAGER"])
}

export function canAccessProducts(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "COMPLIANCE_MANAGER", "TECH_SUPPORT"])
}

export function canAccessBlogs(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "TECH_SUPPORT"])
}

export function canAccessReviews(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "COMPLIANCE_MANAGER", "TECH_SUPPORT"])
}

export function canAccessAlerts(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ADMIN_JWT_ROLES)
}

export function canAccessDashboard(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ADMIN_JWT_ROLES)
}

export function canAccessNotifications(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ADMIN_JWT_ROLES)
}

export function canAccessSettings(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ADMIN_JWT_ROLES)
}

export type AdminNavItemId =
  | "dashboard"
  | "notifications"
  | "alerts"
  | "users"
  | "products"
  | "compliance"
  | "blogs"
  | "dispatch"
  | "logistics"
  | "payouts"
  | "returns"
  | "reviews"
  | "reports"
  | "settings"
  | "team"
  | "audit"

export function canAccessAdminNavItem(
  itemId: AdminNavItemId,
  adminRole: AdminJwtRole | string | undefined | null
): boolean {
  switch (itemId) {
    case "dashboard":
      return canAccessDashboard(adminRole)
    case "notifications":
      return canAccessNotifications(adminRole)
    case "alerts":
      return canAccessAlerts(adminRole)
    case "users":
      return canAccessUsers(adminRole)
    case "products":
      return canAccessProducts(adminRole)
    case "compliance":
      return canAccessCompliance(adminRole)
    case "blogs":
      return canAccessBlogs(adminRole)
    case "dispatch":
      return canAccessDispatch(adminRole)
    case "logistics":
      return canAccessLogistics(adminRole)
    case "payouts":
      return canAccessPayouts(adminRole)
    case "returns":
      return canAccessReturns(adminRole)
    case "reviews":
      return canAccessReviews(adminRole)
    case "reports":
      return canAccessReports(adminRole)
    case "settings":
      return canAccessSettings(adminRole)
    case "team":
      return canAccessTeamSettings(adminRole)
    case "audit":
      return canAccessAuditTrail(adminRole)
    default:
      return false
  }
}

/** FinOps + Super Admin can call financial reconciliation APIs (`requireFinOps`). */
export function isFinOpsAdminRole(role: AdminJwtRole | string | undefined | null): boolean {
  if (!role) return false
  return role === "SUPER_ADMIN" || role === "FINOPS_ANALYST"
}

export function canViewFinOpsReconciliation(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return canAccessPayouts(adminRole)
}

/** POST /api/admin/security/suspected-fraud — FinOps OR Compliance OR Super Admin. */
/** Carriers, regions, matrix mutations, shipment poll (`requireLogistics`). */
export function canEditLogisticsSettings(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return canAccessLogistics(adminRole)
}

export function canFlagSuspectedFraud(adminRole: AdminJwtRole | string | undefined | null): boolean {
  return hasAdminRole(adminRole, ["SUPER_ADMIN", "FINOPS_ANALYST", "COMPLIANCE_MANAGER"])
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
