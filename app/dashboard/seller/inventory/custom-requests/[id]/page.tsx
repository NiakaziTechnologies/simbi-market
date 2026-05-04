"use client"

import { useParams } from "next/navigation"
import { SellerCustomRequestDetailView } from "@/components/dashboard/seller/seller-custom-request-detail-view"

export default function SellerCustomRequestDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  if (!id) {
    return <p className="text-sm text-muted-foreground py-8">Invalid request link.</p>
  }
  return <SellerCustomRequestDetailView requestId={id} />
}
