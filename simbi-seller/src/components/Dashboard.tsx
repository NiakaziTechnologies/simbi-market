// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, Clock, TrendingDown } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { SalesTrendsChart } from "@/components/SalesTrendsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddProductModal from "@/components/AddProductModal";
import OnboardingWizard from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { LowStockModal } from "@/components/LowStockModal";
import { EndOfDayReportModal } from "@/components/EndOfDayReportModal";
import { formatUSD } from "@/lib/currency";
import SalesSummaryWidget from "@/components/SalesSummaryWidget";
import { TopSellingProducts } from "@/components/TopSellingProducts";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { formatDateWithTime } from "@/lib/date";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export function Dashboard() {
  const [addOpen, setAddOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { seller, accessToken } = useSellerAuth();

  // Load dashboard data from comprehensive endpoint
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!accessToken) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch comprehensive dashboard data
        const comprehensiveData = await apiClient.request<{ 
          success: boolean; 
          message: string; 
          data?: {
            kpis?: {
              totalRevenue?: { title: string; value: number; description: string; unit: string };
              currentBalance?: { title: string; value: number; description: string; unit: string };
              totalProducts?: { title: string; value: number; description: string; unit: string };
              activeStaff?: { title: string; value: number; description: string; unit: string };
            };
            summary?: {
              currentBalance?: { title: string; value: number; description: string; unit: string };
              totalRevenue?: { title: string; value: number; description: string; unit: string };
              totalOrders?: { title: string; value: number; description: string; unit: string };
              inventoryItems?: { title: string; value: number; description: string; unit: string };
            };
            salesSummary?: {
              daily?: { title: string; period: string; value: number; description: string };
              weekly?: { title: string; period: string; value: number; description: string };
              monthly?: { title: string; period: string; value: number; description: string };
            };
            salesPerformanceAnalytics?: {
              title: string;
              subtitle: string;
              data?: Array<{ date: string; sales: number; unfulfilledOrders: number }>;
            };
            periodComparison?: {
              thisMonth?: { value: number; change: number; changeType: string; comparison: string };
              thisWeek?: { value: number; change: number; changeType: string; comparison: string };
            };
            topCategories?: Array<{ category: string; amount: number; percentage: number }> | null;
            topSellingProducts?: {
              title: string;
              subtitle: string;
              data?: Array<{
                inventoryId: string;
                productName: string;
                oemPartNumber: string;
                manufacturer: string;
                revenue: number;
                quantitySold: number;
                orderCount: number;
              }> | null;
              totalRevenue: number;
            };
            keyMetrics?: {
              orderFulfillment?: { value: number; unit: string; change: number; comparison: string };
              avgResponseTime?: { value: number; unit: string; change: number; comparison: string };
            };
          } 
        }>(
          '/api/seller/dashboard/comprehensive',
          {
            method: 'GET',
            // ✅ Token automatically attached by apiClient middleware
          }
        );

        console.log('Comprehensive dashboard response:', comprehensiveData);

        if (comprehensiveData.success && comprehensiveData.data) {
          setDashboardData(comprehensiveData.data);

          // Map salesPerformanceAnalytics.data to trendsData format for charts
          if (comprehensiveData.data.salesPerformanceAnalytics?.data) {
            const analyticsData = comprehensiveData.data.salesPerformanceAnalytics.data.map((item: any) => ({
              date: item.date,
              sales: item.sales || 0,
              revenue: item.sales || 0,
              orders: 0, // Not in comprehensive response
              unfulfilledOrders: item.unfulfilledOrders || 0,
              unfulfilled: item.unfulfilledOrders || 0
            }));
            setTrendsData(analyticsData);
          } else {
            setTrendsData([]);
          }
        } else {
          throw new Error(comprehensiveData.message || 'Failed to load dashboard data');
        }

      } catch (err) {
        console.error("Dashboard data loading error:", err);
        setError("Failed to load dashboard data. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [accessToken]);

  // Extract data from comprehensive API response
  const revenue = {
    today: dashboardData?.salesSummary?.daily?.value || 0,
    week: dashboardData?.salesSummary?.weekly?.value || 0, 
    month: dashboardData?.salesSummary?.monthly?.value || 0,
    year: dashboardData?.salesSummary?.monthly?.value || 0
  };
  
  // Parse orders from summary description (e.g., "12 pending" -> 12)
  const parsePendingOrders = (desc: string | undefined) => {
    if (!desc) return 0;
    const match = desc.match(/(\d+)\s*pending/i);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  const orders = {
    pending: parsePendingOrders(dashboardData?.summary?.totalOrders?.description),
    processing: 0,
    completed: (dashboardData?.summary?.totalOrders?.value || 0) - parsePendingOrders(dashboardData?.summary?.totalOrders?.description),
    total: dashboardData?.summary?.totalOrders?.value || 0
  };
  
  // Parse low stock from summary description (e.g., "5 low stock" -> 5)
  const parseLowStock = (desc: string | undefined) => {
    if (!desc) return 0;
    const match = desc.match(/(\d+)\s*low\s*stock/i);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  const inventory = {
    totalProducts: dashboardData?.summary?.inventoryItems?.value || dashboardData?.kpis?.totalProducts?.value || 0,
    lowStock: parseLowStock(dashboardData?.summary?.inventoryItems?.description),
    outOfStock: 0,
    totalValue: 0
  };
  const sriScore = 85; // Default score

  // Load recent orders
  useEffect(() => {
    const loadRecentOrders = async () => {
      if (!accessToken) return;

      try {
        setLoadingOrders(true);
        const response = await apiClient.request<{ success: boolean; data: any[]; pagination?: any }>(
          '/api/seller/orders',
          {
            method: 'GET',
          }
        );

        if (response.success && Array.isArray(response.data)) {
          // Get the 5 most recent orders
          const sortedOrders = response.data
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setRecentOrders(sortedOrders);
        }
      } catch (err) {
        console.error("Recent orders loading error:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadRecentOrders();
  }, [accessToken]);

  // Calculate derived metrics
  const lowStockCount = inventory.lowStock;
  const uncompletedOrders = orders.pending + orders.processing;
  const potentialLosses = {
    totalLosses: 0, // This would need to be calculated from uncompleted orders
    breakdown: [] as Array<{category: string, amount: number, count: number, percentage: number}>
  };

  // Mock end-of-day report for now (would come from API)
  const endOfDayReport = {
    summary: {
      uncompletedOrders: uncompletedOrders,
      potentialLosses: 0,
      criticalOrders: orders.pending > 5 ? orders.pending : 0
    }
  };

  // Enhanced Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="glass-card border-b border-white/20 shadow-sm -m-6 mb-6 p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-slate-600 font-medium">Loading your business insights...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card border-0 shadow-card p-6 animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2 animate-shimmer"></div>
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 animate-shimmer"></div>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl ml-4 animate-pulse-slow"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-shimmer" style={{ width: '60%' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card border-0 shadow-card p-6">
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4 animate-shimmer"></div>
              <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl animate-pulse-slow"></div>
            </div>
            <div className="glass-card border-0 shadow-card p-6">
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4 animate-shimmer"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded animate-shimmer"></div>
                <div className="h-4 bg-slate-200 rounded animate-shimmer w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="glass-card border-b border-red-100 shadow-sm -m-6 mb-6 p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-400 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Something's Not Right</h1>
              <div className="flex items-center gap-2">
                <p className="text-red-600 font-medium">{error}</p>
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-0 shadow-card text-center p-8">
            <div className="space-y-6">
              <div className="h-20 w-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Don't worry, we've got this!</h3>
                <p className="text-slate-600">
                  We're having trouble loading your dashboard data. This usually resolves quickly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    // Could trigger a diagnostic or support request
                    console.log('User requested help with dashboard error');
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Get Help
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  If this problem persists, please contact our support team. Error ID: {Date.now()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with ERP KPIs */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
             <p className="text-gray-600">Real-time business insights and performance metrics</p>
           </div>
           <div className="flex items-center gap-6">
             {/* Total Revenue */}
             <div className="text-center">
               <p className="text-sm font-medium text-gray-500 mb-1">{dashboardData?.kpis?.totalRevenue?.title || "Total Revenue"}</p>
               <p className="text-2xl font-bold text-[#3498DB]">
                 {formatUSD(dashboardData?.kpis?.totalRevenue?.value || 0)}
               </p>
               <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-4 h-4 text-green-500" />
                 <span className="text-xs text-green-600 font-medium">{dashboardData?.kpis?.totalRevenue?.description || "Live Data"}</span>
               </div>
             </div>

             {/* Current Balance */}
             <div className="h-12 w-px bg-gray-300"></div>
             <div className="text-center">
               <p className="text-sm font-medium text-gray-500 mb-1">{dashboardData?.kpis?.currentBalance?.title || "Current Balance"}</p>
               <p className="text-2xl font-bold text-[#2ECC71]">
                 {formatUSD(dashboardData?.kpis?.currentBalance?.value || 0)}
               </p>
               <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-4 h-4 text-green-500" />
                 <span className="text-xs text-green-600 font-medium">{dashboardData?.kpis?.currentBalance?.description || "Available"}</span>
               </div>
             </div>

             {/* Total Products */}
             <div className="h-12 w-px bg-gray-300"></div>
             <div className="text-center">
               <p className="text-sm font-medium text-gray-500 mb-1">{dashboardData?.kpis?.totalProducts?.title || "Total Products"}</p>
               <p className="text-2xl font-bold text-[#F39C12]">{dashboardData?.kpis?.totalProducts?.value || 0}</p>
               <div className="flex items-center gap-1 mt-1">
                 <Package className="w-4 h-4 text-blue-500" />
                 <span className="text-xs text-gray-600 font-medium">{dashboardData?.kpis?.totalProducts?.description || "active"}</span>
               </div>
             </div>

             {/* Active Staff */}
             <div className="h-12 w-px bg-gray-300"></div>
             <div className="text-center">
               <p className="text-sm font-medium text-gray-500 mb-1">{dashboardData?.kpis?.activeStaff?.title || "Active Staff"}</p>
               <div className="flex items-center gap-2">
                 <div className="text-2xl font-bold text-[#2ECC71]">{dashboardData?.kpis?.activeStaff?.value || 0}</div>
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2ECC71]">
                   <Users className="w-4 h-4 text-white" />
                 </div>
               </div>
               <p className="text-xs text-gray-600 mt-1">
                 {dashboardData?.kpis?.activeStaff?.description || "Team Members"}
               </p>
             </div>
           </div>
         </div>
       </div>

      {/* Low Stock Alert - US-S-202 */}
      {lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-[#F39C12] to-[#E67E22] rounded-lg shadow-sm border border-orange-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Low Stock Alert</h3>
              <p className="text-orange-100 text-sm">
                {lowStockCount} products have less than 3 days of estimated stock cover
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              onClick={() => window.location.href = '/products'}
            >
              View Inventory
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{dashboardData?.summary?.currentBalance?.title || "Current Balance"}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatUSD(dashboardData?.summary?.currentBalance?.value || 0)}
                </p>
                <p className="text-sm text-green-600">{dashboardData?.summary?.currentBalance?.description || "Available funds"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{dashboardData?.summary?.totalRevenue?.title || "Total Revenue"}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatUSD(dashboardData?.summary?.totalRevenue?.value || 0)}
                </p>
                <p className="text-sm text-green-600">{dashboardData?.summary?.totalRevenue?.description || "All time"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{dashboardData?.summary?.totalOrders?.title || "Total Orders"}</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary?.totalOrders?.value || 0}</p>
                <p className="text-sm text-green-600">{dashboardData?.summary?.totalOrders?.description || "0 pending"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{dashboardData?.summary?.inventoryItems?.title || "Inventory Items"}</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary?.inventoryItems?.value || 0}</p>
                <p className="text-sm text-orange-600">{dashboardData?.summary?.inventoryItems?.description || "0 low stock"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Potential Losses Analysis Card */}
      {potentialLosses.totalLosses > 0 && (
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800">Potential Losses Analysis</h3>
              <p className="text-sm text-red-600 font-medium">
                Identify areas for improvement to reduce financial losses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Losses Overview */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <span className="font-bold text-red-800">Total Potential Losses</span>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {formatUSD(potentialLosses.totalLosses)}
              </div>
              <p className="text-sm text-red-600 mb-4">
                Across {potentialLosses.breakdown?.length || 0} categories
              </p>

              {/* Loss Breakdown */}
              <div className="space-y-3">
                {uncompletedOrders > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Uncompleted Orders
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800">
                        {uncompletedOrders} orders
                      </div>
                      <div className="text-xs text-gray-500">
                        Need attention
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Loss Categories */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="font-bold text-amber-800">Top Loss Categories</span>
              </div>

              <div className="space-y-4">
                {potentialLosses.breakdown?.slice(0, 3).map((item: any, index: number) => {
                  const maxAmount = potentialLosses.breakdown[0]?.amount || 1;
                  const percentage = (item.amount / maxAmount) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {formatUSD(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{item.count} items</span>
                        <span>{item.percentage}% of total losses</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  💡 Recommendations to Reduce Losses:
                </p>
                <ul className="text-xs text-red-700 space-y-1">
                  {potentialLosses.breakdown?.[0]?.category === 'Unfulfilled Orders' && (
                    <li>• Focus on fulfilling pending orders quickly</li>
                  )}
                  {potentialLosses.breakdown?.[0]?.category === 'Cancelled Orders' && (
                    <li>• Review cancellation reasons and improve customer service</li>
                  )}
                  {potentialLosses.breakdown?.[0]?.category === 'Damaged Goods' && (
                    <li>• Improve packaging and quality control processes</li>
                  )}
                  {potentialLosses.breakdown?.[0]?.category === 'Lost Inventory' && (
                    <li>• Implement better inventory tracking and security</li>
                  )}
                  <li>• Monitor these metrics regularly to track improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Summary Widget */}
      <div className="mb-8">
        <SalesSummaryWidget salesSummary={dashboardData?.salesSummary} />
      </div>

      {/* Top Selling Products */}
      <div className="mb-8">
        <TopSellingProducts />
      </div>

      {/* Recent Orders Table */}
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Recent Orders</CardTitle>
            <p className="text-gray-600 text-sm">Latest orders from your store</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/orders'}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            View All Orders →
          </Button>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading recent orders...</span>
              </div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderModalOpen(true);
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
                        {formatDateWithTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Analytics Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Main Chart */}
          <div className="lg:col-span-2">
            <Card className="premium-card hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-400/5 to-transparent rounded-full blur-2xl"></div>

              <CardHeader className="pb-8 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-slate-900">
                      {dashboardData?.salesPerformanceAnalytics?.title || "Sales Performance Analytics"}
                    </CardTitle>
                    <p className="text-base text-slate-600 leading-relaxed">
                      {dashboardData?.salesPerformanceAnalytics?.subtitle || "Advanced revenue and order trend analysis with AI-powered insights"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-500">
                      Real-time data from API
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <SalesChart
                  data={trendsData.length > 0 ? trendsData.map(trend => ({
                    date: trend.date,
                    sales: trend.revenue || trend.sales || 0,
                    orders: trend.orders || 0,
                    unfulfilled: trend.unfulfilled || trend.unfulfilledOrders || 0
                  })) : undefined}
                  unfulfilledData={undefined} />
              </CardContent>
            </Card>
          </div>

        </div>


      </div>


        {/* Comparison Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Period Comparison */}
          <Card className="glass-card border-0 shadow-card hover:shadow-card-hover transition-all duration-300 relative z-10">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                Period Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div>
                    <p className="text-sm text-slate-600">This Month</p>
                    <p className="text-2xl font-bold text-slate-900">{formatUSD(dashboardData?.periodComparison?.thisMonth?.value || 0)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-blue-600">
                      {dashboardData?.periodComparison?.thisMonth?.changeType === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : dashboardData?.periodComparison?.thisMonth?.changeType === 'down' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4 opacity-50" />
                      )}
                      <span className="text-sm font-semibold">
                        {dashboardData?.periodComparison?.thisMonth?.change !== undefined 
                          ? `${dashboardData.periodComparison.thisMonth.change >= 0 ? '+' : ''}${dashboardData.periodComparison.thisMonth.change.toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">vs last month</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div>
                    <p className="text-sm text-slate-600">This Week</p>
                    <p className="text-2xl font-bold text-slate-900">{formatUSD(dashboardData?.periodComparison?.thisWeek?.value || 0)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-blue-600">
                      {dashboardData?.periodComparison?.thisWeek?.changeType === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : dashboardData?.periodComparison?.thisWeek?.changeType === 'down' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4 opacity-50" />
                      )}
                      <span className="text-sm font-semibold">
                        {dashboardData?.periodComparison?.thisWeek?.change !== undefined 
                          ? `${dashboardData.periodComparison.thisWeek.change >= 0 ? '+' : ''}${dashboardData.periodComparison.thisWeek.change.toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">vs last week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Categories */}
          <Card className="glass-card border-0 shadow-card hover:shadow-card-hover transition-all duration-300 relative z-10">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.topCategories && dashboardData.topCategories.length > 0 ? (
                  dashboardData.topCategories.map((category: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`h-3 w-3 bg-blue-600 rounded-full`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{category.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{formatUSD(category.amount)}</span>
                            <span className="text-sm font-bold text-slate-900">{category.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">No Data</span>
                        <span className="text-sm font-bold text-slate-900">0%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gray-400"
                          style={{ width: `100%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Indicators */}
          <Card className="glass-card border-0 shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(dashboardData?.keyMetrics?.orderFulfillment?.value || 0).toFixed(1)}{dashboardData?.keyMetrics?.orderFulfillment?.unit || '%'}
                  </div>
                  <div className="text-sm text-slate-600">Order Fulfillment</div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(dashboardData?.keyMetrics?.orderFulfillment?.value || 0, 100)}%` }}
                    ></div>
                  </div>
                  {dashboardData?.keyMetrics?.orderFulfillment?.comparison && (
                    <div className="text-xs text-slate-500 mt-1">{dashboardData.keyMetrics.orderFulfillment.comparison}</div>
                  )}
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {(dashboardData?.keyMetrics?.avgResponseTime?.value || 0).toFixed(1)}{dashboardData?.keyMetrics?.avgResponseTime?.unit || 'h'}
                  </div>
                  <div className="text-sm text-slate-600">Avg Response Time</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {dashboardData?.keyMetrics?.avgResponseTime?.change !== undefined && dashboardData.keyMetrics.avgResponseTime.change !== 0 && (
                      <>
                        {dashboardData.keyMetrics.avgResponseTime.change < 0 ? (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${dashboardData.keyMetrics.avgResponseTime.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dashboardData.keyMetrics.avgResponseTime.comparison || `${dashboardData.keyMetrics.avgResponseTime.change >= 0 ? '+' : ''}${dashboardData.keyMetrics.avgResponseTime.change}min`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      
      {/* Dashboard Content */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* End-of-Day Summary Notification */}
      {showNotification && endOfDayReport && (
        <div className="fixed top-8 right-8 z-[150] max-w-sm animate-luxury-slide-in">
          <EndOfDayReportModal orders={recentOrders} products={[]}>
            <Card className="premium-card shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 animate-luxury-fade-in-up relative overflow-hidden group">
              {/* Notification glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardContent className="p-8 relative">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-luxury-pulse">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    {endOfDayReport?.summary?.criticalOrders && endOfDayReport.summary.criticalOrders > 0 && (
                      <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full animate-ping flex items-center justify-center">
                        <span className="text-xs text-white font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="text-xl font-bold luxury-gradient-text">End of Day Summary</h4>
                      <div className="h-3 w-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-luxury-pulse"></div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-600 font-medium">Uncompleted orders:</span>
                        <span className="font-bold text-slate-900 text-lg">{endOfDayReport?.summary?.uncompletedOrders || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-600 font-medium">Potential revenue:</span>
                        <span className="font-bold text-green-600 text-lg">{formatUSD(endOfDayReport?.summary?.potentialLosses || 0)}</span>
                      </div>
                      {endOfDayReport?.summary?.criticalOrders && endOfDayReport.summary.criticalOrders > 0 && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 animate-luxury-pulse">
                          <span className="text-red-700 font-bold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Critical orders:
                          </span>
                          <span className="font-bold text-red-600 text-xl">{endOfDayReport.summary.criticalOrders}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => setShowNotification(false)}
                        className="bg-slate-600 hover:bg-slate-700 text-white flex-1 py-3 font-semibold"
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        className="luxury-button text-white flex-1 py-3 font-semibold"
                      >
                        Review Now →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </EndOfDayReportModal>
        </div>
      )}


      {/* Contextual Insights Panel */}
      {revenue.month > 75000 && (
        <div className="fixed bottom-20 left-6 max-w-sm z-[120] animate-slide-up">
          <Card className="glass-card shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-800 mb-1">High Performance Alert!</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    You're in the top tier! Consider expanding operations or increasing marketing budget.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      View Growth Plan
                    </Button>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievement Celebrations */}
      {revenue.month > 100000 && !showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[140] animate-bounce">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="font-bold">🎉 Congratulations! You've hit 6 figures! 🎉</span>
          </div>
        </div>
      )}

      {/* Smart Contextual Tips */}
      {uncompletedOrders > 3 && revenue.month <= 100000 && (
        <div className="fixed bottom-20 right-6 max-w-sm z-[130] animate-slide-up">
          <Card className="glass-card shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-800 mb-1">💡 Smart Suggestion</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    You have {uncompletedOrders} pending orders.
                    Complete them to boost your cash flow!
                  </p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    onClick={() => {
                      window.location.href = '/orders';
                    }}
                  >
                    View Orders →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Milestone Celebration */}
      {revenue.month > 100000 && !showNotification && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <Card className="glass-card border-0 shadow-2xl max-w-md mx-auto animate-scale-in">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-500 rounded-full animate-ping"></div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Incredible Achievement!</h3>
                  <p className="text-slate-600">
                    You've surpassed $100K in revenue! This is a massive milestone that puts you in the top tier of sellers.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">🏆 You're now in the</p>
                  <p className="text-lg font-bold text-blue-600">TOP 5% OF SELLERS</p>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    🎯 View Growth Tips
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50">
                    Share Achievement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
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

              {/* Rejection Details */}
              {selectedOrder.rejectionReason && (
                <div className="pb-4 border-b">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">Rejection Reason</h3>
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {selectedOrder.rejectionReason}
                  </div>
                  {selectedOrder.sellerRejectedAt && (
                    <div className="text-xs text-gray-500 mt-2">Rejected on: {formatDateWithTime(selectedOrder.sellerRejectedAt)}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddProductModal open={addOpen} onOpenChange={setAddOpen} />
      <OnboardingWizard open={onboardOpen} onOpenChange={setOnboardOpen} />
    </div>
  </div>
);
}
