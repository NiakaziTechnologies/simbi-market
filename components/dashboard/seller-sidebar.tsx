"use client";

import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Store,
  TrendingUp,
  Users,
  FileText,
  User,
  Home,
  CreditCard,
  ChevronRight,
  Sparkles,
  Calculator,
  UserCog,
  Banknote,
  Wallet,
  Ticket,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard/seller", icon: Home },
  { title: "Inventory", url: "/dashboard/seller/inventory", icon: Package },
  { title: "Orders", url: "/dashboard/seller/orders", icon: ShoppingCart },
  { title: "Payments", url: "/dashboard/seller/payments", icon: Wallet },
  { title: "Coupons", url: "/dashboard/seller/coupons", icon: Ticket },
  { title: "Returns", url: "/dashboard/seller/returns", icon: RotateCcw },
  { title: "Finance", url: "/dashboard/seller/finance", icon: Calculator },
  { title: "Staff", url: "/dashboard/seller/staff", icon: UserCog },
  { title: "Reports", url: "/dashboard/seller/reports", icon: FileText },
  { title: "Profile", url: "/dashboard/seller/profile", icon: User },
  { title: "Settings", url: "/dashboard/seller/settings", icon: Settings },
];

export function SellerSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const currentPath = pathname || "/";
  const isCollapsed = state === "collapsed";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarContent className="bg-card">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center shadow-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-lg text-foreground">Simbi Seller</h1>
                <p className="text-xs text-muted-foreground">ERP Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6">
          <SidebarMenu className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={isCollapsed ? item.title : undefined}
                  className={`
                    w-full rounded-lg transition-colors h-10
                    ${isActive(item.url)
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                    ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}
                  `}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 w-full"
                    prefetch={false}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className={`font-medium ${isCollapsed ? 'sr-only' : ''}`}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">© 2024 Simbi Seller</p>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
