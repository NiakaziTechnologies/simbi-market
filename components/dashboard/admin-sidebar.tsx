"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  RotateCcw,
  Star,
  BarChart3,
  Bell,
  Menu,
  X,
  LogOut,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/dashboard/admin/notifications" },
  { id: "users", label: "Users", icon: Users, href: "/dashboard/admin/users" },
  { id: "products", label: "Products", icon: Package, href: "/dashboard/admin/products" },
  { id: "dispatch", label: "Dispatch", icon: Truck, href: "/dashboard/admin/dispatch" },
  { id: "payouts", label: "Payouts", icon: DollarSign, href: "/dashboard/admin/payouts" },
  { id: "returns", label: "Returns", icon: RotateCcw, href: "/dashboard/admin/returns" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/dashboard/admin/reviews" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/dashboard/admin/reports" },
]

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()

  const getActiveTab = () => {
    if (pathname?.includes("/notifications")) return "notifications"
    if (pathname?.includes("/users")) return "users"
    if (pathname?.includes("/products")) return "products"
    if (pathname?.includes("/dispatch")) return "dispatch"
    if (pathname?.includes("/payouts")) return "payouts"
    if (pathname?.includes("/returns")) return "returns"
    if (pathname?.includes("/reviews")) return "reviews"
    if (pathname?.includes("/reports")) return "reports"
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
              <Link href="/dashboard/admin" className="text-xl font-semibold tracking-tight text-foreground">
                SIMBI<span className="text-accent">.</span> Admin
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
              onClick={onMobileClose}
              className="lg:hidden h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <Link key={item.id} href={item.href} onClick={onMobileClose}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative group",
                      isActive
                        ? "text-white bg-blue-600"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-accent")} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                    {isCollapsed && isActive && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-background border border-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                isCollapsed && "justify-center"
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
