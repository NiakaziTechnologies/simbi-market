"use client"

import { SellerDashboardLayout } from "@/components/dashboard/seller-dashboard-layout"

export default function SellerDashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SellerDashboardLayout>
      {children}
    </SellerDashboardLayout>
  )
}
