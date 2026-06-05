"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { AdminRoleGuard } from "@/components/auth/admin-role-guard"
import { AdminTeamTab } from "@/components/dashboard/admin/admin-team-tab"

export default function AdminTeamPage() {
  return (
    <AdminRoleGuard requiredAccess="team">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/dashboard/admin/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to settings
        </Link>
        <AdminTeamTab />
      </motion.div>
    </AdminRoleGuard>
  )
}
