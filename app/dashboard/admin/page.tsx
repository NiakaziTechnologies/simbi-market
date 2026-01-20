"use client"

import { Navigation } from "@/components/navigation"
import { Shield, Users, BarChart3, Settings, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
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
              <Shield className="h-16 w-16 text-accent mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4">
                Admin Dashboard
              </h1>
              <p className="text-muted font-light leading-relaxed mb-8">
                Admin dashboard is coming soon. This section will include platform management, 
                user management, analytics, and system configuration.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
                <div className="p-4 bg-white/5 rounded-lg">
                  <Users className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">User Management</h3>
                  <p className="text-muted text-sm">Manage buyers, sellers, and admin users</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">Platform Analytics</h3>
                  <p className="text-muted text-sm">View platform-wide metrics and insights</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Settings className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">System Settings</h3>
                  <p className="text-muted text-sm">Configure platform settings and preferences</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-accent mb-2" />
                  <h3 className="text-white font-medium mb-1">Moderation</h3>
                  <p className="text-muted text-sm">Review reports and manage platform content</p>
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-white">
                Access Admin Portal
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
