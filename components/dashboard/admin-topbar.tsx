"use client"

import Link from "next/link"
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  KeyRound,
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
import { useAuth } from "@/lib/auth/auth-context"
import { formatAdminRoleLabel } from "@/lib/auth/admin-rbac"
import { AdminNotificationsDropdown } from "./admin-notifications-dropdown"

interface AdminTopbarProps {
  onMenuClick?: () => void
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout } = useAuth()

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "Admin"
  const roleLabel = formatAdminRoleLabel(user?.adminRole)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:flex flex-1 min-w-0 text-sm text-muted-foreground truncate">
          <span className="font-medium text-foreground">{displayName}</span>
          <span className="mx-2">·</span>
          <span className="truncate">{user?.email}</span>
          <span className="mx-2">·</span>
          <span>{roleLabel}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <AdminNotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden lg:block font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground pt-1">{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/settings/password" className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
