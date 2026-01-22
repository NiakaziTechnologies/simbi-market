// @ts-nocheck
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
   RotateCcw,
   Clock
 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useSellerAuth } from "@/hooks/useSellerAuth";

const allNavigationItems = [
   { title: "Dashboard", url: "/dashboard", icon: Home, roles: ['seller', 'STOCK_MANAGER', 'DISPATCHER', 'FINANCE_VIEW', 'FULL_ACCESS'] },
   { title: "Inventory", url: "/products", icon: Package, roles: ['seller', 'STOCK_MANAGER', 'FULL_ACCESS'] },
   { title: "Orders", url: "/orders", icon: ShoppingCart, roles: ['seller', 'DISPATCHER', 'FULL_ACCESS'] },
   { title: "Payments", url: "/payments", icon: Wallet, roles: ['seller', 'FINANCE_VIEW', 'FULL_ACCESS'] },
   { title: "Coupons", url: "/coupons", icon: Ticket, roles: ['seller', 'FULL_ACCESS'] },
   { title: "Returns", url: "/returns", icon: RotateCcw, roles: ['seller', 'FULL_ACCESS'] },
   { title: "Finance", url: "/finance", icon: Calculator, roles: ['seller', 'FINANCE_VIEW', 'FULL_ACCESS'] },
   { title: "Staff", url: "/staff", icon: UserCog, roles: ['seller', 'FULL_ACCESS'] },
   { title: "Time Tracking", url: "/time-tracking", icon: Clock, roles: ['STOCK_MANAGER', 'DISPATCHER', 'FINANCE_VIEW', 'FULL_ACCESS'] },
   { title: "Reports", url: "/reports", icon: FileText, roles: ['seller', 'FINANCE_VIEW', 'FULL_ACCESS'] },
   { title: "Profile", url: "/profile", icon: User, roles: ['seller', 'STOCK_MANAGER', 'DISPATCHER', 'FINANCE_VIEW', 'FULL_ACCESS'] },
   { title: "Settings", url: "/settings", icon: Settings, roles: ['seller', 'FULL_ACCESS'] },
 ];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const currentPath = pathname || "/";
  const isCollapsed = state === "collapsed";
  const [mounted, setMounted] = useState(false);
  const { userType, role } = useSellerAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter navigation items based on user type and role
  const navigation = useMemo(() => {
    // If user is seller, only show items that have 'seller' in their roles
    if (userType === 'seller') {
      return allNavigationItems.filter(item => 
        item.roles.includes('seller')
      );
    }
    
    // If user is staff, filter by role
    if (userType === 'staff' && role) {
      return allNavigationItems.filter(item => 
        item.roles.includes(role)
      );
    }
    
    // Default: show all (for loading state)
    return allNavigationItems;
  }, [userType, role]);

  const isActive = (path: string) => {
    // Handle root path
    if (path === '/dashboard' && (currentPath === '/' || currentPath === '/dashboard')) {
      return true;
    }
    return currentPath === path;
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      <SidebarContent className="bg-white">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-[#3498DB] to-[#2ECC71] rounded-lg flex items-center justify-center shadow-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-lg text-gray-900">Simbi Seller</h1>
                <p className="text-xs text-gray-600">ERP Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6">
          <SidebarMenu className="space-y-1">
            {navigation.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={isCollapsed ? item.title : undefined}
                  className={`
                    w-full rounded-lg transition-colors h-10
                    ${isActive(item.url)
                      ? 'bg-gradient-to-r from-[#3498DB] to-[#2ECC71] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:bg-opacity-50'
                    }
                    ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}
                  `}
                >
                  <Link
                    href={item.url === '/dashboard' ? '/' : item.url}
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
        <div className="p-4 border-t border-gray-100">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-gray-500">© 2024 Simbi Seller</p>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
