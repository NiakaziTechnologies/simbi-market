"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Package,
  Truck,
  DollarSign,
  MapPin,
  User,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  getSellerOrders,
  getOrderPayment,
  updateOrderStatus,
  type SellerOrder,
  type OrderPaymentResponse,
} from "@/lib/api/seller-orders"
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

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  AWAITING_SELLER_ACCEPTANCE: { label: "Awaiting Acceptance", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  PROCESSING: { label: "Processing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  SHIPPED: { label: "Shipped", color: "bg-accent/20 text-accent border-accent/30" },
  DELIVERED: { label: "Delivered", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  SELLER_REJECTED: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  PARTIAL: { label: "Partial", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<OrderPaymentResponse['data'] | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const { toast } = useToast()

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSellerOrders()
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      (order.buyer && (
        order.buyer.firstName?.toLowerCase().includes(query) ||
        order.buyer.lastName?.toLowerCase().includes(query) ||
        order.buyer.companyName?.toLowerCase().includes(query)
      )) ||
      order.poNumber?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
    )
  })

  const handleViewDetails = async (order: SellerOrder) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
    setIsLoadingPayment(true)
    setPaymentInfo(null)

    try {
      const payment = await getOrderPayment(order.id)
      setPaymentInfo(payment)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load payment information",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return

    try {
      setIsUpdatingStatus(true)
      await updateOrderStatus(selectedOrder.id, { status: "ACCEPTED" })
      toast({
        title: "Success",
        description: "Order accepted successfully",
      })
      setIsDetailOpen(false)
      loadOrders()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to accept order",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleRejectOrder = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdatingStatus(true)
      await updateOrderStatus(selectedOrder.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      })
      toast({
        title: "Success",
        description: "Order rejected successfully",
      })
      setShowRejectModal(false)
      setRejectionReason("")
      setIsDetailOpen(false)
      loadOrders()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reject order",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const canAcceptOrReject = (order: SellerOrder) => {
    return order.status === "PENDING_PAYMENT" || order.status === "AWAITING_SELLER_ACCEPTANCE"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Orders
        </h1>
        <p className="text-muted-foreground font-light">
          View and manage your orders
        </p>
      </motion.div>

      {/* Orders Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders
              </CardTitle>
              <CardDescription>
                {orders.length > 0 ? `${orders.length} total order${orders.length !== 1 ? 's' : ''}` : "No orders"}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
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
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadOrders} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No orders found matching your search" : "No orders found"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Order Number</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => {
                    const status = statusConfig[order.status] || { label: order.status, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
                    const paymentStatus = paymentStatusConfig[order.paymentStatus] || { label: order.paymentStatus, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {order.orderNumber}
                            {order.isGuestOrder && (
                              <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                Guest
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.isGuestOrder ? (
                            <div className="text-muted-foreground italic">
                              Guest Order
                            </div>
                          ) : order.buyer ? (
                            <div>
                              <div className="font-medium text-foreground">
                                {order.buyer.firstName} {order.buyer.lastName}
                              </div>
                              {order.buyer.companyName && (
                                <div className="text-sm text-muted-foreground">
                                  {order.buyer.companyName}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {order.buyer.email}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">-</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-foreground">
                            {order.poNumber || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentStatus.color}>
                            {paymentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="!max-w-4xl !w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Status and Actions */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={statusConfig[selectedOrder.status]?.color || "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                  <Badge variant="outline" className={paymentStatusConfig[selectedOrder.paymentStatus]?.color || "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
                    {paymentStatusConfig[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                  </Badge>
                </div>
                {canAcceptOrReject(selectedOrder) && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      disabled={isUpdatingStatus}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleAcceptOrder}
                      disabled={isUpdatingStatus}
                      className="bg-green-500 hover:bg-green-500/90"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept Order
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                      <p className="text-foreground font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">PO Number</p>
                      <p className="text-foreground font-medium">{selectedOrder.poNumber || "-"}</p>
                    </div>
                    {selectedOrder.costCenter && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cost Center</p>
                        <p className="text-foreground font-medium">{selectedOrder.costCenter}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created</p>
                      <p className="text-foreground font-medium">
                        {format(new Date(selectedOrder.createdAt), "PPpp")}
                      </p>
                    </div>
                    {selectedOrder.sellerAcceptedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Accepted At</p>
                        <p className="text-foreground font-medium">
                          {format(new Date(selectedOrder.sellerAcceptedAt), "PPpp")}
                        </p>
                      </div>
                    )}
                    {selectedOrder.sellerRejectedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rejected At</p>
                        <p className="text-foreground font-medium">
                          {format(new Date(selectedOrder.sellerRejectedAt), "PPpp")}
                        </p>
                      </div>
                    )}
                    {selectedOrder.rejectionReason && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rejection Reason</p>
                        <p className="text-foreground font-medium">{selectedOrder.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">
                    {selectedOrder.isGuestOrder ? "Order Type" : "Buyer Information"}
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.isGuestOrder ? (
                      <div>
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          Guest Order
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          This order was placed by an individual buyer without an account.
                        </p>
                      </div>
                    ) : selectedOrder.buyer ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Name</p>
                          <p className="text-foreground font-medium">
                            {selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}
                          </p>
                        </div>
                        {selectedOrder.buyer.companyName && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Company</p>
                            <p className="text-foreground font-medium">{selectedOrder.buyer.companyName}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email</p>
                          <p className="text-foreground font-medium">{selectedOrder.buyer.email}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">No buyer information available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Shipping Address</h3>
                  <div className="space-y-1">
                    <p className="text-foreground font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-muted-foreground">{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {isLoadingPayment ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentInfo ? (
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Payment Information</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Total to be Paid</p>
                      <p className="text-2xl font-light text-foreground">
                        {formatCurrency(paymentInfo.payment.totalToBePaid, paymentInfo.order.currency)}
                      </p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Paid</p>
                      <p className="text-2xl font-light text-green-400">
                        {formatCurrency(paymentInfo.payment.paid, paymentInfo.order.currency)}
                      </p>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                      <p className="text-2xl font-light text-yellow-400">
                        {formatCurrency(paymentInfo.payment.remaining, paymentInfo.order.currency)}
                      </p>
                    </div>
                  </div>
                  {paymentInfo.paymentHistory.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-light text-foreground mb-3">Payment History</h4>
                      <div className="space-y-2">
                        {paymentInfo.paymentHistory.map((payment) => (
                          <div key={payment.id} className="glass-card rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="text-foreground font-medium">
                                {formatCurrency(payment.amount, payment.currency)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.paymentMethod} • {format(new Date(payment.paidAt), "PPpp")}
                              </p>
                            </div>
                            <Badge variant="outline" className={paymentStatusConfig[payment.status]?.color}>
                              {paymentStatusConfig[payment.status]?.label || payment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-light text-foreground mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{formatCurrency(selectedOrder.shippingCost, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Platform Commission</span>
                    <span className="text-foreground">{formatCurrency(selectedOrder.platformCommission, selectedOrder.currency)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-400">-{formatCurrency(selectedOrder.discountAmount, selectedOrder.currency)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-foreground font-medium text-lg">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {(selectedOrder.estimatedDeliveryDate || selectedOrder.actualDeliveryDate || selectedOrder.dispatchNotes) && (
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Delivery Information</h3>
                  <div className="space-y-3">
                    {selectedOrder.estimatedDeliveryDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                        <p className="text-foreground font-medium">
                          {format(new Date(selectedOrder.estimatedDeliveryDate), "PPpp")}
                        </p>
                      </div>
                    )}
                    {selectedOrder.actualDeliveryDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Actual Delivery</p>
                        <p className="text-foreground font-medium">
                          {format(new Date(selectedOrder.actualDeliveryDate), "PPpp")}
                        </p>
                      </div>
                    )}
                    {selectedOrder.dispatchNotes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dispatch Notes</p>
                        <p className="text-foreground font-medium">{selectedOrder.dispatchNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Order Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejecting this order..."
                rows={4}
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectOrder}
                disabled={isUpdatingStatus || !rejectionReason.trim()}
                className="bg-red-500 hover:bg-red-500/90"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
