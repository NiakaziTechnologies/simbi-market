"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSellerAuth } from "@/lib/auth/seller-auth-context"
import { SellerNotificationsDropdown } from "./seller-notifications-dropdown"

interface SellerTopbarProps {
  onMenuClick?: () => void
}

export function SellerTopbar({ onMenuClick }: SellerTopbarProps) {
  const { seller, staff, userType, logout } = useSellerAuth()
  
  // Get display name based on user type
  const displayName = userType === 'seller' 
    ? seller?.businessName || 'Seller'
    : staff 
      ? `${staff.firstName} ${staff.lastName}`.trim() || 'Staff'
      : 'User'
  
  // Get initial for avatar
  const initial = userType === 'seller'
    ? seller?.businessName?.charAt(0).toUpperCase() || 'S'
    : staff?.firstName?.charAt(0).toUpperCase() || 'S'

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications - Only show for sellers, not staff */}
          {userType === 'seller' && <SellerNotificationsDropdown />}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {initial}
                  </span>
                </div>
                <span className="hidden md:block font-medium">{displayName}</span>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Profile - Only show for sellers, not staff */}
              {userType === 'seller' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/seller/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
