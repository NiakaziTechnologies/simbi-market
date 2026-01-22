"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Search, RefreshCw, Eye, CheckCircle, XCircle, Clock, Truck } from "lucide-react";

// Mock formatUSD function
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "AWAITING_SELLER_ACCEPTANCE":
      return "border-yellow-500/30 text-yellow-400 bg-yellow-500/5";
    case "PENDING_PAYMENT":
    case "PENDING":
      return "border-gray-500/30 text-gray-400 bg-gray-500/5";
    case "PROCESSING":
    case "ACCEPTED":
      return "border-amber-500/30 text-amber-400 bg-amber-500/5";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "border-blue-500/30 text-blue-400 bg-blue-500/5";
    case "DELIVERED":
    case "COMPLETED":
      return "border-green-500/30 text-green-400 bg-green-500/5";
    case "CANCELLED":
      return "border-red-500/30 text-red-400 bg-red-500/5";
    case "REJECTED":
    case "SELLER_REJECTED":
      return "border-orange-500/30 text-orange-400 bg-orange-500/5";
    default:
      return "border-muted text-muted-foreground bg-muted/30";
  }
};

const getStatusIcon = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "AWAITING_SELLER_ACCEPTANCE":
      return <Clock className="w-4 h-4" />;
    case "PENDING_PAYMENT":
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    case "PROCESSING":
    case "ACCEPTED":
      return <RefreshCw className="w-4 h-4" />;
    case "SHIPPED":
    case "IN_TRANSIT":
      return <Truck className="w-4 h-4" />;
    case "DELIVERED":
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4" />;
    case "CANCELLED":
    case "REJECTED":
    case "SELLER_REJECTED":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const formatStatus = (status: string) => {
  return status?.split('_').map(word =>
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ') || status;
};

// Mock data
const mockOrders = [
  {
    id: "ORD-001",
    orderNumber: "ORD-001",
    totalAmount: 1250.00,
    status: "PROCESSING",
    paymentStatus: "COMPLETED",
    createdAt: "2024-01-15T10:30:00Z",
    currency: "USD",
    items: [
      { name: "Toyota Camry Brake Pads", quantity: 4, price: 89.99 },
      { name: "Honda Civic Air Filter", quantity: 2, price: 25.50 }
    ],
    customer: {
      name: "John Smith",
      email: "john@example.com"
    }
  },
  {
    id: "ORD-002",
    orderNumber: "ORD-002",
    totalAmount: 890.50,
    status: "SHIPPED",
    paymentStatus: "COMPLETED",
    createdAt: "2024-01-14T15:45:00Z",
    currency: "USD",
    items: [
      { name: "Ford Ranger Oil Filter", quantity: 5, price: 15.75 }
    ],
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com"
    }
  },
  {
    id: "ORD-003",
    orderNumber: "ORD-003",
    totalAmount: 2100.75,
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
    createdAt: "2024-01-14T09:20:00Z",
    currency: "USD",
    items: [
      { name: "BMW X5 Spark Plugs", quantity: 8, price: 45.99 }
    ],
    customer: {
      name: "Mike Davis",
      email: "mike@example.com"
    }
  },
  {
    id: "ORD-004",
    orderNumber: "ORD-004",
    totalAmount: 675.25,
    status: "DELIVERED",
    paymentStatus: "COMPLETED",
    createdAt: "2024-01-13T14:15:00Z",
    currency: "USD",
    items: [
      { name: "Chevrolet Silverado Brake Rotors", quantity: 2, price: 120.00 }
    ],
    customer: {
      name: "Lisa Brown",
      email: "lisa@example.com"
    }
  }
];

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) =>
        order.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter((order) =>
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.id?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, query, statusFilter]);

  async function acceptOrder(orderId: string) {
    try {
      setLoadingOrderId(orderId);
      // Mock API call
      setTimeout(() => {
        const updatedOrders = orders.map(order =>
          order.id === orderId ? { ...order, status: "PROCESSING" } : order
        );
        setOrders(updatedOrders);
        setLoadingOrderId(null);
      }, 500);
    } catch (error) {
      console.error('Failed to accept order:', error);
      setLoadingOrderId(null);
    }
  }

  async function rejectOrder(orderId: string) {
    try {
      setLoadingOrderId(orderId);
      // Mock API call
      setTimeout(() => {
        const updatedOrders = orders.map(order =>
          order.id === orderId ? { ...order, status: "REJECTED" } : order
        );
        setOrders(updatedOrders);
        setLoadingOrderId(null);
      }, 500);
    } catch (error) {
      console.error('Failed to reject order:', error);
      setLoadingOrderId(null);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      setLoadingOrderId(orderId);
      // Mock API call
      setTimeout(() => {
        const updatedOrders = orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        setLoadingOrderId(null);
      }, 500);
    } catch (error) {
      console.error('Failed to update order status:', error);
      setLoadingOrderId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Orders</h1>
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card border border-border p-6 rounded-lg animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              Orders
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage and track all your customer orders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-border text-foreground hover:bg-accent/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 border-border focus:ring-accent focus:border-accent bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-accent focus:border-accent bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="AWAITING_SELLER_ACCEPTANCE">Awaiting Acceptance</option>
                <option value="PENDING_PAYMENT">Pending Payment</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="glass-card rounded-xl border border-border">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold text-foreground mb-3">No orders found</div>
            <div className="text-muted-foreground mb-8 max-w-md mx-auto">
              {query || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You haven't received any orders yet."
              }
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-foreground">#{order.orderNumber || order.id}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-foreground">
                        {formatUSD(order.totalAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">{order.currency || 'USD'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{formatStatus(order.status)}</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {order.paymentStatus && (
                        <Badge className={order.paymentStatus === 'PENDING' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : 'border-green-500/30 text-green-400 bg-green-500/5'}>
                          {order.paymentStatus}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-accent/10"
                        >
                          <Eye className="h-4 w-4 text-accent" />
                        </Button>

                        {/* Accept/Reject buttons for orders awaiting seller acceptance */}
                        {(order.status?.toUpperCase() === 'AWAITING_SELLER_ACCEPTANCE' || order.status?.toUpperCase() === 'PENDING_PAYMENT') && (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptOrder(order.id);
                              }}
                              disabled={loadingOrderId === order.id}
                              className="h-8 px-3 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs disabled:opacity-50"
                            >
                              {loadingOrderId === order.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                                  Accepting...
                                </div>
                              ) : (
                                'Accept'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectOrder(order.id);
                              }}
                              disabled={loadingOrderId === order.id}
                              className="h-8 px-3 text-xs disabled:opacity-50"
                            >
                              {loadingOrderId === order.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Rejecting...
                                </div>
                              ) : (
                                'Reject'
                              )}
                            </Button>
                          </>
                        )}

                        {/* Status dropdown for other statuses */}
                        {!['CANCELLED', 'DELIVERED', 'REJECTED', 'SELLER_REJECTED', 'AWAITING_SELLER_ACCEPTANCE', 'PENDING_PAYMENT', 'SHIPPED'].includes(order.status?.toUpperCase() || '') && (
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={loadingOrderId === order.id}
                            className="px-2 py-1 text-xs border border-border rounded-md focus:ring-accent focus:border-accent bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        )}
                        {loadingOrderId === order.id && (
                          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Number:</span>
                        <span className="font-medium text-foreground">#{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium text-foreground">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{formatStatus(selectedOrder.status)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge className={selectedOrder.paymentStatus === 'PENDING' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : 'border-green-500/30 text-green-400 bg-green-500/5'}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium text-foreground">{selectedOrder.customer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{selectedOrder.customer?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {formatUSD(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatUSD(item.quantity * item.price)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-foreground">Total:</span>
                        <span className="text-xl font-bold text-accent">{formatUSD(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}