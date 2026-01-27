"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  CreditCard
} from "lucide-react"
import { getPendingPayouts, processPayout, type PendingPayoutOrder } from "@/lib/api/admin-payouts"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function PendingPayoutsTab() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [bankReference, setBankReference] = useState("")
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const payoutData = await getPendingPayouts()
      setData(payoutData)
      setSelectedOrders(new Set())
    } catch (err: any) {
      setError(err.message || 'Failed to load pending payouts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAll = () => {
    if (!data) return
    if (selectedOrders.size === data.orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(data.orders.map((order: PendingPayoutOrder) => order.orderId)))
    }
  }

  const handleOpenPayoutModal = () => {
    if (selectedOrders.size === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to process payout",
        variant: "destructive",
      })
      return
    }
    setIsPayoutModalOpen(true)
  }

  const handleProcessPayout = async () => {
    if (!bankReference.trim()) {
      toast({
        title: "Bank reference required",
        description: "Please enter a bank reference number",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      const orderIds = Array.from(selectedOrders)
      const result = await processPayout({
        orderIds,
        bankReference: bankReference.trim(),
        notes: notes.trim() || undefined,
      })

      toast({
        title: "Payout processed successfully",
        description: `Payout of ${formatCurrency(result.payout.amount, result.orders[0]?.orderId ? data.orders.find((o: PendingPayoutOrder) => o.orderId === result.orders[0].orderId)?.currency : "USD")} processed for ${result.seller.businessName}`,
      })

      setIsPayoutModalOpen(false)
      setBankReference("")
      setNotes("")
      setSelectedOrders(new Set())
      await loadData()
    } catch (err: any) {
      toast({
        title: "Failed to process payout",
        description: err.message || "An error occurred while processing the payout",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedTotal = data?.orders
    .filter((order: PendingPayoutOrder) => selectedOrders.has(order.orderId))
    .reduce((sum: number, order: PendingPayoutOrder) => sum + order.pendingAmount, 0) || 0

  const selectedCurrency = data?.orders[0]?.currency || "USD"

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sellers
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">{data.summary.totalSellers}</div>
                <p className="text-xs text-muted-foreground mt-1">Sellers with pending payouts</p>
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
                  Total Orders
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">{data.summary.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Orders awaiting payout</p>
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
                  Total Pending
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(data.summary.totalPendingPayouts, selectedCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total pending payout amount</p>
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
                  Platform Fee
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-foreground">
                  {formatCurrency(data.summary.totalPlatformFee, selectedCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total platform commission</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Orders Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Payout Orders
              </CardTitle>
              <CardDescription>
                {data ? `${data.orders.length} order(s) awaiting payout` : "Select orders to process payouts"}
              </CardDescription>
            </div>
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedOrders.size}</span> order(s) - {formatCurrency(selectedTotal, selectedCurrency)}
                </div>
                <Button onClick={handleOpenPayoutModal} className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Process Payout
                </Button>
              </div>
            )}
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
              <Button onClick={loadData} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : !data || data.orders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No pending payouts</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.size === data.orders.length && data.orders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.map((order: PendingPayoutOrder) => (
                    <TableRow
                      key={order.orderId}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.has(order.orderId)}
                          onCheckedChange={() => handleSelectOrder(order.orderId)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">{order.seller.businessName}</div>
                          <div className="text-muted-foreground">{order.seller.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-muted-foreground text-xs">
                                {item.partNumber} × {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(order.paidAmount, order.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(order.platformCommission, order.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(order.sellerNetAmount, order.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-accent">
                          {formatCurrency(order.pendingAmount, order.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(order.paymentDate), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(order.deliveryDate), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Payout Modal */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Process payout for {selectedOrders.size} selected order(s). Total amount: {formatCurrency(selectedTotal, selectedCurrency)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankReference">Bank Reference *</Label>
              <Input
                id="bankReference"
                placeholder="Enter bank reference number"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payout"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isProcessing}
                rows={3}
              />
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/30">
              <div className="text-sm text-muted-foreground mb-2">Selected Orders:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from(selectedOrders).map((orderId) => {
                  const order = data?.orders.find((o: PendingPayoutOrder) => o.orderId === orderId)
                  return order ? (
                    <div key={orderId} className="text-sm">
                      <span className="font-medium">{order.orderNumber}</span> - {formatCurrency(order.pendingAmount, order.currency)}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPayoutModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleProcessPayout} disabled={isProcessing || !bankReference.trim()}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
