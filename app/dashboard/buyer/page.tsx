"use client"

import { motion } from "framer-motion"
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const orders = [
  {
    id: "ORD-2025-0142",
    date: "Dec 28, 2025",
    status: "delivered",
    items: [{ name: "Performance Brake System", image: "/high-end-car-brake-disc-rotor-close-up-macro.jpg" }],
    total: 1299.99,
  },
  {
    id: "ORD-2025-0138",
    date: "Dec 22, 2025",
    status: "shipped",
    items: [{ name: "Carbon Fiber Intake Manifold", image: "/carbon-fiber-engine-component-macro-photography.jpg" }],
    total: 2499.99,
  },
  {
    id: "ORD-2025-0131",
    date: "Dec 15, 2025",
    status: "processing",
    items: [{ name: "Adaptive Suspension Kit", image: "/luxury-car-suspension-system-close-up.jpg" }],
    total: 3799.99,
  },
]

const statusConfig = {
  delivered: { icon: CheckCircle2, label: "Delivered", color: "text-green-400" },
  shipped: { icon: Truck, label: "Shipped", color: "text-accent" },
  processing: { icon: Clock, label: "Processing", color: "text-yellow-400" },
}

export default function BuyerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground font-light">Welcome back, John • Member since 2023</p>
      </motion.div>

      {/* Content */}
      <div className="space-y-8">
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-4 gap-6"
              >
                {[
                  { label: "Total Orders", value: "24", change: "+3 this month" },
                  { label: "Total Spent", value: "$18,450", change: "+12% from last month" },
                  { label: "Parts Installed", value: "42", change: "6 pending" },
                  { label: "Rewards Points", value: "2,450", change: "Redeem $50" },
                ].map((stat, index) => (
                  <div key={stat.label} className="glass-card rounded-lg p-6">
                    <p className="text-muted-foreground font-light text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-light text-foreground mb-1">{stat.value}</p>
                    <p className="text-xs text-accent font-light">{stat.change}</p>
                  </div>
                ))}
              </motion.div>

              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-light text-white">Recent Orders</h2>
                  <Link href="/dashboard/buyer/orders">
                    <Button variant="ghost" className="font-light">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {orders.map((order, index) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig]
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="glass-card rounded-lg p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={order.items[0].image || "/placeholder.svg"}
                              alt={order.items[0].name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-light text-foreground">{order.items[0].name}</h3>
                                <p className="text-muted-foreground font-light text-sm">
                                  {order.id} • {order.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 ${status.color}`}>
                                  <status.icon className="h-4 w-4" />
                                  <span className="text-sm font-light">{status.label}</span>
                                </div>
                                <span className="text-xl font-light text-foreground">${order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
      </div>

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-light text-foreground mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/catalog">
            <div className="glass-card rounded-lg p-6 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Shop Parts</h3>
                  <p className="text-sm text-muted-foreground">Browse our catalog</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/buyer/orders">
            <div className="glass-card rounded-lg p-6 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">View Orders</h3>
                  <p className="text-sm text-muted-foreground">Track your purchases</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/buyer/settings">
            <div className="glass-card rounded-lg p-6 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Settings className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your profile</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
