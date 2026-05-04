"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, ShieldCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  getExpiredDocuments,
  getExpiringDocuments,
  getPendingDocuments,
  type SellerDocument,
} from "@/lib/api/admin-seller-compliance"
import { SellerComplianceDetailDialog } from "@/components/dashboard/admin/seller-compliance-detail-dialog"
import { cn } from "@/lib/utils"

function statusBadge(s: string) {
  if (s === "APPROVED") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
  if (s === "PENDING") return "bg-amber-500/15 text-amber-200 border-amber-500/30"
  if (s === "REJECTED") return "bg-red-500/15 text-red-200 border-red-500/30"
  if (s === "EXPIRED") return "bg-red-500/15 text-red-200 border-red-500/30"
  return "bg-muted/30 text-muted-foreground border-border/70"
}

function daysUntilExpiry(doc: SellerDocument): number | null {
  if (!doc.expiryDate) return null
  const d = new Date(doc.expiryDate)
  if (Number.isNaN(d.getTime())) return null
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function AdminCompliancePage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<"pending" | "expiring" | "expired">("pending")
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<SellerDocument[]>([])
  const [detailSellerId, setDetailSellerId] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res =
        tab === "pending"
          ? await getPendingDocuments()
          : tab === "expiring"
            ? await getExpiringDocuments()
            : await getExpiredDocuments()
      setRows(res)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Could not load compliance queue", description: err.message, variant: "destructive" })
      setRows([])
    } finally {
      if (!silent) setLoading(false)
    }
  }, [tab, toast])

  useEffect(() => {
    void load()
  }, [load])

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ax = new Date(a.uploadedAt).getTime()
      const ay = new Date(b.uploadedAt).getTime()
      return (Number.isNaN(ay) ? 0 : ay) - (Number.isNaN(ax) ? 0 : ax)
    })
  }, [rows])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-light text-foreground mb-2">Compliance</h1>
        <p className="text-muted-foreground font-light">
          Review seller documents and record compliance audit scores.
        </p>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-border">
          <TabsTrigger value="pending">Incoming (Pending)</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          <Card className="glass-card border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-light flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    {tab === "pending" ? "Incoming documents" : tab === "expiring" ? "Expiring documents" : "Expired documents"}
                  </CardTitle>
                  <CardDescription>{sorted.length} document(s)</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading…
                </div>
              ) : sorted.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">No documents in this queue.</div>
              ) : (
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Seller</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map((d) => {
                        const days = daysUntilExpiry(d)
                        const expSoon = days != null && days < 60 && days >= 0
                        return (
                          <TableRow key={d.id} className={cn("border-b border-border", expSoon ? "bg-amber-500/5" : null)}>
                            <TableCell className="font-mono text-xs">{d.sellerId}</TableCell>
                            <TableCell className="text-sm">{d.documentType}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusBadge(String(d.status))}>
                                {String(d.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {d.expiryDate ? (
                                <span className={cn(expSoon ? "text-amber-100" : "text-muted-foreground")}>
                                  {new Date(d.expiryDate).toLocaleDateString()}
                                  {days != null ? ` (${days}d)` : ""}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(d.uploadedAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button type="button" variant="outline" size="sm" onClick={() => setDetailSellerId(d.sellerId)}>
                                Open seller
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SellerComplianceDetailDialog
        open={!!detailSellerId}
        onOpenChange={(o) => {
          if (!o) setDetailSellerId(null)
        }}
        sellerId={detailSellerId}
        onAfterAction={() => void load(true)}
      />
    </div>
  )
}

