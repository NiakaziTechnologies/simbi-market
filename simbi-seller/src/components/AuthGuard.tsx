// @ts-nocheck
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSellerAuth } from '@/hooks/useSellerAuth';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { seller, staff, loading } = useSellerAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    // If user is authenticated and trying to access public routes, allow it
    // (they might want to logout or switch accounts)
    if (isPublicRoute) {
      return;
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!seller && !staff) {
      router.push('/login');
    }
  }, [seller, staff, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated and not on public route, don't render (redirect will happen)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
  if (!isPublicRoute && !seller && !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}









