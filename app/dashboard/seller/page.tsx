"use client"

import { Navigation } from "@/components/navigation"
import { Package, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function SellerDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="glass-card rounded-xl p-12 max-w-2xl mx-auto">
              <AlertCircle className="h-16 w-16 text-accent mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4">
                Seller Dashboard
              </h1>
              <p className="text-muted font-light leading-relaxed mb-8">
                Seller dashboard is coming soon. This section will include inventory management, 
                sales analytics, order management, and seller tools.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
                <div className="p-4 bg-white/5 rounded-lg">
                  <Package className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">Inventory Management</h3>
                  <p className="text-muted text-sm">Manage your product listings and stock</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">Sales Analytics</h3>
                  <p className="text-muted text-sm">Track your sales performance and insights</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Users className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">Order Management</h3>
                  <p className="text-muted text-sm">Process and fulfill customer orders</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <DollarSign className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">Revenue Tracking</h3>
                  <p className="text-muted text-sm">Monitor your earnings and payouts</p>
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-white">
                Access Seller Portal
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
