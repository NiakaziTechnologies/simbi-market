"use client"

import { Fragment, useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAdmins, type AdminProfile } from "@/lib/api/admin-auth"
import {
  getActivityLogs,
  formatAuditAction,
  AUDIT_ACTION_LABELS,
  type AuditLogEntry,
} from "@/lib/api/admin-audit"

const ACTION_OPTIONS = Object.keys(AUDIT_ACTION_LABELS)

export function AdminAuditTab() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [adminId, setAdminId] = useState<string>("all")
  const [action, setAction] = useState<string>("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getActivityLogs({
        page,
        limit: 20,
        adminId: adminId !== "all" ? adminId : undefined,
        action: action !== "all" ? action : undefined,
        from: from || undefined,
        to: to || undefined,
      })
      setLogs(result.logs)
      setTotalPages(result.pagination.totalPages)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load audit trail"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [page, adminId, action, from, to, toast])

  useEffect(() => {
    getAdmins()
      .then(setAdmins)
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const applyFilters = () => {
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-light">Audit trail</CardTitle>
          <CardDescription>Who did what and when</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Admin</Label>
              <Select value={adminId} onValueChange={setAdminId}>
                <SelectTrigger>
                  <SelectValue placeholder="All admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All admins</SelectItem>
                  {admins.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.firstName} {a.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {ACTION_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {AUDIT_ACTION_LABELS[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="outline" onClick={applyFilters}>
            Apply filters
          </Button>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No activity for these filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>When</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const expanded = expandedId === log.id
                  return (
                    <Fragment key={log.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setExpandedId(expanded ? null : log.id)}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(log.createdAt), "d MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {log.admin.firstName} {log.admin.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{log.admin.email}</div>
                        </TableCell>
                        <TableCell>
                          {formatAuditAction(
                            log.action,
                            log.metadata as Record<string, unknown> | undefined
                          )}
                        </TableCell>
                      </TableRow>
                      {expanded && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/30">
                            <pre className="text-xs overflow-x-auto p-2 rounded">
                              {JSON.stringify(log.metadata ?? {}, null, 2)}
                            </pre>
                            {log.ipAddress && (
                              <p className="text-xs text-muted-foreground mt-2">IP: {log.ipAddress}</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
