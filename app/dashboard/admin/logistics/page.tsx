"use client"

import { motion } from "framer-motion"
import { LogisticsConsole } from "@/components/dashboard/admin/logistics-console"

export default function AdminLogisticsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border pb-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground">Logistics & shipping</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Manage carriers, regional routing, the dimensional rate matrix, and shipment tracking. Mutations require
          logistics RBAC on the API.
        </p>
      </motion.div>
      <LogisticsConsole />
    </div>
  )
}
