"use client"

import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="seller">
      <main className="min-h-screen bg-background">
        <Navigation />
        {children}
      </main>
    </ProtectedRoute>
  )
}
