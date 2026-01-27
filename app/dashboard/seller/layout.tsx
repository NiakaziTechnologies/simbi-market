"use client"

import { useState } from "react"
import { SellerSidebar } from "@/components/dashboard/seller-sidebar"
import { SellerTopbar } from "@/components/dashboard/seller-topbar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="min-h-screen bg-background">
        <SellerSidebar
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <div className="lg:pl-64">
          <SellerTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
