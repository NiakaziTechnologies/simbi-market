"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ShoppingCart, Store, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()

  // For now, redirect to buyer dashboard by default
  // In production, this would check user role and redirect accordingly
  useEffect(() => {
    // Uncomment below when you have authentication/role checking
    // const userRole = getUserRole() // Implement this based on your auth system
    // if (userRole === 'buyer') router.push('/dashboard/buyer')
    // else if (userRole === 'seller') router.push('/dashboard/seller')
    // else if (userRole === 'admin') router.push('/dashboard/admin')
    // else router.push('/dashboard/buyer') // Default to buyer
    
    // Temporary: redirect to buyer dashboard
    router.push('/dashboard/buyer')
  }, [router])

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
