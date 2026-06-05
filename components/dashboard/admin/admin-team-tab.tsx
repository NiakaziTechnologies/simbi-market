"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Loader2, UserPlus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  type AdminProfile,
  type AdminRole,
  type UserStatus,
} from "@/lib/api/admin-auth"
import { formatAdminRoleLabel } from "@/lib/auth/admin-rbac"

const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "FINOPS_ANALYST", label: "FinOps" },
  { value: "COMPLIANCE_MANAGER", label: "Compliance" },
  { value: "LOGISTICS_COORDINATOR", label: "Logistics" },
  { value: "TECH_SUPPORT", label: "Tech Support" },
]

const STATUSES: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
]

function statusBadge(status: UserStatus) {
  if (status === "ACTIVE") {
    return <Badge className="bg-green-600/90 hover:bg-green-600">Active</Badge>
  }
  if (status === "SUSPENDED") {
    return <Badge variant="destructive">Suspended</Badge>
  }
  return <Badge variant="secondary">Inactive</Badge>
}

export function AdminTeamTab() {
  const { toast } = useToast()
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [editAdmin, setEditAdmin] = useState<AdminProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmSuspend, setConfirmSuspend] = useState(false)

  const [inviteForm, setInviteForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "SUPER_ADMIN" as AdminRole,
  })

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    role: "SUPER_ADMIN" as AdminRole,
    status: "ACTIVE" as UserStatus,
  })

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getAdmins()
      setAdmins(list)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load team"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      toast({ title: "Validation", description: "All fields are required.", variant: "destructive" })
      return
    }
    setInviting(true)
    try {
      await createAdmin(inviteForm)
      toast({
        title: "Admin created",
        description: "Credentials sent by email.",
      })
      setInviteOpen(false)
      setInviteForm({ email: "", firstName: "", lastName: "", role: "SUPER_ADMIN" })
      await loadAdmins()
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number }
      toast({
        title: e.status === 502 ? "Email failed" : "Could not invite",
        description: e.message || "Try again later.",
        variant: "destructive",
      })
    } finally {
      setInviting(false)
    }
  }

  const openEdit = (admin: AdminProfile) => {
    setEditAdmin(admin)
    setEditForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      status: admin.status,
    })
  }

  const handleSaveEdit = async () => {
    if (!editAdmin) return
    if (editForm.status === "SUSPENDED" && editAdmin.status !== "SUSPENDED") {
      setConfirmSuspend(true)
      return
    }
    await saveEdit()
  }

  const saveEdit = async () => {
    if (!editAdmin) return
    setSaving(true)
    try {
      await updateAdmin(editAdmin.id, editForm)
      toast({ title: "Admin updated successfully" })
      setEditAdmin(null)
      setConfirmSuspend(false)
      await loadAdmins()
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast({
        title: "Update failed",
        description: e.message || "Could not update admin.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-light">Team</CardTitle>
              <CardDescription>Manage admin accounts and roles</CardDescription>
            </div>
            <Button onClick={() => setInviteOpen(true)} className="bg-accent hover:bg-accent/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add user
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No admins yet.</p>
              <Button className="mt-4" onClick={() => setInviteOpen(true)}>
                Add user
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.firstName} {admin.lastName}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{formatAdminRoleLabel(admin.role)}</TableCell>
                    <TableCell>{statusBadge(admin.status)}</TableCell>
                    <TableCell>
                      {admin.lastLoginAt
                        ? format(new Date(admin.lastLoginAt), "d MMM, HH:mm")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(admin)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              A temporary password will be emailed to this address. No password field needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v as AdminRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!editAdmin} onOpenChange={(o) => !o && setEditAdmin(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit admin</SheetTitle>
            <SheetDescription>{editAdmin?.email}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v as AdminRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as UserStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmSuspend} onOpenChange={setConfirmSuspend}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend admin?</AlertDialogTitle>
            <AlertDialogDescription>
              Suspend {editAdmin?.email}? They will not be able to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveEdit}>Suspend</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
