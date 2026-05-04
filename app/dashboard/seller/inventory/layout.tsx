"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SellerInventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isCustom = pathname?.includes("/custom-requests")
  const isListings = !isCustom

  return (
    <div className="space-y-6">
      <nav
        className="grid w-full grid-cols-2 bg-background/50 border border-border rounded-lg overflow-hidden"
        aria-label="Inventory sections"
      >
        <Link
          href="/dashboard/seller/inventory"
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm text-foreground transition-colors hover:bg-blue-500/20",
            isListings && "text-white"
          )}
          style={isListings ? { backgroundColor: "#2563eb" } : undefined}
        >
          <Package className="h-4 w-4 shrink-0" />
          <span>Listings</span>
        </Link>
        <Link
          href="/dashboard/seller/inventory/custom-requests"
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm text-foreground transition-colors hover:bg-blue-500/20",
            isCustom && "text-white"
          )}
          style={isCustom ? { backgroundColor: "#2563eb" } : undefined}
        >
          <ClipboardList className="h-4 w-4 shrink-0" />
          <span>Custom requests</span>
        </Link>
      </nav>
      {children}
    </div>
  )
}
