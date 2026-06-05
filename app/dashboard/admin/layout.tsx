"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { AdminTopbar } from "@/components/dashboard/admin-topbar"
import { AdminMustChangePasswordBanner } from "@/components/dashboard/admin-must-change-password-banner"
import { AdminForbiddenToast } from "@/components/dashboard/admin-forbidden-toast"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        <AdminSidebar
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <div className="lg:pl-64">
          <AdminForbiddenToast />
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <AdminMustChangePasswordBanner />
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
