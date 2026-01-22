// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NotificationsPanel from '@/components/NotificationsPanel';
import { useSellerAuth } from '@/hooks/useSellerAuth';
import { apiClient } from '@/lib/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { seller, staff, userType, logout } = useSellerAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!seller && !staff) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await apiClient.request<{
        success: boolean;
        data: { unreadCount: number };
      }>('/api/seller/notifications/unread-count');

      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [seller, staff]);

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Get display name based on user type
  const getDisplayName = () => {
    if (userType === 'staff' && staff) {
      return `${staff.firstName} ${staff.lastName}`.trim() || staff.email?.split('@')[0] || 'User';
    }
    if (userType === 'seller' && seller) {
      return seller.businessName || seller.email?.split('@')[0] || 'User';
    }
    return 'User';
  };

  // Get email based on user type
  const getEmail = () => {
    if (userType === 'staff' && staff) {
      return staff.email || '';
    }
    if (userType === 'seller' && seller) {
      return seller.email || '';
    }
    return '';
  };

  // Get avatar initial based on user type
  const getAvatarInitial = () => {
    if (userType === 'staff' && staff) {
      return staff.firstName?.charAt(0)?.toUpperCase() || staff.email?.charAt(0)?.toUpperCase() || 'U';
    }
    if (userType === 'seller' && seller) {
      return seller.businessName?.charAt(0)?.toUpperCase() || seller.email?.charAt(0)?.toUpperCase() || 'U';
    }
    return 'U';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#ECF0F1]">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
           <header className="h-16 border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
             <div className="flex items-center justify-between h-full px-6">
               <div className="flex items-center gap-4">
                 <SidebarTrigger className="hover:bg-gray-100 rounded-md p-2 text-gray-600" />
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                   <Input
                     placeholder="Search... (Ctrl+K)"
                     className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 w-80"
                   />
                 </div>
               </div>

              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative hover:bg-gray-50" 
                  onClick={() => setShowNotifications((s) => !s)}
                >
                  <Bell className="h-4 w-4 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="flex items-center gap-2 hover:bg-gray-50">
                       <Avatar className="h-7 w-7">
                         <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                           {getAvatarInitial()}
                         </AvatarFallback>
                       </Avatar>
                       <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                         {getDisplayName()}
                       </span>
                       <ChevronDown className="h-3 w-3 text-gray-400" />
                     </Button>
                   </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {getEmail()}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={async () => {
                        await logout();
                        window.location.href = '/login';
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Notifications panel portal */}
              {showNotifications && (
                <div className="absolute right-6 top-16 z-50">
                  <NotificationsPanel 
                    visible={true} 
                    onClose={() => setShowNotifications(false)}
                    onUnreadCountChange={setUnreadCount}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto bg-[#ECF0F1]">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
