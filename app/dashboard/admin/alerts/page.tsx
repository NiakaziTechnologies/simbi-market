"use client"

import { motion } from "framer-motion"
import { AdminAlertsInbox } from "@/components/dashboard/admin/admin-alerts-inbox"

export default function AdminAlertsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border pb-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground">Operational alerts</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          High-priority signals (SRI, fraud class, disputes, finance variances, and more) are filtered by your admin
          role on the server. Acknowledge or resolve only when your role owns that alert type; polling keeps the inbox
          fresh without WebSockets.
        </p>
      </motion.div>
      <AdminAlertsInbox />
    </div>
  )
}
