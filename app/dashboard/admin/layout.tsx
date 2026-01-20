"use client"

import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <main className="min-h-screen bg-background">
        <Navigation />
        {children}
      </main>
    </ProtectedRoute>
  )
}
