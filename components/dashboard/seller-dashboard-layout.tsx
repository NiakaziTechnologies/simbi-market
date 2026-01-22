"use client";
import { useState } from "react";
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, LogOut, ChevronDown, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SellerSidebar } from "./seller-sidebar";

interface SellerDashboardLayoutProps {
  children: React.ReactNode;
}

export function SellerDashboardLayout({ children }: SellerDashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(3); // Mock data

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    businessName: "AutoParts Pro",
    avatar: null
  };

  const getDisplayName = () => {
    return user.businessName || user.name || 'Seller';
  };

  const getEmail = () => {
    return user.email || '';
  };

  const getAvatarInitial = () => {
    return user.businessName?.charAt(0)?.toUpperCase() ||
           user.name?.charAt(0)?.toUpperCase() || 'S';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SellerSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-muted rounded-md p-2 text-muted-foreground hover:text-foreground" />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search... (Ctrl+K)"
                    className="pl-10 bg-muted/50 border-border focus:bg-background focus:ring-2 focus:ring-accent/50 w-80"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-muted"
                  onClick={() => setShowNotifications((s) => !s)}
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
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
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-accent/20 text-accent">
                          {getAvatarInitial()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block text-sm font-medium text-foreground">
                        {getDisplayName()}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {getEmail()}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mock Notifications panel */}
              {showNotifications && (
                <div className="absolute right-6 top-16 z-50">
                  <div className="w-80 bg-card border border-border rounded-lg shadow-lg p-4">
                    <h3 className="text-sm font-medium text-foreground mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                        New order received
                      </div>
                      <div className="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                        Low stock alert
                      </div>
                      <div className="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                        Payment processed
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto bg-background">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
