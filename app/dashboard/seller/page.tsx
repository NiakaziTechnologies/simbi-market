// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, Clock, TrendingDown, AlertTriangle, AlertCircle, Wallet, BarChart3, ClipboardList, Archive, Calendar, CalendarDays, CalendarRange, Trophy, Pause, Clock as ClockIcon, Cog, Truck, CheckCircle, X, AlertCircle as AlertIcon } from "lucide-react";
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
import { useSellerAuth } from "@/hooks/useSellerAuth";
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
  const iconClass = "w-4 h-4";

  switch (normalizedStatus) {
    case "AWAITING_SELLER_ACCEPTANCE":
      return <Pause className={iconClass} />;
    case "PENDING_PAYMENT":
    case "PENDING":
      return <ClockIcon className={iconClass} />;
    case "PROCESSING":
    case "ACCEPTED":
      return <Cog className={iconClass} />;
    case "SHIPPED":
    case "IN_TRANSIT":
      return <Truck className={iconClass} />;
    case "DELIVERED":
    case "COMPLETED":
      return <CheckCircle className={iconClass} />;
    case "CANCELLED":
      return <X className={iconClass} />;
    case "REJECTED":
    case "SELLER_REJECTED":
      return <AlertIcon className={iconClass} />;
    default:
      return <AlertCircle className={iconClass} />;
  }
};

const formatStatus = (status: string) => {
  return status?.split('_').map(word =>
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ') || status;
};

export default function Dashboard() {
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
  const { seller } = useSellerAuth();

  // Load mock dashboard data
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      setError(null);

      // Simulate API delay
      setTimeout(() => {
        const mockData = {
          kpis: {
            totalRevenue: { title: "Total Revenue", value: 125000, description: "All time", unit: "USD" },
            currentBalance: { title: "Current Balance", value: 45000, description: "Available funds", unit: "USD" },
            totalProducts: { title: "Total Products", value: 245, description: "Active listings", unit: "items" },
            activeStaff: { title: "Active Staff", value: 8, description: "Team members", unit: "people" }
          },
          summary: {
            currentBalance: { title: "Current Balance", value: 45000, description: "Available funds", unit: "USD" },
            totalRevenue: { title: "Total Revenue", value: 125000, description: "All time", unit: "USD" },
            totalOrders: { title: "Total Orders", value: 156, description: "12 pending", unit: "orders" },
            inventoryItems: { title: "Inventory Items", value: 245, description: "5 low stock", unit: "items" }
          },
          salesSummary: {
            daily: { title: "Today's Sales", period: "Today", value: 2500, description: "Great start!" },
            weekly: { title: "This Week", period: "This week", value: 18500, description: "On track" },
            monthly: { title: "This Month", period: "This month", value: 78000, description: "Excellent performance" }
          },
          salesPerformanceAnalytics: {
            title: "Sales Performance Analytics",
            subtitle: "Advanced revenue and order trend analysis with AI-powered insights",
            data: [
              { date: "2024-01-01", sales: 1200, unfulfilledOrders: 2 },
              { date: "2024-01-02", sales: 1800, unfulfilledOrders: 1 },
              { date: "2024-01-03", sales: 2200, unfulfilledOrders: 3 },
              { date: "2024-01-04", sales: 1600, unfulfilledOrders: 0 },
              { date: "2024-01-05", sales: 2800, unfulfilledOrders: 1 },
              { date: "2024-01-06", sales: 2400, unfulfilledOrders: 2 },
              { date: "2024-01-07", sales: 3100, unfulfilledOrders: 0 }
            ]
          },
          periodComparison: {
            thisMonth: { value: 78000, change: 12.5, changeType: "up", comparison: "vs last month" },
            thisWeek: { value: 18500, change: 8.3, changeType: "up", comparison: "vs last week" }
          },
          topCategories: [
            { category: "Engine Parts", amount: 25000, percentage: 32 },
            { category: "Brake Systems", amount: 18000, percentage: 23 },
            { category: "Suspension", amount: 15000, percentage: 19 },
            { category: "Electrical", amount: 12000, percentage: 15 },
            { category: "Other", amount: 9000, percentage: 11 }
          ],
          topSellingProducts: {
            title: "Top Selling Products",
            subtitle: "Your best performing products this month",
            data: [
              {
                inventoryId: "INV-001",
                productName: "Brake Pad Set - Front",
                oemPartNumber: "BP-2024-F",
                manufacturer: "AutoParts Pro",
                revenue: 5200,
                quantitySold: 104,
                orderCount: 89
              },
              {
                inventoryId: "INV-002",
                productName: "Oil Filter - High Performance",
                oemPartNumber: "OF-2024-HP",
                manufacturer: "FilterTech",
                revenue: 4800,
                quantitySold: 96,
                orderCount: 76
              },
              {
                inventoryId: "INV-003",
                productName: "Spark Plug Set - 4 Pack",
                oemPartNumber: "SP-2024-4P",
                manufacturer: "SparkMaster",
                revenue: 3600,
                quantitySold: 120,
                orderCount: 95
              }
            ],
            totalRevenue: 13600
          },
          keyMetrics: {
            orderFulfillment: { value: 94.2, unit: "%", change: 2.1, comparison: "vs last month" },
            avgResponseTime: { value: 2.3, unit: "h", change: -0.4, comparison: "vs last month" }
          }
        };

        setDashboardData(mockData);

        // Map salesPerformanceAnalytics.data to trendsData format for charts
        if (mockData.salesPerformanceAnalytics?.data) {
          const analyticsData = mockData.salesPerformanceAnalytics.data.map((item: any) => ({
            date: item.date,
            sales: item.sales || 0,
            revenue: item.sales || 0,
            orders: 0,
            unfulfilledOrders: item.unfulfilledOrders || 0,
            unfulfilled: item.unfulfilledOrders || 0
          }));
          setTrendsData(analyticsData);
        }

        setLoading(false);
      }, 1000); // Simulate loading delay
    };

    loadMockData();
  }, []);

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

  // Load mock recent orders
  useEffect(() => {
    const loadMockOrders = () => {
      setLoadingOrders(true);

      // Simulate API delay
      setTimeout(() => {
        const mockOrders = [
          {
            id: "ORD-001",
            orderNumber: "ORD-001",
            totalAmount: 1250.00,
            status: "PROCESSING",
            paymentStatus: "COMPLETED",
            createdAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "ORD-002",
            orderNumber: "ORD-002",
            totalAmount: 890.50,
            status: "SHIPPED",
            paymentStatus: "COMPLETED",
            createdAt: "2024-01-14T15:45:00Z"
          },
          {
            id: "ORD-003",
            orderNumber: "ORD-003",
            totalAmount: 2100.75,
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING",
            createdAt: "2024-01-14T09:20:00Z"
          },
          {
            id: "ORD-004",
            orderNumber: "ORD-004",
            totalAmount: 675.25,
            status: "DELIVERED",
            paymentStatus: "COMPLETED",
            createdAt: "2024-01-13T14:15:00Z"
          },
          {
            id: "ORD-005",
            orderNumber: "ORD-005",
            totalAmount: 3200.00,
            status: "PROCESSING",
            paymentStatus: "COMPLETED",
            createdAt: "2024-01-13T11:30:00Z"
          }
        ];

        setRecentOrders(mockOrders);
        setLoadingOrders(false);
      }, 500);
    };

    loadMockOrders();
  }, []);

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
       <div className="glass-card rounded-lg shadow-sm border border-border p-6 mb-6">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold text-foreground mb-2">Business Dashboard</h1>
             <p className="text-muted-foreground">Real-time business insights and performance metrics</p>
           </div>
           <div className="flex items-center gap-6">
             {/* Total Revenue */}
             <div className="text-center">
               <p className="text-sm font-medium text-muted-foreground mb-1">{dashboardData?.kpis?.totalRevenue?.title || "Total Revenue"}</p>
               <p className="text-2xl font-bold text-accent">
                 {formatUSD(dashboardData?.kpis?.totalRevenue?.value || 0)}
               </p>
               <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-4 h-4 text-green-500" />
                 <span className="text-xs text-green-600 font-medium">{dashboardData?.kpis?.totalRevenue?.description || "Live Data"}</span>
               </div>
             </div>

             {/* Current Balance */}
             <div className="h-12 w-px bg-border"></div>
             <div className="text-center">
               <p className="text-sm font-medium text-muted-foreground mb-1">{dashboardData?.kpis?.currentBalance?.title || "Current Balance"}</p>
               <p className="text-2xl font-bold text-accent">
                 {formatUSD(dashboardData?.kpis?.currentBalance?.value || 0)}
               </p>
               <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-4 h-4 text-green-500" />
                 <span className="text-xs text-green-600 font-medium">{dashboardData?.kpis?.currentBalance?.description || "Available"}</span>
               </div>
             </div>

             {/* Total Products */}
             <div className="h-12 w-px bg-border"></div>
             <div className="text-center">
               <p className="text-sm font-medium text-muted-foreground mb-1">{dashboardData?.kpis?.totalProducts?.title || "Total Products"}</p>
               <p className="text-2xl font-bold text-accent">{dashboardData?.kpis?.totalProducts?.value || 0}</p>
               <div className="flex items-center gap-1 mt-1">
                 <Package className="w-4 h-4 text-accent" />
                 <span className="text-xs text-muted-foreground font-medium">{dashboardData?.kpis?.totalProducts?.description || "active"}</span>
               </div>
             </div>

             {/* Active Staff */}
             <div className="h-12 w-px bg-border"></div>
             <div className="text-center">
               <p className="text-sm font-medium text-muted-foreground mb-1">{dashboardData?.kpis?.activeStaff?.title || "Active Staff"}</p>
               <div className="flex items-center gap-2">
                 <div className="text-2xl font-bold text-accent">{dashboardData?.kpis?.activeStaff?.value || 0}</div>
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent">
                   <Users className="w-4 h-4 text-white" />
                 </div>
               </div>
               <p className="text-xs text-muted-foreground mt-1">
                 {dashboardData?.kpis?.activeStaff?.description || "Team Members"}
               </p>
             </div>
           </div>
         </div>
       </div>

      {/* Low Stock Alert - US-S-202 */}
      {lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm border border-red-300 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Low Stock Alert</h3>
              <p className="text-red-100 text-sm">
                {lowStockCount} products have less than 3 days of estimated stock cover
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              onClick={() => window.location.href = '/dashboard/seller/inventory'}
            >
              View Inventory
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dashboardData?.summary?.currentBalance?.title || "Current Balance"}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatUSD(dashboardData?.summary?.currentBalance?.value || 0)}
                </p>
                <p className="text-sm text-green-600">{dashboardData?.summary?.currentBalance?.description || "Available funds"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dashboardData?.summary?.totalRevenue?.title || "Total Revenue"}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatUSD(dashboardData?.summary?.totalRevenue?.value || 0)}
                </p>
                <p className="text-sm text-green-600">{dashboardData?.summary?.totalRevenue?.description || "All time"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <ClipboardList className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dashboardData?.summary?.totalOrders?.title || "Total Orders"}</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData?.summary?.totalOrders?.value || 0}</p>
                <p className="text-sm text-green-600">{dashboardData?.summary?.totalOrders?.description || "0 pending"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Archive className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dashboardData?.summary?.inventoryItems?.title || "Inventory Items"}</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData?.summary?.inventoryItems?.value || 0}</p>
                <p className="text-sm text-red-600 font-medium">{dashboardData?.summary?.inventoryItems?.description || "0 low stock"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Potential Losses Analysis Card */}
      {potentialLosses.totalLosses > 0 && (
        <div className="glass-card border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-destructive/20 rounded-lg">
              <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-destructive">Potential Losses Analysis</h3>
              <p className="text-sm text-destructive font-medium">
                Identify areas for improvement to reduce financial losses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Losses Overview */}
            <div className="glass-card border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-destructive rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <span className="font-bold text-destructive">Total Potential Losses</span>
              </div>
              <div className="text-3xl font-bold text-destructive mb-2">
                {formatUSD(potentialLosses.totalLosses)}
              </div>
              <p className="text-sm text-destructive mb-4">
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
                      <span className="text-sm font-medium text-muted-foreground">
                        Uncompleted Orders
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">
                        {uncompletedOrders} orders
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Need attention
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Loss Categories */}
            <div className="glass-card border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="font-bold text-accent">Top Loss Categories</span>
              </div>

              <div className="space-y-4">
                {potentialLosses.breakdown?.slice(0, 3).map((item: any, index: number) => {
                  const maxAmount = potentialLosses.breakdown[0]?.amount || 1;
                  const percentage = (item.amount / maxAmount) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatUSD(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-destructive h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.count} items</span>
                        <span>{item.percentage}% of total losses</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-semibold text-destructive mb-2">
                  💡 Recommendations to Reduce Losses:
                </p>
                <ul className="text-xs text-destructive space-y-1">
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

      {/* Sales Summary */}
      <div className="mb-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sales Summary</h2>
            <p className="text-sm text-muted-foreground">Overview of your sales performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Sales Card */}
            <Card className="glass-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Daily Sales</h3>
                    <p className="text-sm text-muted-foreground mb-2">Today</p>
                    <p className="text-2xl font-bold text-accent mb-1">
                      {formatUSD(dashboardData?.salesSummary?.daily?.value || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue generated today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Sales Card */}
            <Card className="glass-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <CalendarDays className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Weekly Sales</h3>
                    <p className="text-sm text-muted-foreground mb-2">This week</p>
                    <p className="text-2xl font-bold text-accent mb-1">
                      {formatUSD(dashboardData?.salesSummary?.weekly?.value || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue generated this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Sales Card */}
            <Card className="glass-card border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <CalendarRange className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Monthly Sales</h3>
                    <p className="text-sm text-muted-foreground mb-2">This month</p>
                    <p className="text-2xl font-bold text-accent mb-1">
                      {formatUSD(dashboardData?.salesSummary?.monthly?.value || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue generated this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="mb-8">
        <Card className="glass-card border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Top Selling Products</CardTitle>
                  <p className="text-sm text-muted-foreground">2 products • 6 orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">$10,450.00</p>
                <p className="text-sm text-muted-foreground">35 units</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product #1 */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-accent text-white rounded-full font-bold text-sm">
                  #1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">ABS Pump Assembly</h4>
                  <p className="text-sm text-muted-foreground">5 orders • 34 units</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">$10,200.00</p>
                <p className="text-sm text-muted-foreground">97.6%</p>
              </div>
            </div>

            {/* Product #2 */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-accent/80 text-white rounded-full font-bold text-sm">
                  #2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Coolant Line</h4>
                  <p className="text-sm text-muted-foreground">1 orders • 1 units</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">$250.00</p>
                <p className="text-sm text-muted-foreground">2.4%</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                <p className="text-lg font-bold text-accent">$10,450.00</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Quantity</p>
                <p className="text-lg font-bold text-foreground">35</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Orders</p>
                <p className="text-lg font-bold text-foreground">6</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg per Product</p>
                <p className="text-lg font-bold text-accent">$5,225.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="glass-card rounded-lg shadow-sm border border-border mb-8">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Recent Orders</CardTitle>
            <p className="text-muted-foreground text-sm">Latest orders from your store</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/dashboard/seller/orders'}
            className="border-border text-foreground hover:bg-accent/10"
          >
            View All Orders →
          </Button>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span className="text-muted-foreground">Loading recent orders...</span>
              </div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent/10 border-b border-accent/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-accent uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-accent uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-accent uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-accent uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-accent uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderModalOpen(true);
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">#{order.orderNumber || order.id}</div>
                        {order.poNumber && (
                          <div className="text-xs text-muted-foreground">PO: {order.poNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          ${order.totalAmount?.toFixed(2) || order.subtotal?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-muted-foreground">{order.currency || 'USD'}</div>
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
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
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

              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-foreground">
                      {dashboardData?.salesPerformanceAnalytics?.title || "Sales Performance Analytics"}
                    </CardTitle>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {dashboardData?.salesPerformanceAnalytics?.subtitle || "Advanced revenue and order trend analysis with AI-powered insights"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      Real-time data from API
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chart Card */}
                <Card className="glass-card border border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Sales Performance Analytics</CardTitle>
                        <p className="text-sm text-muted-foreground">Advanced sales vs unfulfilled orders comparison with real-time insights</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Professional Chart */}
                    <div className="relative">
                      {/* Chart Header */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-accent">
                            {formatUSD(trendsData.reduce((sum, item) => sum + (item.sales || 0), 0))}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Sales Volume</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-orange-500">
                            {trendsData.reduce((sum, item) => sum + (item.unfulfilledOrders || 0), 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Unfulfilled Orders</div>
                        </div>
                      </div>

                      {/* Professional Line Chart */}
                      <div className="relative bg-background rounded-lg border border-border p-6">
                        {(() => {
                          // Calculate dynamic values
                          const salesValues = trendsData.map(d => d.sales || 0);
                          const ordersValues = trendsData.map(d => d.unfulfilledOrders || 0);
                          const allValues = [...salesValues, ...ordersValues];
                          const maxValue = Math.max(...allValues);
                          const range = maxValue || 1;

                          // Y-axis labels
                          const yLabels = [];
                          for (let i = 4; i >= 0; i--) {
                            const value = (range * i / 4);
                            yLabels.push(formatUSD(Math.round(value)));
                          }

                          // Calculate points for lines
                          const chartWidth = 280;
                          const chartHeight = 256;
                          const pointSpacing = chartWidth / (trendsData.length - 1);

                          const salesPoints = trendsData.map((d, i) => {
                            const x = i * pointSpacing;
                            const y = chartHeight - ((d.sales || 0) / range) * chartHeight;
                            return `${x},${y}`;
                          }).join(' ');

                          const ordersPoints = trendsData.map((d, i) => {
                            const x = i * pointSpacing;
                            const y = chartHeight - ((d.unfulfilledOrders || 0) / range) * chartHeight;
                            return `${x},${y}`;
                          }).join(' ');

                          return (
                            <>
                              {/* Y-axis labels */}
                              <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-muted-foreground font-medium">
                                {yLabels.map((label, i) => (
                                  <span key={i}>{label}</span>
                                ))}
                              </div>

                              {/* Chart Area */}
                              <div className="ml-12 mr-4 h-64 relative">
                                {/* Grid lines */}
                                <div className="absolute inset-0">
                                  {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="absolute w-full border-t border-border/20" style={{ top: `${i * 25}%` }}></div>
                                  ))}
                                </div>

                                {/* Lines */}
                                <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                                  {/* Sales Line */}
                                  <polyline
                                    points={salesPoints}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    className="hover:opacity-80 transition-opacity"
                                  />

                                  {/* Unfulfilled Orders Line */}
                                  <polyline
                                    points={ordersPoints}
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="3"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeDasharray="8,4"
                                    className="hover:opacity-80 transition-opacity"
                                  />

                                  {/* Data Points */}
                                  {trendsData.map((d, i) => {
                                    const x = i * pointSpacing;
                                    const salesY = chartHeight - ((d.sales || 0) / range) * chartHeight;
                                    const ordersY = chartHeight - ((d.unfulfilledOrders || 0) / range) * chartHeight;

                                    return (
                                      <g key={i}>
                                        {/* Sales Point */}
                                        <circle
                                          cx={x}
                                          cy={salesY}
                                          r="4"
                                          fill="#3b82f6"
                                          stroke="white"
                                          strokeWidth="2"
                                          className="hover:r-6 transition-all cursor-pointer"
                                        />
                                        {/* Orders Point */}
                                        <circle
                                          cx={x}
                                          cy={ordersY}
                                          r="4"
                                          fill="#f59e0b"
                                          stroke="white"
                                          strokeWidth="2"
                                          className="hover:r-6 transition-all cursor-pointer"
                                        />
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* X-axis labels */}
                      <div className="flex justify-between mt-3 ml-10 mr-4 text-xs text-muted-foreground font-medium">
                        {trendsData.map((d, i) => {
                          const date = new Date(d.date);
                          const isFirst = i === 0;
                          const isLast = i === trendsData.length - 1;
                          const isMiddle = i === Math.floor(trendsData.length / 2);
                          if (isFirst || isLast || isMiddle) {
                            return (
                              <span key={i}>
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            );
                          }
                          return null;
                        }).filter(Boolean)}
                      </div>

                      {/* Enhanced Legend */}
                      <div className="flex justify-center gap-8 mt-6">
                        <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-lg border border-border/50">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm font-medium text-foreground">Sales Revenue</span>
                        </div>
                        <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-lg border border-border/50">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span className="text-sm font-medium text-foreground">Unfulfilled Orders</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

        </div>


      </div>


        {/* Comparison Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Period Comparison */}
          <Card className="glass-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 relative z-10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                Period Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-foreground">{formatUSD(dashboardData?.periodComparison?.thisMonth?.value || 0)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent">
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
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold text-foreground">{formatUSD(dashboardData?.periodComparison?.thisWeek?.value || 0)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent">
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
                    <p className="text-xs text-muted-foreground">vs last week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Categories */}
          <Card className="glass-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 relative z-10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.topCategories && dashboardData.topCategories.length > 0 ? (
                  dashboardData.topCategories.map((category: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`h-3 w-3 bg-accent rounded-full`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{category.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{formatUSD(category.amount)}</span>
                            <span className="text-sm font-bold text-accent">{category.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-accent"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-muted-foreground rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">No Data</span>
                        <span className="text-sm font-bold text-foreground">0%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-muted-foreground"
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
          <Card className="glass-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {(dashboardData?.keyMetrics?.orderFulfillment?.value || 0).toFixed(1)}{dashboardData?.keyMetrics?.orderFulfillment?.unit || '%'}
                  </div>
                  <div className="text-sm text-muted-foreground">Order Fulfillment</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${Math.min(dashboardData?.keyMetrics?.orderFulfillment?.value || 0, 100)}%` }}
                    ></div>
                  </div>
                  {dashboardData?.keyMetrics?.orderFulfillment?.comparison && (
                    <div className="text-xs text-muted-foreground mt-1">{dashboardData.keyMetrics.orderFulfillment.comparison}</div>
                  )}
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {(dashboardData?.keyMetrics?.avgResponseTime?.value || 0).toFixed(1)}{dashboardData?.keyMetrics?.avgResponseTime?.unit || 'h'}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
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
            <DialogTitle className="text-xl font-bold text-foreground">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Order Number</div>
                  <div className="text-lg font-semibold text-foreground">#{selectedOrder.orderNumber || selectedOrder.id}</div>
                  {selectedOrder.poNumber && (
                    <div className="text-sm text-muted-foreground mt-1">PO: {selectedOrder.poNumber}</div>
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
                <div className="pb-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Address</h3>
                  <div className="text-sm text-foreground">
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
              <div className="pb-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {selectedOrder.subtotal !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-foreground">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.shippingCost !== undefined && selectedOrder.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className="text-foreground">${selectedOrder.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.platformCommission !== undefined && selectedOrder.platformCommission > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee:</span>
                      <span className="text-foreground">${selectedOrder.platformCommission.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border font-semibold text-base">
                    <span className="text-foreground">Total:</span>
                    <span className="text-accent">${selectedOrder.totalAmount?.toFixed(2) || selectedOrder.subtotal?.toFixed(2) || '0.00'} {selectedOrder.currency || 'USD'}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Payment Status</div>
                  {selectedOrder.paymentStatus && (
                    <Badge className={selectedOrder.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'}>
                      {selectedOrder.paymentStatus}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Date Created</div>
                  <div className="text-sm text-foreground">{formatDateWithTime(selectedOrder.createdAt)}</div>
                </div>
              </div>

              {/* Rejection Details */}
              {selectedOrder.rejectionReason && (
                <div className="pb-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-destructive mb-2">Rejection Reason</h3>
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    {selectedOrder.rejectionReason}
                  </div>
                  {selectedOrder.sellerRejectedAt && (
                    <div className="text-xs text-muted-foreground mt-2">Rejected on: {formatDateWithTime(selectedOrder.sellerRejectedAt)}</div>
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
