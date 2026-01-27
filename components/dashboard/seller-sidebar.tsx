"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Ticket,
  RotateCcw,
  DollarSign,
  Users,
  BarChart3,
  User,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/seller" },
  { id: "inventory", label: "Inventory", icon: Package, href: "/dashboard/seller/inventory" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/dashboard/seller/orders" },
  { id: "payments", label: "Payments", icon: CreditCard, href: "/dashboard/seller/payments" },
  { id: "coupons", label: "Coupons", icon: Ticket, href: "/dashboard/seller/coupons" },
  { id: "returns", label: "Returns", icon: RotateCcw, href: "/dashboard/seller/returns" },
  { id: "finance", label: "Finance", icon: DollarSign, href: "/dashboard/seller/finance" },
  { id: "staff", label: "Staff", icon: Users, href: "/dashboard/seller/staff" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/dashboard/seller/reports" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/dashboard/seller/notifications" },
  { id: "profile", label: "Profile", icon: User, href: "/dashboard/seller/profile" },
]

interface SellerSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function SellerSidebar({ isMobileOpen = false, onMobileClose }: SellerSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()

  const getActiveTab = () => {
    if (pathname?.includes("/notifications")) return "notifications"
    if (pathname?.includes("/inventory")) return "inventory"
    if (pathname?.includes("/orders")) return "orders"
    if (pathname?.includes("/payments")) return "payments"
    if (pathname?.includes("/coupons")) return "coupons"
    if (pathname?.includes("/returns")) return "returns"
    if (pathname?.includes("/finance")) return "finance"
    if (pathname?.includes("/staff")) return "staff"
    if (pathname?.includes("/reports")) return "reports"
    if (pathname?.includes("/profile")) return "profile"
    return "dashboard"
  }

  const activeTab = getActiveTab()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-background border-r border-border z-50 transition-all duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            {!isCollapsed && (
              <Link href="/dashboard/seller" className="text-xl font-semibold tracking-tight text-foreground">
                SIMBI<span className="text-accent">.</span> Seller
              </Link>
            )}
            {isCollapsed && (
              <div className="text-xl font-semibold tracking-tight text-foreground w-full text-center">
                S<span className="text-accent">.</span>
              </div>
            )}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8"
              >
                {isCollapsed ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={onMobileClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-muted/50",
                    isActive
                      ? "bg-accent/10 text-accent border-l-2 border-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-accent")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-destructive",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
