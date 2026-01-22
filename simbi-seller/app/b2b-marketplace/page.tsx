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

export default function B2BMarketplacePage() {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile?.storeName) {
      loadAvailableOrders();
    }
  }, [user, profile]);

  const loadAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/b2b/orders?sellerId=${user?.uid}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        toast({
          title: "Error",
          description: "Failed to load B2B orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load B2B orders",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const claimOrder = async (order: B2BOrder) => {
    setClaimingOrderId(order.id);
    try {
      const response = await fetch(`/api/b2b/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'claim_order'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Order Claimed!",
          description: `You have successfully claimed the order for ${order.partName}. Contact the buyer to arrange delivery.`,
          variant: "default",
        });
        loadAvailableOrders(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to claim order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error claiming order:', error);
      toast({
        title: "Error",
        description: "Failed to claim order",
        variant: "destructive",
      });
    }
    setClaimingOrderId(null);
  };

  if (!user || !profile?.storeName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Luxury background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl animate-luxury-float"></div>
          <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-luxury-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="text-center max-w-md mx-auto">
          <div className="h-20 w-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold luxury-gradient-text mb-4">B2B Marketplace</h1>
          <p className="text-slate-600 mb-8 text-lg">Please complete your store setup to access the B2B marketplace.</p>
          <a href="/onboard" className="luxury-button text-white px-8 py-3 inline-flex items-center gap-2">
            Complete Store Setup
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 relative">
        {/* Luxury background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <AppSidebar />
        <SidebarInset className="flex-1 relative">
          <div className="flex flex-col">
            <main className="flex-1 p-8 relative">
              <div className="max-w-7xl mx-auto">
                {/* Premium Header */}
                <div className="premium-card p-8 border border-purple-200/50 shadow-2xl mb-10 relative overflow-hidden group">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-xl"></div>

                  <div className="relative">
                    <h1 className="text-4xl font-bold luxury-gradient-text mb-3">B2B Marketplace</h1>
                    <p className="text-slate-600 text-lg font-medium">B2B orders - First come, first served!</p>
                  </div>
                </div>

                {/* Premium Orders List */}
                <div className="space-y-6">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="premium-card p-8 animate-luxury-fade-in-up">
                          <div className="h-6 bg-gradient-to-r from-purple-200/50 to-blue-200/50 rounded-xl w-3/4 mb-4 animate-luxury-shimmer"></div>
                          <div className="h-4 bg-gradient-to-r from-slate-200/50 to-slate-300/50 rounded-lg w-1/2 mb-6"></div>
                          <div className="space-y-3">
                            <div className="h-4 bg-gradient-to-r from-slate-200/50 to-slate-300/50 rounded-lg animate-luxury-pulse"></div>
                            <div className="h-4 bg-gradient-to-r from-slate-200/50 to-slate-300/50 rounded-lg w-2/3 animate-luxury-pulse" style={{ animationDelay: '0.1s' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">No Premium B2B Orders Available</h3>
                      <p className="text-slate-600 text-lg">Check back later for new exclusive B2B opportunities from our premium network.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {orders.map((order) => (
                        <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{order.partName}</CardTitle>
                                <p className="text-sm text-gray-500">by {order.buyerName}</p>
                              </div>
                              <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{order.quantity}</span>
                              </div>
                              {order.partNumber && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Part Number:</span>
                                  <span className="font-medium">{order.partNumber}</span>
                                </div>
                              )}
                              {order.category && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Category:</span>
                                  <span className="font-medium">{order.category}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Posted:</span>
                                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {order.specifications && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Specifications:</p>
                                <p className="text-sm text-gray-600">{order.specifications}</p>
                              </div>
                            )}

                            {order.specialRequirements && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                                <p className="text-sm text-gray-600">{order.specialRequirements}</p>
                              </div>
                            )}

                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => claimOrder(order)}
                              disabled={claimingOrderId === order.id || order.status !== 'pending'}
                            >
                              {claimingOrderId === order.id ? 'Claiming...' : 'Claim Order'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}