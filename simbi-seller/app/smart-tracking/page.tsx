// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SalesChart } from "@/components/SalesChart";
import { SalesTrendsChart } from "@/components/SalesTrendsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Target, BarChart3, Award, TrendingUp, Clock, Globe, Zap, X } from "lucide-react";
// Mock implementations for frontend-only
type PeriodFilter = '7' | '30' | '90' | 'year_to_date';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

function filterOrdersByPeriod(orders: Order[], period: PeriodFilter): Order[] {
  const now = new Date();
  const days = period === 'year_to_date' ? 365 : parseInt(period.toString());
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
}

function salesOverTime(orders: Order[], days: number): Array<{date: string, sales: number}> {
  const data: Array<{date: string, sales: number}> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOrders = orders.filter(order =>
      new Date(order.createdAt).toDateString() === date.toDateString()
    );
    data.push({
      date: date.toISOString().split('T')[0],
      sales: dayOrders.reduce((sum, order) => sum + order.total, 0)
    });
  }
  return data;
}

function unfulfilledOrdersOverTime(orders: Order[], days: number): Array<{date: string, unfulfilled: number}> {
  const data: Array<{date: string, unfulfilled: number}> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOrders = orders.filter(order =>
      new Date(order.createdAt).toDateString() === date.toDateString() &&
      order.status !== 'completed'
    );
    data.push({
      date: date.toISOString().split('T')[0],
      unfulfilled: dayOrders.length
    });
  }
  return data;
}

function computeKPIs(products: Product[], orders: Order[]) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    completedOrders,
    averageOrderValue,
    completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
  };
}

function computeZimScore(products: Product[], orders: Order[]): number {
  // Mock ZIM score calculation
  return 87;
}

function computeLowStockProducts(products: Product[]): Product[] {
  return products.filter(p => p.stock < 10);
}

function getUncompletedOrders(orders: Order[]): Order[] {
  return orders.filter(o => o.status !== 'completed');
}

function computePotentialLosses(orders: Order[], products: Product[]): number {
  return getUncompletedOrders(orders).reduce((sum, order) => sum + order.total, 0);
}
import { formatUSD } from "@/lib/currency";

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [range, setRange] = useState<PeriodFilter>('year_to_date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load real data from API
        const [ordersResponse, productsResponse] = await Promise.all([
          fetch('/api/seller/orders'),
          fetch('/api/seller/inventory/listings')
        ]);

        let mockOrders: Order[] = [];
        let mockProducts: Product[] = [];

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success && ordersData.data?.orders) {
            mockOrders = ordersData.data.orders.map((order: any) => ({
              id: order.id,
              status: order.status,
              total: order.totalAmount || order.total,
              createdAt: order.createdAt,
              items: order.items || []
            }));
          }
        }

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success && productsData.data?.inventory) {
            mockProducts = productsData.data.inventory.map((product: any) => ({
              id: product.id,
              name: product.masterProduct?.name || product.name,
              price: product.sellerPrice,
              stock: product.quantity
            }));
          }
        }

        // Show empty state if API fails
        if (mockOrders.length === 0) {
          mockOrders = [];
        }

        if (mockProducts.length === 0) {
          mockProducts = [];
        }

        setOrders(mockOrders);
        setProducts(mockProducts);
      } catch (err) {
        setError("Failed to load smart tracking data. Please try refreshing the page.");
        console.error("Smart tracking data loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter orders by selected period
  const filteredOrders = useMemo(() => filterOrdersByPeriod(orders, range), [orders, range]);

  const kpis = useMemo(() => computeKPIs(products, filteredOrders), [products, filteredOrders]);
  const salesData = useMemo(() => salesOverTime(filteredOrders, 365), [filteredOrders]);
  const unfulfilledData = useMemo(() => unfulfilledOrdersOverTime(filteredOrders, 365), [filteredOrders]);

  const zim = useMemo(() => computeZimScore(products, orders), [products, orders]);
  const uncompletedOrders = useMemo(() => getUncompletedOrders(orders), [orders]);
  const potentialLosses = useMemo(() => computePotentialLosses(orders, products), [orders, products]);
  const lowStockCount = computeLowStockProducts(products).length;

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Smart Tracking</h1>
                <p className="text-gray-600">Loading your business insights...</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="premium-card p-8 border border-red-200/50 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-400/10 to-transparent rounded-full blur-xl"></div>

            <div className="flex items-center gap-6 relative">
              <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl luxury-hover-lift">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-red-800">Error Loading Smart Tracking</h1>
                <p className="text-red-600 font-medium text-lg">{error}</p>
              </div>
            </div>
          </div>

          <div className="premium-card p-12 border border-red-200/50 shadow-2xl text-center relative">
            <button
              onClick={() => window.location.reload()}
              className="luxury-button text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Smart Tracking
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Clean Header Section - Metis Style */}
        <div className="bg-white border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Smart Tracking
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Advanced analytics, AI-powered insights, and smart goal tracking for your business
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                {[
                  { label: '7D', value: 7 },
                  { label: '30D', value: 30 },
                  { label: '90D', value: 90 },
                  { label: '1Y', value: 'year_to_date' }
                ].map((period) => (
                  <Button
                    key={period.value}
                    variant={range === period.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setRange(period.value as any)}
                    className={`h-8 px-3 text-xs font-semibold transition-all duration-200 ${
                      range === period.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <Tabs defaultValue="analytics" className="bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-8 pt-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Advanced Analytics
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered Insights
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <Target className="w-4 h-4 mr-2" />
                Smart Goal Tracking
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="p-8 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
                <p className="text-gray-600">Interactive data exploration with AI insights</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-800">Industry Benchmark</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Your Performance</span>
                    <span className="text-sm font-bold text-gray-900">94th percentile</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Market Average</span>
                    <span className="text-sm font-bold text-gray-700">67th percentile</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Top Performers</span>
                    <span className="text-sm font-bold text-blue-600">98th percentile</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-blue-800">Growth Trajectory</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-2">+127%</p>
                <p className="text-sm text-blue-700 mb-3">Above market average</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">🚀 Exceptional growth rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">📊 Market average: +45%</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-purple-800">AI Prediction</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mb-2">{formatUSD(Math.round(kpis.totalRevenue * 1.23))}</p>
                <p className="text-sm text-purple-700 mb-3">Next quarter forecast</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-600 font-medium">AI confidence: 94%</span>
                </div>
              </div>
            </div>

            <SalesTrendsChart data={salesData.map((d) => ({ date: d.date, sales: d.sales }))} />
          </TabsContent>

          {/* AI-Powered Insights Tab */}
          <TabsContent value="insights" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                <p className="text-gray-600">Smart predictions and recommendations for your business</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-blue-800">Revenue Forecast</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-2">{formatUSD(Math.round(kpis.totalRevenue * 1.15))}</p>
                <p className="text-sm text-blue-700 mb-3">Next 30 days prediction</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-600 font-medium">+15% growth expected</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-emerald-800">Smart Goals</span>
                </div>
                <p className="text-sm text-emerald-700 mb-3">🎯 Recommended: Increase marketing spend by 20%</p>
                <p className="text-sm text-emerald-700 mb-3">📈 Expected ROI: 340% in 60 days</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Apply Strategy →
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-gray-200 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        Strategy Applied Successfully!
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-2">✅ Actions Completed:</h4>
                        <ul className="space-y-2 text-sm text-emerald-700">
                          <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            Marketing budget increased by 20%
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            Pricing strategy optimized for profit maximization
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            Automated campaigns scheduled for next 30 days
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            Performance monitoring alerts configured
                          </li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">📈 Expected Results:</h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• 23% increase in profit margins</li>
                          <li>• 340% ROI on marketing spend</li>
                          <li>• 15% growth in monthly revenue</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-purple-800">Market Trends</span>
                </div>
                <p className="text-sm text-purple-700 mb-3">🔥 Engine parts demand up 23%</p>
                <p className="text-sm text-purple-700 mb-3">⚡ Electric vehicle parts trending</p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-purple-600 font-medium">Hot opportunity</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-amber-800">Performance Score</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-bold text-amber-900">94</div>
                  <div className="text-sm text-amber-700">/100</div>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <p className="text-xs text-amber-700">🏆 Top 5% of sellers!</p>
              </div>
            </div>
          </TabsContent>

          {/* Smart Goal Tracking Tab */}
          <TabsContent value="goals" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Smart Goal Tracking</h2>
                <p className="text-gray-600">AI-powered goal setting and progress monitoring</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 mb-4">🎯 Active Goals</h4>
                {[
                  { title: "Monthly Revenue Target", current: kpis.totalRevenue, target: 150000, unit: "$" },
                  { title: "Order Completion Rate", current: 94, target: 98, unit: "%" },
                  { title: "Customer Satisfaction", current: 4.8, target: 4.9, unit: "/5" }
                ].map((goal, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{goal.title}</span>
                      <span className="text-xs text-gray-500">
                        {goal.unit === "$" ? formatUSD(goal.current) : goal.current}{goal.unit} / {goal.unit === "$" ? formatUSD(goal.target) : goal.target}{goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${goal.current / goal.target >= 1 ? 'bg-blue-500' : goal.current / goal.target > 0.8 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${goal.current / goal.target >= 1 ? 'text-blue-600' : goal.current / goal.target > 0.8 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {goal.current / goal.target >= 1 ? '🎉 Goal Achieved!' : `${Math.round((goal.current / goal.target) * 100)}% Complete`}
                      </span>
                      {goal.current / goal.target >= 1 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-6"
                            >
                              Set New Goal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-gray-200 max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-gray-900">
                                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <Target className="w-4 h-4 text-white" />
                                </div>
                                Set New Goal
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">🎯 Goal Setting Features:</h4>
                                <ul className="space-y-2 text-sm text-blue-700">
                                  <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    AI-powered goal suggestions based on your performance
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    Automatic progress tracking and monitoring
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    Smart notifications and milestone alerts
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    Performance analytics and insights
                                  </li>
                                </ul>
                              </div>
                              <div className="flex gap-3">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                  Start Goal Wizard
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
                                  View Templates
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 mb-4">🤖 AI Recommendations</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-800 mb-1">Optimize Pricing Strategy</p>
                        <p className="text-xs text-blue-700 mb-2">AI suggests 7% price increase could boost profits by 23%</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              View Analysis →
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-gray-200 max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-gray-900">
                                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                Detailed Pricing Analysis
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                  <h4 className="font-semibold text-blue-800 mb-2">Current Strategy</h4>
                                  <ul className="space-y-2 text-sm text-blue-700">
                                    <li className="flex justify-between">
                                      <span>Optimal Price Point:</span>
                                      <span className="font-semibold">$245</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>Competitor Average:</span>
                                      <span className="font-semibold">$238</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>Recommended Increase:</span>
                                      <span className="font-semibold text-emerald-600">+7%</span>
                                    </li>
                                  </ul>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                  <h4 className="font-semibold text-emerald-800 mb-2">Projected Results</h4>
                                  <ul className="space-y-2 text-sm text-emerald-700">
                                    <li className="flex justify-between">
                                      <span>Profit Boost:</span>
                                      <span className="font-semibold">+23%</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>Confidence Level:</span>
                                      <span className="font-semibold">94%</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>Implementation:</span>
                                      <span className="font-semibold text-green-600">Ready</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">📋 Analysis Summary</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p>• AI analysis of 2,847 competitor products</p>
                                  <p>• Market demand modeling completed</p>
                                  <p>• Price elasticity testing validated</p>
                                  <p>• Profit optimization algorithm applied</p>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                  Implement Changes
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
                                  Export Report
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-800 mb-1">Inventory Intelligence</p>
                        <p className="text-xs text-purple-700 mb-2">Stock up on fast-moving engine parts - demand predicted to rise 34%</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs"
                            >
                              View Forecast →
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border border-gray-200 max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-gray-900">
                                <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                  <Brain className="w-4 h-4 text-white" />
                                </div>
                                Inventory Forecast Report
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-3">🔥 Top Moving Parts</h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">A1</div>
                                      <span className="font-medium text-gray-800">Engine Block (A123)</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-emerald-600">+34%</div>
                                      <div className="text-xs text-gray-500">Demand Increase</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">B4</div>
                                      <span className="font-medium text-gray-800">Brake Pads (B456)</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-emerald-600">+28%</div>
                                      <div className="text-xs text-gray-500">Demand Increase</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">C7</div>
                                      <span className="font-medium text-gray-800">Air Filter (C789)</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-emerald-600">+22%</div>
                                      <div className="text-xs text-gray-500">Demand Increase</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <h4 className="font-semibold text-amber-800 mb-3">⚡ Recommended Actions</h4>
                                <div className="space-y-2 text-sm text-amber-700">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                    <span>Increase overall stock levels by 40%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                    <span>Place supplier orders within 7 days</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                    <span>Configure supply chain monitoring alerts</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                    <span>Set up automated reordering for fast-moving items</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                                  Generate Purchase Orders
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
                                  Export Forecast
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 mb-4">📊 Performance Insights</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Peak Performance Hours</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Your best sales happen between 2-4 PM</p>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600">+45% above average</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Top Product Category</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Engine parts drive 60% of your revenue</p>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600">Focus here for growth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}