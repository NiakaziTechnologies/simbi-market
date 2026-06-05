"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { changeAdminPassword } from "@/lib/api/admin-auth"
import { clearAdminMustChangePassword } from "@/lib/auth/auth-utils"
import { useAuth } from "@/lib/auth/auth-context"
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api/api-client"

export default function AdminChangePasswordPage() {
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [newError, setNewError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentError(null)
    setNewError(null)
    setFormError(null)

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setFormError("All fields are required.")
      return
    }
    if (newPassword.length < 8) {
      setNewError("New password must be at least 8 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setNewError("Passwords do not match.")
      return
    }
    if (newPassword === currentPassword) {
      setNewError("New password must be different from your current password.")
      return
    }

    setSaving(true)
    try {
      const successMessage = await changeAdminPassword({ currentPassword, newPassword })
      clearAdminMustChangePassword()
      await refreshUser()
      toast({ title: successMessage })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      const message = getApiErrorMessage(err)

      if (code === "INVALID_CURRENT_PASSWORD") {
        setCurrentError(message)
      } else if (code === "PASSWORD_UNCHANGED" || code === "PASSWORD_TOO_SHORT") {
        setNewError(message)
      } else {
        setFormError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
      <Link
        href="/dashboard/admin/settings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to settings
      </Link>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-light flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>Update your admin account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {formError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <PasswordInput
                id="current"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setCurrentError(null)
                }}
                autoComplete="current-password"
                required
              />
              {currentError && (
                <p className="text-sm text-destructive">{currentError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <PasswordInput
                id="new"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setNewError(null)
                }}
                minLength={8}
                autoComplete="new-password"
                required
              />
              {newError && <p className="text-sm text-destructive">{newError}</p>}
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <PasswordInput
                id="confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-accent hover:bg-accent/90">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Change password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
