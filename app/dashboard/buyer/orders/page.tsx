"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getOrders, getOrderPayment, type OrderResponse, type PaymentDetailsResponse } from "@/lib/api/orders"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Clock, CheckCircle2, Truck, X, MapPin, CreditCard, DollarSign, Calendar } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  PENDING_PAYMENT: { icon: Clock, label: "Pending Payment", color: "text-yellow-400" },
  PENDING: { icon: Clock, label: "Pending", color: "text-yellow-400" },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", color: "text-blue-400" },
  PROCESSING: { icon: Package, label: "Processing", color: "text-blue-400" },
  SHIPPED: { icon: Truck, label: "Shipped", color: "text-accent" },
  DELIVERED: { icon: CheckCircle2, label: "Delivered", color: "text-green-400" },
  CANCELLED: { icon: X, label: "Cancelled", color: "text-red-400" },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse['data'] | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })

  useEffect(() => {
    loadOrders()
  }, [page])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const response = await getOrders(page, 20)
      setOrders(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error loading orders:', error)
      alert(error.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderClick = async (order: OrderResponse) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
    setIsLoadingPayment(true)
    
    try {
      const payment = await getOrderPayment(order.id)
      setPaymentDetails(payment)
    } catch (error: any) {
      console.error('Error loading payment details:', error)
      // Don't show alert, just log the error
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm")
    } catch {
      return dateString
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || { icon: Clock, label: status, color: "text-muted" }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          My Orders
        </h1>
        <p className="text-muted-foreground font-light">Track and manage your orders</p>
      </motion.div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-lg p-12 text-center">
          <Package className="h-16 w-16 text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-light text-foreground mb-2">No orders yet</h2>
          <p className="text-muted-foreground font-light mb-6">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = getStatusConfig(order.status)
            const StatusIcon = status.icon
            const firstItem = order.items[0]
            const rawImage = firstItem?.inventory?.sellerImages?.[0] || firstItem?.inventory?.masterProduct?.imageUrls?.[0] || "/placeholder.svg"
            const productImage = rawImage.startsWith('//') ? `https:${rawImage}` : rawImage
            const productName = firstItem?.inventory?.masterProduct?.name || "Unknown Product"

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="glass-card rounded-lg p-6 cursor-pointer hover:border-accent/50 transition-all"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={productImage.startsWith('//') ? `https:${productImage}` : productImage}
                      alt={productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-light text-foreground">{order.orderNumber}</h3>
                        <p className="text-muted-foreground font-light text-sm">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {formatDate(order.createdAt)}
                        </p>
                        {order.items.length > 0 && (
                          <p className="text-muted-foreground font-light text-sm mt-1">
                            {productName}
                            {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${status.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-light">{status.label}</span>
                        </div>
                        <span className="text-xl font-light text-foreground">
                          {order.currency} {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-muted-foreground font-light">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-6xl !w-[90vw] max-h-[90vh] overflow-y-auto !grid-cols-1">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const status = getStatusConfig(selectedOrder.status)
                    const StatusIcon = status.icon
                    return (
                      <>
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        <span className={`font-light ${status.color}`}>{status.label}</span>
                      </>
                    )
                  })()}
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground font-light text-sm">Order Date</p>
                  <p className="text-foreground font-light">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-light text-foreground mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => {
                    const productImage = item.inventory?.sellerImages?.[0] || item.inventory?.masterProduct?.imageUrls?.[0] || "/placeholder.svg"
                    const productName = item.inventory?.masterProduct?.name || "Unknown Product"
                    const oemPartNumber = item.inventory?.masterProduct?.oemPartNumber || ""
                    const compatibility = item.inventory?.masterProduct?.vehicleCompatibility

                    return (
                      <div key={item.id} className="glass-card rounded-lg p-4 flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={productImage.startsWith('//') ? `https:${productImage}` : productImage}
                            alt={productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-light text-foreground mb-1">{productName}</h4>
                          {oemPartNumber && (
                            <p className="text-muted-foreground font-light text-sm">OEM: {oemPartNumber}</p>
                          )}
                          {compatibility && (
                            <p className="text-muted-foreground font-light text-sm">
                              {compatibility.make} {compatibility.model} ({compatibility.year})
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-muted-foreground font-light text-sm">
                              Quantity: {item.quantity} × {selectedOrder.currency} {item.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-foreground font-light">
                              {selectedOrder.currency} {(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Shipping Address
                </h3>
                <div className="glass-card rounded-lg p-4">
                  <p className="text-foreground font-light">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-muted-foreground font-light text-sm">{selectedOrder.shippingAddress.phoneNumber}</p>
                  <p className="text-muted-foreground font-light text-sm mt-2">
                    {selectedOrder.shippingAddress.addressLine1}
                    {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-muted-foreground font-light text-sm">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}
                    {selectedOrder.shippingAddress.postalCode && ` ${selectedOrder.shippingAddress.postalCode}`}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Payment Information
                </h3>
                {isLoadingPayment ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                ) : paymentDetails ? (
                  <div className="glass-card rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-light">Payment Status</span>
                      <span className={`font-light ${
                        paymentDetails.payment.isFullyPaid ? 'text-green-400' :
                        paymentDetails.payment.isPartiallyPaid ? 'text-yellow-400' :
                        'text-yellow-400'
                      }`}>
                        {paymentDetails.payment.isFullyPaid ? 'Paid' :
                         paymentDetails.payment.isPartiallyPaid ? 'Partially Paid' :
                         'Pending Payment'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-light">Total Amount</span>
                      <span className="text-foreground font-light">
                        {paymentDetails.order.currency} {paymentDetails.payment.totalToBePaid.toLocaleString()}
                      </span>
                    </div>
                    {paymentDetails.payment.isPartiallyPaid && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-light">Paid</span>
                          <span className="text-green-400 font-light">
                            {paymentDetails.order.currency} {paymentDetails.payment.paid.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-light">Remaining</span>
                          <span className="text-yellow-400 font-light">
                            {paymentDetails.order.currency} {paymentDetails.payment.remaining.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-muted-foreground font-light text-sm">Payment information unavailable</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Order Summary
                </h3>
                <div className="glass-card rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-light">Subtotal</span>
                    <span className="text-foreground font-light">
                      {selectedOrder.currency} {selectedOrder.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.shippingCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-light">Shipping</span>
                      <span className="text-foreground font-light">
                        {selectedOrder.currency} {selectedOrder.shippingCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.platformCommission > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-light">Platform Commission</span>
                      <span className="text-foreground font-light">
                        {selectedOrder.currency} {selectedOrder.platformCommission.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-light">Discount</span>
                      <span className="text-green-400 font-light">
                        -{selectedOrder.currency} {selectedOrder.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-light text-lg">Total</span>
                      <span className="text-foreground font-light text-lg">
                        {selectedOrder.currency} {selectedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(selectedOrder.poNumber || selectedOrder.costCenter || selectedOrder.estimatedDeliveryDate) && (
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Additional Information
                  </h3>
                  <div className="glass-card rounded-lg p-4 space-y-2">
                    {selectedOrder.poNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-light">PO Number</span>
                        <span className="text-foreground font-light">{selectedOrder.poNumber}</span>
                      </div>
                    )}
                    {selectedOrder.costCenter && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-light">Cost Center</span>
                        <span className="text-foreground font-light">{selectedOrder.costCenter}</span>
                      </div>
                    )}
                    {selectedOrder.estimatedDeliveryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-light">Estimated Delivery</span>
                        <span className="text-foreground font-light">
                          {formatDate(selectedOrder.estimatedDeliveryDate)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.actualDeliveryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-light">Delivered On</span>
                        <span className="text-green-400 font-light">
                          {formatDate(selectedOrder.actualDeliveryDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
