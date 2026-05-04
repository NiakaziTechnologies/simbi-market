"use client"

import { useParams } from "next/navigation"
import { AdminCustomRequestDetailView } from "@/components/dashboard/admin/admin-custom-request-detail-view"

export default function AdminCustomRequestDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  if (!id) {
    return <p className="text-sm text-muted-foreground py-8">Invalid request link.</p>
  }
  return <AdminCustomRequestDetailView requestId={id} />
}
