// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function B2BOrdersPage() {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partName || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in at least the part name and quantity",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/b2b/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partName,
          partNumber,
          category,
          quantity,
          specifications,
          deliveryDeadline,
          specialRequirements
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "B2B Order Created",
          description: "Your order has been posted to the marketplace. Sellers can now submit bids.",
          variant: "default",
        });

        // Reset form
        setPartName('');
        setPartNumber('');
        setCategory('');
        setQuantity('');
        setSpecifications('');
        setDeliveryDeadline('');
        setSpecialRequirements('');

        // Redirect to order details or marketplace
        router.push(`/b2b-orders/${data.order.id}`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create B2B order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating B2B order:', error);
      toast({
        title: "Error",
        description: "Failed to create B2B order",
        variant: "destructive",
      });
    }
    setLoading(false);
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
          <h1 className="text-3xl font-bold luxury-gradient-text mb-4">B2B Orders</h1>
          <p className="text-slate-600 mb-8 text-lg">Please complete your store setup to create B2B orders.</p>
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
              <div className="max-w-6xl mx-auto">
                {/* Premium Header */}
                <div className="premium-card p-8 border border-purple-200/50 shadow-2xl mb-10 relative overflow-hidden group">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-xl"></div>

                  <div className="relative">
                    <h1 className="text-4xl font-bold luxury-gradient-text mb-3">Create B2B Order</h1>
                    <p className="text-slate-600 text-lg font-medium">Post your parts requirements and receive competitive bids from verified sellers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Order Form */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Part Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Part Information</h3>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Part Name *
                              </label>
                              <Input
                                value={partName}
                                onChange={(e) => setPartName(e.target.value)}
                                placeholder="e.g., Brake Pad Set, Engine Oil Filter"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Part Number
                                </label>
                                <Input
                                  value={partNumber}
                                  onChange={(e) => setPartNumber(e.target.value)}
                                  placeholder="e.g., BP-001, EOF-123"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Category
                                </label>
                                <Input
                                  value={category}
                                  onChange={(e) => setCategory(e.target.value)}
                                  placeholder="e.g., Brakes, Engine, Suspension"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity *
                              </label>
                              <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Number of units required"
                                required
                              />
                            </div>
                          </div>

                          {/* Specifications */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Specifications</h3>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Technical Specifications
                              </label>
                              <Textarea
                                value={specifications}
                                onChange={(e) => setSpecifications(e.target.value)}
                                placeholder="Detailed specifications, dimensions, quality requirements, etc."
                                rows={4}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Delivery Deadline
                                </label>
                                <Input
                                  type="date"
                                  value={deliveryDeadline}
                                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Requirements
                              </label>
                              <Textarea
                                value={specialRequirements}
                                onChange={(e) => setSpecialRequirements(e.target.value)}
                                placeholder="Any special delivery requirements, certifications, packaging needs, etc."
                                rows={3}
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? 'Creating Order...' : 'Post B2B Order'}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Information Panel */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>How B2B Orders Work</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Post Your Requirements</h4>
                            <p className="text-sm text-gray-600">Specify the parts you need with detailed specifications</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Sellers Claim Orders</h4>
                            <p className="text-sm text-gray-600">First seller to claim gets the order (first-come-first-served)</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Contact & Deliver</h4>
                            <p className="text-sm text-gray-600">Contact buyer and arrange delivery</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-sm">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Complete Transaction</h4>
                            <p className="text-sm text-gray-600">Mark order as completed after delivery</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Benefits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Fast order fulfillment (first-come-first-served)
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified sellers only
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Direct seller communication
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Real-time order tracking
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
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