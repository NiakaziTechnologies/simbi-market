"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, DollarSign, AlertCircle, History } from "lucide-react"
import { getPayoutHistory, type PayoutHistoryItem } from "@/lib/api/admin-payouts"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PROCESSING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  FROZEN: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function PayoutHistoryTab() {
  const [payouts, setPayouts] = useState<PayoutHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getPayoutHistory(page, limit)
      setPayouts(data.payouts)
      setTotalPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
      setSummary(data.summary)
    } catch (err: any) {
      setError(err.message || 'Failed to load payout history')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const filteredPayouts = payouts.filter((payout) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      payout.order.orderNumber?.toLowerCase().includes(query) ||
      payout.seller.businessName?.toLowerCase().includes(query) ||
      payout.seller.email?.toLowerCase().includes(query) ||
      payout.payment.bankReference?.toLowerCase().includes(query) ||
      payout.payout.status?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Payouts
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(summary.totalPayouts)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total paid to sellers</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Platform Fee
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(summary.totalPlatformFee)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total commission earned</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Records
                </CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">{summary.totalRecords}</div>
                <p className="text-xs text-muted-foreground mt-1">Total payout records</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {summary.statusCounts?.COMPLETED || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Payouts Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <History className="h-5 w-5" />
                Payout History
              </CardTitle>
              <CardDescription>
                {total > 0 ? `${total} total payout(s)` : "View all processed payouts"}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search payouts..."
                className="pl-9 bg-muted/50 border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadHistory} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No payouts found matching your search" : "No payout history found"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Order Number</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bank Reference</TableHead>
                      <TableHead>Processed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow
                        key={payout.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium">{payout.order.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(payout.order.deliveredDate), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-foreground">{payout.seller.businessName}</div>
                            <div className="text-muted-foreground">{payout.seller.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(payout.payout.grossAmount, payout.payout.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(payout.payout.platformCommission, payout.payout.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(payout.payout.netAmount, payout.payout.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[payout.payout.status] || "bg-muted text-muted-foreground"}>
                            {payout.payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {payout.payment.bankReference || (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payout.payment.processedDate), "MMM dd, yyyy HH:mm")}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing page {page} of {totalPages} ({total} total payouts)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
