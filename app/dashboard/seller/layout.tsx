"use client"

import { useState } from "react"
import { SellerSidebar } from "@/components/dashboard/seller-sidebar"
import { SellerTopbar } from "@/components/dashboard/seller-topbar"
import { SellerAuthGuard } from "@/components/auth/seller-auth-guard"
import { SellerAuthProvider } from "@/lib/auth/seller-auth-context"

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SellerAuthProvider>
      <SellerAuthGuard>
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
      </SellerAuthGuard>
    </SellerAuthProvider>
  )
}
