"use client"

import Link from "next/link"
import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { adminMustChangePassword } from "@/lib/auth/auth-utils"
import { useAuth } from "@/lib/auth/auth-context"

export function AdminMustChangePasswordBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (user?.role !== "admin" || dismissed) return null
  if (!adminMustChangePassword() && !user?.mustChangePassword) return null

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-amber-900 dark:text-amber-100">
          You&apos;re using a temporary password. Change it now.
        </p>
        <Link
          href="/dashboard/admin/settings/password"
          className="text-accent hover:underline mt-1 inline-block"
        >
          Change password →
        </Link>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
