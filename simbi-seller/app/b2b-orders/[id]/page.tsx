// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUSD } from '@/lib/currency';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface B2BOrder {
  id: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  partName: string;
  partNumber?: string;
  category?: string;
  quantity: number;
  specifications?: string;
  deliveryDeadline?: Date;
  specialRequirements?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  totalBids: number;
  lowestBid?: number;
  winningBidId?: string;
}

export default function B2BOrderDetailPage({ params }: { params: { id: string } }) {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [order, setOrder] = useState<B2BOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrderDetails();
    }
  }, [user, params.id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/b2b/orders/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const cancelOrder = async () => {
    try {
      const response = await fetch(`/api/b2b/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel_order'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Order Cancelled",
          description: "The order has been cancelled successfully",
          variant: "default",
        });
        loadOrderDetails(); // Refresh the data
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col">
              <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="bg-white rounded-lg p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!order) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col">
              <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                    <p className="text-gray-600 mb-4">The requested B2B order could not be found.</p>
                    <a href="/b2b-orders" className="text-blue-600 hover:text-blue-500 font-medium">
                      ← Back to B2B Orders
                    </a>
                  </div>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col">
            <main className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <a href="/b2b-orders" className="text-blue-600 hover:text-blue-500 font-medium">
                      ← Back to Orders
                    </a>
                    <Badge variant={order.status === 'pending' ? 'default' : order.status === 'active' ? 'secondary' : 'outline'}>
                      {order.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{order.partName}</h1>
                  <p className="text-gray-600">Order #{order.id.substring(0, 8)}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Quantity:</span>
                          <p>{order.quantity}</p>
                        </div>
                        {order.partNumber && (
                          <div>
                            <span className="font-medium text-gray-700">Part Number:</span>
                            <p>{order.partNumber}</p>
                          </div>
                        )}
                        {order.category && (
                          <div>
                            <span className="font-medium text-gray-700">Category:</span>
                            <p>{order.category}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Posted:</span>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {order.specifications && (
                        <div>
                          <span className="font-medium text-gray-700 block mb-2">Specifications:</span>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.specifications}</p>
                        </div>
                      )}

                      {order.specialRequirements && (
                        <div>
                          <span className="font-medium text-gray-700 block mb-2">Special Requirements:</span>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.specialRequirements}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        {order.status === 'pending' && (
                          <Button
                            onClick={cancelOrder}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">First-Come-First-Served</h3>
                        <p className="text-gray-500 mb-4">Sellers can claim this order immediately. The first seller to claim gets it!</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>How it works:</strong> Sellers browse available orders and click "Claim Order" to immediately secure the job.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}