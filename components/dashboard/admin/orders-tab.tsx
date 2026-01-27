"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Package, ShoppingBag, Truck, User, MapPin, DollarSign, Calendar, Loader2, X, CheckCircle } from "lucide-react"
import { getAdminOrders, getAdminOrderDetail, getAdminOrderPayment, dispatchOrder, markOrderDelivered, recordPayment, type AdminOrder, type AdminOrderDetail, type AdminOrderPaymentInfo } from "@/lib/api/admin-orders"
import { getAdminDrivers, type AdminDriver } from "@/lib/api/admin-drivers"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, format } from "date-fns"

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAYMENT_FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  AWAITING_SELLER_ACCEPTANCE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SELLER_REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  PROCESSING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SHIPPED: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  RETURNED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DISPUTED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  PARTIAL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetail | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<AdminOrderPaymentInfo | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [availableDrivers, setAvailableDrivers] = useState<AdminDriver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [dispatchForm, setDispatchForm] = useState({
    driverId: "",
    estimatedDeliveryDate: "",
    dispatchNotes: ""
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    notes: ""
  })
  const { toast } = useToast()

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAdminOrders(page, limit)
      setOrders(data.orders)
      setTotalPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.buyer.email?.toLowerCase().includes(query) ||
      order.buyer.firstName?.toLowerCase().includes(query) ||
      order.buyer.lastName?.toLowerCase().includes(query) ||
      order.poNumber?.toLowerCase().includes(query) ||
      order.shippingAddress.fullName?.toLowerCase().includes(query)
    )
  })

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  const loadOrderDetail = useCallback(async (orderId: string) => {
    try {
      setIsLoadingDetail(true)
      const [detail, payment] = await Promise.all([
        getAdminOrderDetail(orderId),
        getAdminOrderPayment(orderId)
      ])
      setOrderDetail(detail)
      setPaymentInfo(payment)
    } catch (err: any) {
      console.error('Failed to load order detail:', err)
      // Fallback to list data if detail fetch fails
    } finally {
      setIsLoadingDetail(false)
    }
  }, [])

  const handleOrderClick = (order: AdminOrder) => {
    setSelectedOrder(order)
    setOrderDetail(null)
    setPaymentInfo(null)
    loadOrderDetail(order.id)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedOrder(null)
      setOrderDetail(null)
      setPaymentInfo(null)
    }
  }

  const loadAvailableDrivers = useCallback(async () => {
    try {
      setIsLoadingDrivers(true)
      const drivers = await getAdminDrivers()
      // Filter to only show AVAILABLE drivers
      const available = drivers.filter(d => d.status === "AVAILABLE")
      setAvailableDrivers(available)
    } catch (err: any) {
      console.error('Failed to load drivers:', err)
      toast({
        title: "Error",
        description: "Failed to load available drivers",
        variant: "destructive"
      })
    } finally {
      setIsLoadingDrivers(false)
    }
  }, [toast])

  const handleOpenDispatchModal = () => {
    setShowDispatchModal(true)
    setDispatchForm({
      driverId: "",
      estimatedDeliveryDate: "",
      dispatchNotes: ""
    })
    loadAvailableDrivers()
  }

  const handleDispatchOrder = async () => {
    if (!displayOrder || !dispatchForm.driverId) {
      toast({
        title: "Validation Error",
        description: "Please select a driver",
        variant: "destructive"
      })
      return
    }

    try {
      setIsDispatching(true)
      const request: any = {
        driverId: dispatchForm.driverId
      }
      
      if (dispatchForm.estimatedDeliveryDate) {
        request.estimatedDeliveryDate = new Date(dispatchForm.estimatedDeliveryDate).toISOString()
      }
      
      if (dispatchForm.dispatchNotes) {
        request.dispatchNotes = dispatchForm.dispatchNotes
      }

      await dispatchOrder(displayOrder.id, request)
      
      toast({
        title: "Success",
        description: "Order dispatched successfully",
      })

      // Close modals and refresh
      setShowDispatchModal(false)
      setSelectedOrder(null)
      setOrderDetail(null)
      setPaymentInfo(null)
      loadOrders()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to dispatch order",
        variant: "destructive"
      })
    } finally {
      setIsDispatching(false)
    }
  }

  const handleMarkAsDelivered = async () => {
    if (!displayOrder) return

    try {
      setIsMarkingDelivered(true)
      await markOrderDelivered(displayOrder.id)
      
      toast({
        title: "Success",
        description: "Order marked as delivered successfully",
      })

      // Refresh order detail and list
      await loadOrderDetail(displayOrder.id)
      loadOrders()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to mark order as delivered",
        variant: "destructive"
      })
    } finally {
      setIsMarkingDelivered(false)
    }
  }

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true)
    setPaymentForm({
      amount: "",
      notes: ""
    })
  }

  const handleRecordPayment = async () => {
    if (!displayOrder || !paymentInfo) return

    const amount = parseFloat(paymentForm.amount)
    if (!amount || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      })
      return
    }

    if (amount > paymentInfo.payment.remaining) {
      toast({
        title: "Validation Error",
        description: `Amount cannot exceed remaining balance of ${formatCurrency(paymentInfo.payment.remaining, displayOrder.currency)}`,
        variant: "destructive"
      })
      return
    }

    try {
      setIsRecordingPayment(true)
      await recordPayment(displayOrder.id, {
        amount: amount,
        notes: paymentForm.notes || undefined
      })
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })

      // Close modal and refresh
      setShowPaymentModal(false)
      setPaymentForm({ amount: "", notes: "" })
      await loadOrderDetail(displayOrder.id)
      loadOrders()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to record payment",
        variant: "destructive"
      })
    } finally {
      setIsRecordingPayment(false)
    }
  }

  // Use detailed order data if available, otherwise use list data
  const displayOrder = orderDetail || selectedOrder

  return (
    <>
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Orders
              </CardTitle>
              <CardDescription>
                {total > 0 ? `${total} total orders` : "View and manage all orders"}
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
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No orders found matching your search" : "No orders found"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Order Number</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <TableRow
                        key={order.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium text-foreground">{order.orderNumber}</div>
                          {order.poNumber && (
                            <div className="text-xs text-muted-foreground">PO: {order.poNumber}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {order.buyer.firstName} {order.buyer.lastName}
                            </div>
                            <div className="text-muted-foreground">{order.buyer.email}</div>
                            {order.buyer.companyName && (
                              <div className="text-xs text-muted-foreground">{order.buyer.companyName}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {order.items[0]?.inventory.seller.businessName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order._count.items} item{order._count.items !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentStatusColors[order.paymentStatus] || "bg-muted text-muted-foreground"}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.driver ? (
                            <div className="text-sm">
                              <div className="font-medium text-foreground">
                                {order.driver.firstName} {order.driver.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">{order.driver.phoneNumber}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOrderClick(order)}
                          >
                            View
                          </Button>
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
                    Showing page {page} of {totalPages} ({total} total orders)
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={handleDialogClose}>
        <DialogContent className="!max-w-[85vw] !w-[85vw] max-h-[90vh] overflow-y-auto">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Order Details</DialogTitle>
                <DialogDescription>
                  Complete information for {displayOrder.orderNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Order Number</div>
                        <div className="font-medium">{displayOrder.orderNumber}</div>
                      </div>
                      {displayOrder.poNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground">PO Number</div>
                          <div className="font-medium">{displayOrder.poNumber}</div>
                        </div>
                      )}
                      {displayOrder.costCenter && (
                        <div>
                          <div className="text-sm text-muted-foreground">Cost Center</div>
                          <div className="font-medium">{displayOrder.costCenter}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant="outline" className={statusColors[displayOrder.status] || "bg-muted text-muted-foreground"}>
                          {displayOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Status</div>
                        <Badge variant="outline" className={paymentStatusColors[displayOrder.paymentStatus] || "bg-muted text-muted-foreground"}>
                          {displayOrder.paymentStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Subtotal</div>
                        <div className="font-medium">{formatCurrency(displayOrder.subtotal, displayOrder.currency)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Shipping Cost</div>
                        <div className="font-medium">{formatCurrency(displayOrder.shippingCost, displayOrder.currency)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Platform Commission</div>
                        <div className="font-medium">{formatCurrency(displayOrder.platformCommission, displayOrder.currency)}</div>
                      </div>
                      {displayOrder.discountAmount > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground">Discount</div>
                          <div className="font-medium text-green-400">-{formatCurrency(displayOrder.discountAmount, displayOrder.currency)}</div>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border">
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="text-2xl font-light text-foreground">{formatCurrency(displayOrder.totalAmount, displayOrder.currency)}</div>
                      </div>
                      {displayOrder.couponCode && (
                        <div>
                          <div className="text-sm text-muted-foreground">Coupon Code</div>
                          <div className="font-medium">{displayOrder.couponCode}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="font-medium">{format(new Date(displayOrder.createdAt), "PPpp")}</div>
                        <div className="text-xs text-muted-foreground mt-1">{formatTime(displayOrder.createdAt)}</div>
                      </div>
                      {displayOrder.sellerAcceptedAt && (
                        <div>
                          <div className="text-sm text-muted-foreground">Seller Accepted</div>
                          <div className="font-medium">{format(new Date(displayOrder.sellerAcceptedAt), "PPpp")}</div>
                        </div>
                      )}
                      {displayOrder.dispatchedAt && (
                        <div>
                          <div className="text-sm text-muted-foreground">Dispatched</div>
                          <div className="font-medium">{format(new Date(displayOrder.dispatchedAt), "PPpp")}</div>
                        </div>
                      )}
                      {displayOrder.estimatedDeliveryDate && (
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                          <div className="font-medium">{format(new Date(displayOrder.estimatedDeliveryDate), "PPpp")}</div>
                        </div>
                      )}
                      {displayOrder.actualDeliveryDate && (
                        <div>
                          <div className="text-sm text-muted-foreground">Actual Delivery</div>
                          <div className="font-medium">{format(new Date(displayOrder.actualDeliveryDate), "PPpp")}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Buyer & Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Buyer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{displayOrder.buyer.firstName} {displayOrder.buyer.lastName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{displayOrder.buyer.email}</div>
                      </div>
                      {displayOrder.buyer.companyName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Company</div>
                          <div className="font-medium">{displayOrder.buyer.companyName}</div>
                        </div>
                      )}
                      {orderDetail?.buyer.phoneNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                          <div className="font-medium">{orderDetail.buyer.phoneNumber}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Recipient</div>
                        <div className="font-medium">{displayOrder.shippingAddress.fullName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Address</div>
                        <div className="font-medium">
                          {displayOrder.shippingAddress.addressLine1}
                          {displayOrder.shippingAddress.addressLine2 && `, ${displayOrder.shippingAddress.addressLine2}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">City, Province</div>
                        <div className="font-medium">
                          {displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.province}
                        </div>
                      </div>
                      {displayOrder.shippingAddress.postalCode && (
                        <div>
                          <div className="text-sm text-muted-foreground">Postal Code</div>
                          <div className="font-medium">{displayOrder.shippingAddress.postalCode}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Seller Information */}
                {orderDetail?.seller && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Seller Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Business Name</div>
                          <div className="font-medium">{orderDetail.seller.businessName}</div>
                        </div>
                        {orderDetail.seller.tradingName && (
                          <div>
                            <div className="text-sm text-muted-foreground">Trading Name</div>
                            <div className="font-medium">{orderDetail.seller.tradingName}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="font-medium">{orderDetail.seller.email}</div>
                        </div>
                        {orderDetail.seller.contactNumber && (
                          <div>
                            <div className="text-sm text-muted-foreground">Contact Number</div>
                            <div className="font-medium">{orderDetail.seller.contactNumber}</div>
                          </div>
                        )}
                        {orderDetail.seller.businessAddress && (
                          <div>
                            <div className="text-sm text-muted-foreground">Business Address</div>
                            <div className="font-medium">{orderDetail.seller.businessAddress}</div>
                          </div>
                        )}
                        {orderDetail.seller.tin && (
                          <div>
                            <div className="text-sm text-muted-foreground">TIN</div>
                            <div className="font-medium">{orderDetail.seller.tin}</div>
                          </div>
                        )}
                        {orderDetail.seller.registrationNumber && (
                          <div>
                            <div className="text-sm text-muted-foreground">Registration Number</div>
                            <div className="font-medium">{orderDetail.seller.registrationNumber}</div>
                          </div>
                        )}
                        {orderDetail.seller.status && (
                          <div>
                            <div className="text-sm text-muted-foreground">Status</div>
                            <Badge variant="outline">{orderDetail.seller.status}</Badge>
                          </div>
                        )}
                        {orderDetail.seller.sriScore !== undefined && (
                          <div>
                            <div className="text-sm text-muted-foreground">SRI Score</div>
                            <div className="font-medium">{orderDetail.seller.sriScore}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Information */}
                {paymentInfo && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Total to be Paid</div>
                          <div className="text-2xl font-light text-foreground">
                            {formatCurrency(paymentInfo.payment.totalToBePaid, displayOrder.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Paid</div>
                          <div className="text-2xl font-light text-green-400">
                            {formatCurrency(paymentInfo.payment.paid, displayOrder.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Remaining</div>
                          <div className="text-2xl font-light text-orange-400">
                            {formatCurrency(paymentInfo.payment.remaining, displayOrder.currency)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {paymentInfo.payment.isFullyPaid && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Fully Paid
                          </Badge>
                        )}
                        {paymentInfo.payment.isPartiallyPaid && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Partially Paid
                          </Badge>
                        )}
                        {paymentInfo.payment.hasNoPayment && (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            No Payment
                          </Badge>
                        )}
                      </div>
                      {paymentInfo.paymentHistory && paymentInfo.paymentHistory.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-2">Payment History</div>
                          <div className="space-y-2">
                            {paymentInfo.paymentHistory.map((payment: any, idx: number) => (
                              <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                                <div className="font-medium">{formatCurrency(payment.amount, displayOrder.currency)}</div>
                                <div className="text-muted-foreground">
                                  {payment.method} - {payment.createdAt && format(new Date(payment.createdAt), "PPpp")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Record Payment Button - Only show for DELIVERED orders with remaining balance */}
                      {displayOrder.status === "DELIVERED" && paymentInfo.payment.remaining > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <Button
                            onClick={handleOpenPaymentModal}
                            className="bg-accent hover:bg-accent/90"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record Payment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Driver Information */}
                {displayOrder.driver && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Driver Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Name</div>
                          <div className="font-medium">{displayOrder.driver.firstName} {displayOrder.driver.lastName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                          <div className="font-medium">{displayOrder.driver.phoneNumber}</div>
                        </div>
                        {displayOrder.driver.vehicleType && (
                          <div>
                            <div className="text-sm text-muted-foreground">Vehicle</div>
                            <div className="font-medium">{displayOrder.driver.vehicleType} {displayOrder.driver.vehiclePlate && `(${displayOrder.driver.vehiclePlate})`}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <Badge variant="outline">{displayOrder.driver.status}</Badge>
                        </div>
                      </div>
                      {displayOrder.dispatchNotes && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground">Dispatch Notes</div>
                          <div className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{displayOrder.dispatchNotes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Order Items */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {displayOrder.items.map((item) => {
                        const detailedItem = orderDetail?.items.find(i => i.id === item.id)
                        return (
                          <div key={item.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{item.inventory.masterProduct.name}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                OEM: {item.inventory.masterProduct.oemPartNumber} | Manufacturer: {item.inventory.masterProduct.manufacturer}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Seller: {item.inventory.seller.businessName} | SKU: {item.inventory.sellerSku}
                              </div>
                              {detailedItem?.inventory.sellerNotes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Notes: {detailedItem.inventory.sellerNotes}
                                </div>
                              )}
                              {detailedItem?.commission && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Commission: {formatCurrency(detailedItem.commission, displayOrder.currency)}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm text-muted-foreground">Quantity</div>
                              <div className="font-medium text-foreground">{item.quantity}</div>
                              <div className="text-sm text-muted-foreground mt-2">Unit Price</div>
                              <div className="font-medium text-foreground">{formatCurrency(item.unitPrice, displayOrder.currency)}</div>
                              <div className="text-sm text-muted-foreground mt-2">Display Price</div>
                              <div className="font-medium text-foreground">{formatCurrency(item.displayPrice, displayOrder.currency)}</div>
                              <div className="text-sm text-muted-foreground mt-2">Line Total</div>
                              <div className="font-medium text-foreground">{formatCurrency(item.displayPrice * item.quantity, displayOrder.currency)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  {displayOrder.status === "PROCESSING" && (
                    <Button
                      onClick={handleOpenDispatchModal}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Dispatch Order
                    </Button>
                  )}
                  {displayOrder.status === "SHIPPED" && (
                    <Button
                      onClick={handleMarkAsDelivered}
                      disabled={isMarkingDelivered}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isMarkingDelivered ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Marking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispatch Order Modal */}
      <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Dispatch Order</DialogTitle>
          </DialogHeader>
          {displayOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <Card className="border-border bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Order ID</div>
                      <div className="font-medium">{displayOrder.orderNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Customer Name</div>
                      <div className="font-medium">
                        {displayOrder.buyer.firstName} {displayOrder.buyer.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-medium">
                        {formatCurrency(displayOrder.totalAmount, displayOrder.currency)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Select Driver *</Label>
                  {isLoadingDrivers ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading drivers...
                    </div>
                  ) : (
                    <Select
                      value={dispatchForm.driverId}
                      onValueChange={(value) => setDispatchForm(prev => ({ ...prev, driverId: value }))}
                    >
                      <SelectTrigger id="driver">
                        <SelectValue placeholder="Choose a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDrivers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No available drivers</div>
                        ) : (
                          availableDrivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.firstName} {driver.lastName} {driver.phoneNumber && `(${driver.phoneNumber})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Estimated Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="datetime-local"
                    value={dispatchForm.estimatedDeliveryDate}
                    onChange={(e) => setDispatchForm(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                    placeholder="dd/mm/yyyy --:--"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Dispatch Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special instructions for the driver..."
                    value={dispatchForm.dispatchNotes}
                    onChange={(e) => setDispatchForm(prev => ({ ...prev, dispatchNotes: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowDispatchModal(false)}
                  disabled={isDispatching}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDispatchOrder}
                  disabled={isDispatching || !dispatchForm.driverId || isLoadingDrivers}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      Dispatch Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Record Payment</DialogTitle>
          </DialogHeader>
          {displayOrder && paymentInfo && (
            <div className="space-y-6">
              {/* Order Info */}
              <Card className="border-border bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Order ID</div>
                      <div className="font-medium">{displayOrder.orderNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Remaining balance:</div>
                      <div className="font-medium text-red-500">
                        {formatCurrency(paymentInfo.payment.remaining, displayOrder.currency)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="text-xs text-muted-foreground">
                    Max {formatCurrency(paymentInfo.payment.remaining, displayOrder.currency)}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={paymentInfo.payment.remaining}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                  <div className="text-xs text-muted-foreground">
                    Enter the amount collected by the driver. Must not exceed the remaining balance.
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentNotes">Notes</Label>
                  <Textarea
                    id="paymentNotes"
                    placeholder="e.g. Cash collected by driver John Doe at delivery"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isRecordingPayment}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordPayment}
                  disabled={isRecordingPayment || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isRecordingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
