"use client"

import { motion } from "framer-motion"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground font-light">Manage your account settings</p>
      </motion.div>

      <div className="glass-card rounded-xl p-12 text-center">
        <Settings className="h-16 w-16 text-accent mx-auto mb-6" />
        <h2 className="text-2xl font-light text-foreground mb-4">Account Settings</h2>
        <p className="text-muted-foreground font-light">
          This section will allow you to configure your account settings, preferences, and notifications.
        </p>
      </div>
    </div>
  )
}
