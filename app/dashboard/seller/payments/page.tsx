"use client"

import { motion } from "framer-motion"
import { CreditCard } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Payments
        </h1>
        <p className="text-muted-foreground font-light">Manage payment methods and transactions</p>
      </motion.div>

      <div className="glass-card rounded-xl p-12 text-center">
        <CreditCard className="h-16 w-16 text-accent mx-auto mb-6" />
        <h2 className="text-2xl font-light text-foreground mb-4">Payment Management</h2>
        <p className="text-muted-foreground font-light">
          This section will allow you to manage payment methods and view transaction history.
        </p>
      </div>
    </div>
  )
}
