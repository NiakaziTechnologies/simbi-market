"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ShoppingCart, Store, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, role, isLoading } = useAuth()
  const hasRedirectedRef = useRef(false)

  // Redirect based on user role
  useEffect(() => {
    // Don't redirect if still loading or already redirected
    if (isLoading || hasRedirectedRef.current) return
    
    // Only redirect if we're actually on /dashboard
    if (pathname !== '/dashboard') return
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      hasRedirectedRef.current = true
      router.push('/auth/login')
      return
    }

    // Redirect based on role (only once)
    if (role && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      
      // Check for seller/staff userType
      const sellerUserType = localStorage.getItem('sellerUserType')
      
      if (sellerUserType === 'staff' || sellerUserType === 'seller') {
        router.replace('/dashboard/seller')
      } else if (role === 'buyer') {
        router.replace('/dashboard/buyer')
      } else if (role === 'admin') {
        router.replace('/dashboard/admin')
      } else {
        // Default to buyer dashboard
        router.replace('/dashboard/buyer')
      }
    }
  }, [isAuthenticated, role, isLoading, router, pathname])
  
  // Show loading while redirecting
  if (isLoading || (isAuthenticated && role && pathname === '/dashboard')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
              Select Dashboard
            </h1>
            <p className="text-muted font-light max-w-2xl mx-auto">
              Choose your dashboard based on your role
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Buyer Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link href="/dashboard/buyer">
                <div className="glass-card rounded-xl p-8 h-full hover:border-accent/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500/30 transition-colors">
                    <ShoppingCart className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3">Buyer Dashboard</h3>
                  <p className="text-muted font-light text-sm mb-6">
                    Manage your orders, payments, and account settings
                  </p>
                  <div className="flex items-center text-accent font-light text-sm group-hover:translate-x-2 transition-transform">
                    Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Seller Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/dashboard/seller">
                <div className="glass-card rounded-xl p-8 h-full hover:border-accent/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 mx-auto group-hover:bg-green-500/30 transition-colors">
                    <Store className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3">Seller Dashboard</h3>
                  <p className="text-muted font-light text-sm mb-6">
                    Manage inventory, sales, and orders (Coming Soon)
                  </p>
                  <div className="flex items-center text-accent font-light text-sm group-hover:translate-x-2 transition-transform">
                    View Placeholder <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Admin Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/dashboard/admin">
                <div className="glass-card rounded-xl p-8 h-full hover:border-accent/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-500/30 transition-colors">
                    <Shield className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3">Admin Dashboard</h3>
                  <p className="text-muted font-light text-sm mb-6">
                    Platform management and analytics (Coming Soon)
                  </p>
                  <div className="flex items-center text-accent font-light text-sm group-hover:translate-x-2 transition-transform">
                    View Placeholder <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
