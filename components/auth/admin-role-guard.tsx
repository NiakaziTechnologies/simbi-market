"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { canAccessAdminNavItem, type AdminNavItemId } from "@/lib/auth/admin-rbac"
import { Loader2 } from "lucide-react"

interface AdminRoleGuardProps {
  children: React.ReactNode
  /** Nav item id used for permission check */
  requiredAccess: AdminNavItemId
}

export function AdminRoleGuard({ children, requiredAccess }: AdminRoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const allowed =
    user?.role === "admin" && canAccessAdminNavItem(requiredAccess, user.adminRole)

  useEffect(() => {
    if (isLoading) return
    if (!allowed) {
      toast({
        title: "Access denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      })
      router.replace("/dashboard/admin")
    }
  }, [allowed, isLoading, router, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}
