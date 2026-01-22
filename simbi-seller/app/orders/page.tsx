// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Filter, RefreshCw, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateWithTime } from "@/lib/date";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "AWAITING_SELLER_ACCEPTANCE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PENDING_PAYMENT":
    case "PENDING":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "PROCESSING":
    case "ACCEPTED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "DELIVERED":
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    case "REJECTED":
    case "SELLER_REJECTED":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "AWAITING_SELLER_ACCEPTANCE":
      return "⏸️";
    case "PENDING_PAYMENT":
    case "PENDING":
      return "⏳";
    case "PROCESSING":
    case "ACCEPTED":
      return "⚙️";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "📦";
    case "DELIVERED":
    case "COMPLETED":
      return "✅";
    case "CANCELLED":
      return "❌";
    case "REJECTED":
    case "SELLER_REJECTED":
      return "⚠️";
    default:
      return "❓";
  }
};

const formatStatus = (status: string) => {
  return status?.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ') || status;
};

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderToReject, setOrderToReject] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const { accessToken } = useSellerAuth();

  useEffect(() => {
    const loadOrders = async () => {
      if (accessToken) {
      try {
        setLoading(true);
          // API returns: { success: true, data: [...orders], pagination: {...} }
          const response = await apiClient.request<{ success: boolean; data: any[]; pagination?: any }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );

          if (response.success && Array.isArray(response.data)) {
            setOrders(response.data || []);
            setFilteredOrders(response.data || []);
          } else {
            console.warn('Unexpected API response structure:', response);
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
        }
      }
    };

    loadOrders();
  }, [accessToken]);

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
      setAcceptingOrderId(orderId);
      if (accessToken) {
        const data = await apiClient.request<{ success: boolean; message: string; data?: any }>(
          `/api/seller/orders/${orderId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: "ACCEPTED" })
          }
        );

        if (data.success) {
          // Refresh orders list
          const response = await apiClient.request<{ success: boolean; data: any[] }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (response.success && Array.isArray(response.data)) {
            setOrders(response.data);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to accept order:', error);
      alert(error?.data?.message || 'Failed to accept order. Please try again.');
    } finally {
      setAcceptingOrderId(null);
    }
  }

  async function rejectOrder(orderId: string, rejectionReason: string) {
    try {
      if (!rejectionReason.trim()) {
        alert('Please provide a rejection reason.');
        return;
      }

      setRejectingOrderId(orderId);
      if (accessToken) {
        const data = await apiClient.request<{ success: boolean; message: string; data?: any }>(
          `/api/seller/orders/${orderId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              status: "REJECTED",
              rejectionReason: rejectionReason.trim()
            })
          }
        );

        if (data.success) {
          setShowRejectModal(false);
          setRejectReason("");
          setOrderToReject(null);
          
          // Refresh orders list
          const response = await apiClient.request<{ success: boolean; data: any[] }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (response.success && Array.isArray(response.data)) {
            setOrders(response.data);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to reject order:', error);
      alert(error?.data?.message || 'Failed to reject order. Please try again.');
    } finally {
      setRejectingOrderId(null);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      setLoadingOrderId(orderId);
      // Update order status via API
      if (accessToken) {
        const data = await apiClient.request<{ success: boolean; message: string; data?: any }>(
          `/api/seller/orders/${orderId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
          }
        );

        if (data.success) {
          // Refresh orders list
          const response = await apiClient.request<{ success: boolean; data: any[] }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (response.success && Array.isArray(response.data)) {
            setOrders(response.data);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      alert(error?.data?.message || 'Failed to update order status. Please try again.');
    } finally {
      setLoadingOrderId(null);
    }
  }

  async function fetchPaymentDetails(orderId: string) {
    try {
      setLoadingPaymentDetails(true);
      if (accessToken) {
        const response = await apiClient.request<{ 
          success: boolean; 
          data: {
            order: {
              id: string;
              orderNumber: string;
              status: string;
              paymentStatus: string;
              currency: string;
            };
            payment: {
              totalToBePaid: number;
              paid: number;
              remaining: number;
              isFullyPaid: boolean;
              isPartiallyPaid: boolean;
              hasNoPayment: boolean;
            };
            paymentDetails?: {
              id: string;
              status: string;
              paymentMethod: string;
              paidAt: string;
              currency: string;
            };
            paymentHistory: Array<{
              amount: number;
              date: string;
              notes?: string;
              recordedBy?: string;
            }>;
            buyer?: {
              id: string;
              firstName: string;
              lastName: string;
              companyName?: string;
              email: string;
            };
            seller?: {
              id: string;
              businessName: string;
              email: string;
            };
          };
          timestamp?: string;
        }>(
          `/api/orders/${orderId}/payment`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        if (response.success && response.data) {
          console.log('Payment details loaded:', response.data);
          setPaymentData(response.data);
        } else {
          setPaymentData(null);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch payment details:', error);
      // Don't show alert, just set to null if no payment data exists
      setPaymentData(null);
    } finally {
      setLoadingPaymentDetails(false);
    }
  }

  async function recordPayment(orderId: string, amount: number, notes: string) {
    try {
      setLoadingPayment(true);
      if (accessToken) {
        const response = await apiClient.request<{ success: boolean; message: string; data: any }>(
          '/api/seller/payments/record-cash',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              amount,
              notes: notes.trim() || undefined
            })
          }
        );

        if (response.success) {
          // Refresh payment details
          await fetchPaymentDetails(orderId);
          
          // Refresh orders list
          const ordersResponse = await apiClient.request<{ success: boolean; data: any[] }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
            setOrders(ordersResponse.data);
            // Update selected order if it's the same
            if (selectedOrder && selectedOrder.id === orderId) {
              const updatedOrder = ordersResponse.data.find((o: any) => o.id === orderId);
              if (updatedOrder) {
                setSelectedOrder(updatedOrder);
              }
            }
          }
          
          // Close modal and reset form
          setShowPaymentModal(false);
          setPaymentAmount("");
          setPaymentNotes("");
          
          alert('Payment recorded successfully!');
        }
      }
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      alert(error?.data?.message || 'Failed to record payment. Please try again.');
    } finally {
      setLoadingPayment(false);
    }
  }

  async function shipOrder(orderId: string, estimatedDelivery?: string) {
    try {
      setLoadingOrderId(orderId);
      if (accessToken) {
        const payload: any = { status: "SHIPPED" };
        if (estimatedDelivery) {
          payload.estimatedDeliveryDate = estimatedDelivery;
        }

        const response = await apiClient.request<{ success: boolean; message: string; data: any }>(
          `/api/seller/orders/${orderId}/fulfillment`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          }
        );

        if (response.success) {
          // Refresh orders list
          const ordersResponse = await apiClient.request<{ success: boolean; data: any[] }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
            setOrders(ordersResponse.data);
            // Update selected order if it's the same
            if (selectedOrder && selectedOrder.id === orderId) {
              const updatedOrder = ordersResponse.data.find((o: any) => o.id === orderId);
              if (updatedOrder) {
                setSelectedOrder(updatedOrder);
              }
            }
          }
          setEstimatedDeliveryDate("");
          alert('Order marked as shipped successfully!');
        }
      }
    } catch (error: any) {
      console.error('Failed to ship order:', error);
      alert(error?.data?.message || 'Failed to ship order. Please try again.');
    } finally {
      setLoadingOrderId(null);
    }
  }

  async function markAsDelivered(orderId: string) {
    try {
      setLoadingOrderId(orderId);
      if (accessToken) {
        const response = await apiClient.request<{ success: boolean; message: string; data: any }>(
          `/api/seller/orders/${orderId}/fulfillment`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: "DELIVERED" })
          }
        );

        if (response.success) {
          // Refresh orders list
          const ordersResponse = await apiClient.request<{ success: boolean; data: any[] }>(
            '/api/seller/orders',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
            setOrders(ordersResponse.data);
            // Update selected order if it's the same
            if (selectedOrder && selectedOrder.id === orderId) {
              const updatedOrder = ordersResponse.data.find((o: any) => o.id === orderId);
              if (updatedOrder) {
                setSelectedOrder(updatedOrder);
              }
            }
          }
          alert('Order marked as delivered successfully!');
        }
      }
    } catch (error: any) {
      console.error('Failed to mark order as delivered:', error);
      alert(error?.data?.message || 'Failed to mark order as delivered. Please try again.');
    } finally {
      setLoadingOrderId(null);
    }
  }

  // Fetch payment details ONLY when user clicks on an order to view details
  useEffect(() => {
    if (isModalOpen && selectedOrder && accessToken) {
      // Only fetch payment data when modal opens (user clicked on order)
        fetchPaymentDetails(selectedOrder.id);
    } else if (!isModalOpen) {
      // Clear payment data when modal closes
      setPaymentData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, selectedOrder?.id, accessToken]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Clean Header Section - Metis Style */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                Orders
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage and track all your customer orders
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Clean Filters Section */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="AWAITING_SELLER_ACCEPTANCE">Awaiting Seller Acceptance</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SELLER_REJECTED">Seller Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List View */}
        <div className="bg-white border border-gray-200 shadow-sm">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-3">No orders found</div>
              <div className="text-gray-600 mb-8 max-w-md mx-auto">
                {query || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't received any orders yet."
                }
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">#{order.orderNumber || order.id}</div>
                        {order.poNumber && (
                          <div className="text-xs text-gray-500">PO: {order.poNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${order.totalAmount?.toFixed(2) || order.subtotal?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">{order.currency || 'USD'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)} {formatStatus(order.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {order.paymentStatus && (
                          <Badge className={order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'}>
                            {order.paymentStatus}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
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
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
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
                                disabled={acceptingOrderId === order.id || rejectingOrderId === order.id}
                                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs disabled:opacity-50"
                              >
                                {acceptingOrderId === order.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                                  setOrderToReject(order.id);
                                  setShowRejectModal(true);
                                }}
                                disabled={acceptingOrderId === order.id || rejectingOrderId === order.id}
                                className="h-8 px-3 text-xs disabled:opacity-50"
                              >
                                {rejectingOrderId === order.id ? (
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
                          
                          {/* Status dropdown for other statuses - SHIPPED/DELIVERED HIDDEN FOR NOW */}
                          {!['CANCELLED', 'DELIVERED', 'REJECTED', 'SELLER_REJECTED', 'AWAITING_SELLER_ACCEPTANCE', 'PENDING_PAYMENT', 'SHIPPED'].includes(order.status?.toUpperCase() || '') && (
                            <select
                              value={order.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={loadingOrderId === order.id}
                              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="PROCESSING">Processing</option>
                              {/* <option value="SHIPPED">Shipped</option> */}
                              {/* <option value="DELIVERED">Delivered</option> */}
                            </select>
                          )}
                          {loadingOrderId === order.id && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Order Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
                </DialogHeader>
                {selectedOrder && (
                  <div className="space-y-6 mt-4">
                    {/* Order Header */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Order Number</div>
                        <div className="text-lg font-semibold text-gray-900">#{selectedOrder.orderNumber || selectedOrder.id}</div>
                        {selectedOrder.poNumber && (
                          <div className="text-sm text-gray-600 mt-1">PO: {selectedOrder.poNumber}</div>
                        )}
                      </div>
                      <div className="flex justify-end items-start">
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {getStatusIcon(selectedOrder.status)} {formatStatus(selectedOrder.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Shipping Address - HIDDEN */}
                    {/* {selectedOrder.shippingAddress && (
                      <div className="pb-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipping Address</h3>
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{selectedOrder.shippingAddress.fullName}</div>
                          <div>{selectedOrder.shippingAddress.addressLine1}</div>
                          {selectedOrder.shippingAddress.addressLine2 && (
                            <div>{selectedOrder.shippingAddress.addressLine2}</div>
                          )}
                          <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}</div>
                        </div>
                      </div>
                    )} */}

                    {/* Order Summary */}
                    <div className="pb-4 border-b">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                        <div className="space-y-2">
                        {selectedOrder.subtotal !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900">${selectedOrder.subtotal.toFixed(2)}</span>
                          </div>
                        )}
                        {selectedOrder.shippingCost !== undefined && selectedOrder.shippingCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-gray-900">${selectedOrder.shippingCost.toFixed(2)}</span>
                          </div>
                        )}
                        {selectedOrder.platformCommission !== undefined && selectedOrder.platformCommission > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Platform Fee:</span>
                            <span className="text-gray-900">${selectedOrder.platformCommission.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t font-semibold text-base">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-blue-600">${selectedOrder.totalAmount?.toFixed(2) || selectedOrder.subtotal?.toFixed(2) || '0.00'} {selectedOrder.currency || 'USD'}</span>
                        </div>
                          </div>
                        </div>

                    {/* Payment & Status */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                        {selectedOrder.paymentStatus && (
                          <Badge className={selectedOrder.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'}>
                            {selectedOrder.paymentStatus}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Date Created</div>
                        <div className="text-sm text-gray-900">{formatDateWithTime(selectedOrder.createdAt)}</div>
                      </div>
                    </div>

                    {/* Payment Section - Show for all orders */}
                      <div className="pb-4 border-b">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-700">Payment Information</h3>
                          {/* Only show Record Payment button for AWAITING_PAYMENT status */}
                          {selectedOrder.status?.toUpperCase() === 'AWAITING_PAYMENT' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setShowPaymentModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Record Payment
                            </Button>
                          )}
                        </div>

                        {loadingPaymentDetails ? (
                          <div className="flex items-center justify-center gap-2 py-8">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500">Loading payment details...</span>
                          </div>
                        ) : paymentData ? (
                        <div className="space-y-4">
                          {/* Payment Summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Total Amount:</span>
                                  <span className="ml-2 font-semibold text-gray-900">
                                  ${(paymentData.payment?.totalToBePaid || paymentData.order?.totalAmount || selectedOrder.totalAmount || 0).toFixed(2)} {paymentData.order?.currency || selectedOrder.currency || 'USD'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Amount Paid:</span>
                                  <span className="ml-2 font-semibold text-green-600">
                                  ${(paymentData.payment?.paid || 0).toFixed(2)} {paymentData.order?.currency || selectedOrder.currency || 'USD'}
                                  </span>
                                </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-600">Remaining Balance:</span>
                                <span className={`ml-2 font-semibold ${(paymentData.payment?.remaining || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  ${(paymentData.payment?.remaining || 0).toFixed(2)} {paymentData.order?.currency || selectedOrder.currency || 'USD'}
                                    </span>
                                  </div>
                              <div className="col-span-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-4">
                                  {paymentData.payment?.isFullyPaid && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      ✓ Fully Paid
                                    </Badge>
                                  )}
                                  {paymentData.payment?.isPartiallyPaid && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                      ⚠ Partially Paid
                                    </Badge>
                                  )}
                                  {paymentData.payment?.hasNoPayment && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200">
                                      ✗ No Payment
                                    </Badge>
                                  )}
                                  {paymentData.paymentDetails?.paymentMethod && (
                                    <span className="text-xs text-gray-600">
                                      Method: {paymentData.paymentDetails.paymentMethod}
                                    </span>
                                  )}
                                </div>
                              </div>
                              </div>
                            </div>

                          {/* Payment Details */}
                          {paymentData.paymentDetails && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <h4 className="text-xs font-semibold text-blue-800 mb-2">Payment Details</h4>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <span className="text-blue-700">Status:</span>
                                  <span className="ml-2 font-medium text-blue-900">{paymentData.paymentDetails.status}</span>
                                </div>
                                {paymentData.paymentDetails.paidAt && (
                                  <div>
                                    <span className="text-blue-700">Paid At:</span>
                                    <span className="ml-2 font-medium text-blue-900">{formatDateWithTime(paymentData.paymentDetails.paidAt)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                            {/* Payment History */}
                          {paymentData.paymentHistory && paymentData.paymentHistory.length > 0 && (
                              <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-3">Payment History</h4>
                                <div className="space-y-2">
                                {paymentData.paymentHistory.map((payment: any, index: number) => (
                                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                      <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-900">
                                            ${payment.amount?.toFixed(2)} {paymentData.order?.currency || 'USD'}
                                          </span>
                                          {index === 0 && (
                                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                              Latest
                                            </Badge>
                                          )}
                                          </div>
                                          {payment.notes && (
                                            <div className="text-xs text-gray-600 mt-1">{payment.notes}</div>
                                          )}
                                        {payment.recordedBy && (
                                          <div className="text-xs text-gray-500 mt-1">Recorded by: {payment.recordedBy}</div>
                                        )}
                                        </div>
                                      <div className="text-xs text-gray-500 text-right">
                                          {payment.date ? formatDateWithTime(payment.date) : 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                            {selectedOrder.status?.toUpperCase() === 'AWAITING_PAYMENT' 
                              ? 'No payments recorded yet. Click "Record Payment" to add a payment.'
                            : 'No payment history available for this order.'}
                          </div>
                        )}
                      </div>

                    {/* Shipping & Delivery Actions - HIDDEN FOR NOW */}
                    {/* {selectedOrder.status?.toUpperCase() === 'PROCESSING' && (
                      <div className="pb-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipping</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Estimated Delivery Date (Optional)
                            </label>
                            <Input
                              type="date"
                              value={estimatedDeliveryDate}
                              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave blank to use default (7 days from now)
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              shipOrder(selectedOrder.id, estimatedDeliveryDate || undefined);
                            }}
                            disabled={loadingOrderId === selectedOrder.id}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                          >
                            {loadingOrderId === selectedOrder.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Shipping...
                              </div>
                            ) : (
                              <>📦 Ship Order</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )} */}

                    {/* Mark as Delivered - HIDDEN FOR NOW */}
                    {/* {(selectedOrder.status?.toUpperCase() === 'SHIPPED' || selectedOrder.status?.toUpperCase() === 'DELIVERED') && (
                      <div className="pb-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery</h3>
                        {selectedOrder.status?.toUpperCase() === 'DELIVERED' ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <span className="text-sm font-medium text-green-800">Order Delivered</span>
                            </div>
                            {selectedOrder.actualDeliveryDate && (
                              <p className="text-xs text-green-700 mt-2">
                                Delivered on: {formatDateWithTime(selectedOrder.actualDeliveryDate)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="mark-delivered"
                                checked={false}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    markAsDelivered(selectedOrder.id);
                                  }
                                }}
                                disabled={loadingOrderId === selectedOrder.id}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                              />
                              <label htmlFor="mark-delivered" className="text-sm text-gray-700 cursor-pointer">
                                Mark as Delivered
                              </label>
                              {loadingOrderId === selectedOrder.id && (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                            {selectedOrder.estimatedDeliveryDate && (
                              <p className="text-xs text-gray-500 mt-2">
                                Estimated delivery: {formatDateWithTime(selectedOrder.estimatedDeliveryDate)}
                              </p>
                            )}
                            {selectedOrder.trackingNumber && (
                              <p className="text-xs text-gray-500 mt-2">
                                Tracking Number: <span className="font-medium">{selectedOrder.trackingNumber}</span>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )} */}

                    {/* Rejection Details */}
                    {selectedOrder.status?.toUpperCase() === 'REJECTED' && selectedOrder.rejectionReason && (
                      <div className="pb-4 border-b border-orange-200">
                        <h3 className="text-sm font-semibold text-orange-700 mb-2">Rejection Details</h3>
                        <div className="text-sm text-gray-900">{selectedOrder.rejectionReason}</div>
                        {selectedOrder.sellerRejectedAt && (
                          <div className="text-xs text-gray-600 mt-1">
                            Rejected on: {formatDateWithTime(selectedOrder.sellerRejectedAt)}
                          </div>
                        )}
                              </div>
                            )}

                    {/* Accept/Reject Actions for orders awaiting seller acceptance */}
                    {(selectedOrder.status?.toUpperCase() === 'AWAITING_SELLER_ACCEPTANCE' || selectedOrder.status?.toUpperCase() === 'PENDING_PAYMENT') && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Actions</h3>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              acceptOrder(selectedOrder.id);
                              setIsModalOpen(false);
                            }}
                            disabled={acceptingOrderId === selectedOrder.id || rejectingOrderId === selectedOrder.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          >
                            {acceptingOrderId === selectedOrder.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Accepting...
                              </div>
                            ) : (
                              <>✅ Accept Order</>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setIsModalOpen(false);
                              setOrderToReject(selectedOrder.id);
                              setShowRejectModal(true);
                            }}
                            disabled={acceptingOrderId === selectedOrder.id || rejectingOrderId === selectedOrder.id}
                            className="flex-1 disabled:opacity-50"
                          >
                            {rejectingOrderId === selectedOrder.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Rejecting...
                              </div>
                            ) : (
                              <>❌ Reject Order</>
                            )}
                          </Button>
                        </div>
                          </div>
                        )}

                    {/* Status Update for other statuses - SHIPPED/DELIVERED HIDDEN FOR NOW */}
                    {!['CANCELLED', 'DELIVERED', 'REJECTED', 'SELLER_REJECTED', 'AWAITING_SELLER_ACCEPTANCE', 'PENDING_PAYMENT', 'SHIPPED'].includes(selectedOrder.status?.toUpperCase() || '') && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
                            <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            updateOrderStatus(selectedOrder.id, e.target.value);
                            setIsModalOpen(false);
                          }}
                          disabled={loadingOrderId === selectedOrder.id}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="PROCESSING">⚙️ Processing</option>
                          {/* <option value="SHIPPED">📦 Shipped</option> */}
                          {/* <option value="DELIVERED">✅ Delivered</option> */}
                            </select>
                        {loadingOrderId === selectedOrder.id && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Updating status...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
          </Dialog>

          {/* Reject Order Modal */}
          <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Reject Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejecting this order..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This reason will be sent to the buyer.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectReason("");
                        setOrderToReject(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (orderToReject) {
                          rejectOrder(orderToReject, rejectReason);
                        }
                      }}
                      disabled={!rejectReason.trim() || !!rejectingOrderId}
                    >
                      {rejectingOrderId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Rejecting...
                        </div>
                      ) : (
                        'Reject Order'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
          </Dialog>

          {/* Record Payment Modal */}
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {selectedOrder && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-600 mb-1">Order Total</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${selectedOrder.totalAmount?.toFixed(2) || selectedOrder.subtotal?.toFixed(2) || '0.00'}
                    </div>
                    {paymentData && (paymentData.data?.totalPaid > 0 || paymentData.totalPaid > 0) && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span>Already Paid: ${(paymentData.data?.totalPaid || paymentData.totalPaid || 0).toFixed(2)}</span>
                        {(paymentData.data?.remainingBalance > 0 || paymentData.remainingBalance > 0) && (
                          <span className="ml-2 text-orange-600">
                            Remaining: ${(paymentData.data?.remainingBalance || paymentData.remainingBalance || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the amount being paid (partial or full payment).
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Add any notes about this payment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentAmount("");
                      setPaymentNotes("");
                    }}
                    disabled={loadingPayment}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedOrder && paymentAmount && parseFloat(paymentAmount) > 0) {
                        recordPayment(selectedOrder.id, parseFloat(paymentAmount), paymentNotes);
                      }
                    }}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || loadingPayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loadingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Recording...
                      </div>
                    ) : (
                      'Record Payment'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}
