// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  BarChart3,
  Package,
  RotateCcw,
  Users,
  ShoppingCart,
  AlertTriangle
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { formatDateWithTime } from "@/lib/date";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('sales');
  const { accessToken } = useSellerAuth();
  const { toast } = useToast();

  // Date filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [period, setPeriod] = useState<string>('daily');

  // Sales Report state
  const [salesData, setSalesData] = useState<any>(null);
  const [loadingSales, setLoadingSales] = useState(false);

  // Products Report state
  const [productsData, setProductsData] = useState<any>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Financial Report state
  const [financialData, setFinancialData] = useState<any>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  // Returns Report state
  const [returnsData, setReturnsData] = useState<any>(null);
  const [loadingReturns, setLoadingReturns] = useState(false);

  // Load Sales Report
  const loadSalesReport = async () => {
    if (!accessToken) return;

    try {
      setLoadingSales(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (period) params.append('period', period);

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/reports/sales?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setSalesData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load sales report:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load sales report",
        variant: "destructive",
      });
    } finally {
      setLoadingSales(false);
    }
  };

  // Load Products Report
  const loadProductsReport = async () => {
    if (!accessToken) return;

    try {
      setLoadingProducts(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/reports/products?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setProductsData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load products report:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load products report",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load Financial Report
  const loadFinancialReport = async () => {
    if (!accessToken) return;

    try {
      setLoadingFinancial(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/reports/financial?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setFinancialData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load financial report:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load financial report",
        variant: "destructive",
      });
    } finally {
      setLoadingFinancial(false);
    }
  };

  // Load Returns Report
  const loadReturnsReport = async () => {
    if (!accessToken) return;

    try {
      setLoadingReturns(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/reports/returns?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setReturnsData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load returns report:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load returns report",
        variant: "destructive",
      });
    } finally {
      setLoadingReturns(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!accessToken) return;

    if (activeTab === 'sales') {
      loadSalesReport();
    } else if (activeTab === 'products') {
      loadProductsReport();
    } else if (activeTab === 'financial') {
      loadFinancialReport();
    } else if (activeTab === 'returns') {
      loadReturnsReport();
    }
  }, [activeTab, accessToken]);

  // Reload when filters change
  useEffect(() => {
    if (!accessToken) return;

    if (activeTab === 'sales') {
      loadSalesReport();
    } else if (activeTab === 'products') {
      loadProductsReport();
    } else if (activeTab === 'financial') {
      loadFinancialReport();
    } else if (activeTab === 'returns') {
      loadReturnsReport();
    }
  }, [startDate, endDate, period]);

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || '';
    switch (normalizedStatus) {
      case 'RESOLVED':
      case 'COMPLETED':
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case 'OPEN':
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
      case 'CLOSED':
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
    }
  };

  const getReturnReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'DEFECTIVE': 'Defective',
      'WRONG_PART': 'Wrong Part',
      'CHANGE_OF_MIND': 'Change of Mind',
      'DAMAGED': 'Damaged',
      'NOT_AS_DESCRIBED': 'Not as Described',
      'OTHER': 'Other',
    };
    return labels[reason] || reason;
  };

  const getFaultBadge = (fault: string) => {
    switch (fault) {
      case 'SELLER_FAULT':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Seller Fault</Badge>;
      case 'BUYER_FAULT':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Buyer Fault</Badge>;
      case 'NO_FAULT':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">No Fault</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{fault || 'Unknown'}</Badge>;
    }
  };

  // Helper function to combine revenue and expenses trends
  const combineRevenueExpenseTrends = (revenueTrends: any[], expenseTrends: any[]) => {
    const dateMap = new Map();
    
    revenueTrends.forEach((item: any) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, revenue: item.revenue || 0, expenses: 0 });
      } else {
        dateMap.get(item.date).revenue = item.revenue || 0;
      }
    });
    
    expenseTrends.forEach((item: any) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, revenue: 0, expenses: item.expenses || 0 });
      } else {
        dateMap.get(item.date).expenses = item.expenses || 0;
      }
    });
    
    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Helper function to format cash flow by type for bar chart
  const formatCashFlowByType = (byType: any) => {
    const labels: Record<string, string> = {
      'sales': 'Sales',
      'expenses': 'Expenses',
      'commission': 'Commission',
      'refunds': 'Refunds',
      'payouts': 'Payouts'
    };
    
    return Object.entries(byType)
      .filter(([_, value]: [string, any]) => value !== 0)
      .map(([key, value]: [string, any]) => ({
        name: labels[key] || key,
        value: Math.abs(value)
      }));
  };

  // Helper function to format expense categories for pie chart
  const formatExpenseCategories = (byCategory: any) => {
    const labels: Record<string, string> = {
      'RENT': 'Rent',
      'UTILITIES': 'Utilities',
      'WAGES': 'Wages',
      'FUEL': 'Fuel',
      'MARKETING': 'Marketing',
      'EQUIPMENT': 'Equipment',
      'SUPPLIES': 'Supplies',
      'MAINTENANCE': 'Maintenance',
      'INSURANCE': 'Insurance',
      'OTHER': 'Other'
    };
    
    return Object.entries(byCategory)
      .filter(([key, value]: [string, any]) => key !== 'total' && value > 0)
      .map(([key, value]: [string, any]) => ({
        name: labels[key] || key,
        value: value
      }));
  };

  // Helper function to get colors for expense categories
  const getExpenseColor = (category: string) => {
    const colors: Record<string, string> = {
      'Rent': '#3b82f6',
      'Utilities': '#10b981',
      'Wages': '#f59e0b',
      'Fuel': '#ef4444',
      'Marketing': '#8b5cf6',
      'Equipment': '#ec4899',
      'Supplies': '#06b6d4',
      'Maintenance': '#f97316',
      'Insurance': '#14b8a6',
      'Other': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  // Helper function to format breakdown data for pie charts
  const formatBreakdownForPie = (breakdown: any) => {
    return Object.entries(breakdown)
      .filter(([_, value]: [string, any]) => value > 0)
      .map(([key, value]: [string, any]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: value
      }));
  };

  // Helper function to get colors for order status
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Delivered': '#10b981',
      'Shipped': '#3b82f6',
      'Processing': '#f59e0b',
      'Pending': '#f59e0b',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Helper function to get colors for payment status
  const getPaymentColor = (payment: string) => {
    const colors: Record<string, string> = {
      'Paid': '#10b981',
      'Partial': '#f59e0b',
      'Unpaid': '#ef4444',
      'Pending': '#f59e0b'
    };
    return colors[payment] || '#6b7280';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-[#2ECC71] rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Reports & Analytics
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Comprehensive business intelligence and performance analytics
              </p>
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Start Date:</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40 border border-gray-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>End Date:</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40 border border-gray-300"
                />
              </div>
              {activeTab === 'sales' && (
                <div className="flex items-center gap-2">
                  <Label>Period:</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-32 border border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPeriod('daily');
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="sales" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Sales Report
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Products Report
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Report
            </TabsTrigger>
            <TabsTrigger value="returns" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Returns Report
            </TabsTrigger>
          </TabsList>

          {/* Sales Report Tab */}
          <TabsContent value="sales" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Sales Report
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadSalesReport}
                    disabled={loadingSales}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingSales ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSales ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : salesData ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    {salesData.summary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{salesData.summary.totalOrders || 0}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">{formatUSD(salesData.summary.totalRevenue || 0)}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">{formatUSD(salesData.summary.netRevenue || 0)}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-orange-50 border-orange-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                            <p className="text-2xl font-bold text-orange-700 mt-1">{formatUSD(salesData.summary.avgOrderValue || 0)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Breakdown */}
                    {salesData.breakdown && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Orders by Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {salesData.breakdown.byStatus && Object.entries(salesData.breakdown.byStatus).map(([status, count]: [string, any]) => (
                                <div key={status} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Orders by Payment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {salesData.breakdown.byPayment && Object.entries(salesData.breakdown.byPayment).map(([payment, count]: [string, any]) => (
                                <div key={payment} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700 capitalize">{payment}</span>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Revenue Trends Chart */}
                    {salesData.trends && salesData.trends.data && salesData.trends.data.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Revenue Trends ({salesData.trends.period})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData.trends.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="period" 
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              />
                              <YAxis tickFormatter={(value) => formatUSD(value)} />
                              <Tooltip 
                                formatter={(value: number, name: string) => {
                                  if (name === 'totalRevenue' || name === 'netRevenue' || name === 'totalCommission') {
                                    return formatUSD(value);
                                  }
                                  return value;
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="totalRevenue" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Total Revenue"
                                dot={{ r: 4 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="netRevenue" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="Net Revenue"
                                dot={{ r: 4 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="totalCommission" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                name="Commission"
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Daily Sales Chart */}
                    {salesData.daily && salesData.daily.data && salesData.daily.data.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Daily Sales Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData.daily.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number, name: string) => {
                                  if (name === 'totalRevenue' || name === 'netRevenue' || name === 'avgOrderValue') {
                                    return formatUSD(value);
                                  }
                                  return value;
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                              <Legend />
                              <Bar dataKey="orderCount" fill="#3b82f6" name="Orders" />
                              <Bar dataKey="totalItems" fill="#10b981" name="Items Sold" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Sales by Category */}
                    {salesData.byCategory && salesData.byCategory.data && salesData.byCategory.data.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Sales by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData.byCategory.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="orderCount" fill="#3b82f6" name="Orders" />
                              <Bar dataKey="totalItems" fill="#10b981" name="Items Sold" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Orders by Status Pie Chart */}
                    {salesData.breakdown && salesData.breakdown.byStatus && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Orders by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={formatBreakdownForPie(salesData.breakdown.byStatus)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {formatBreakdownForPie(salesData.breakdown.byStatus).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col justify-center space-y-2">
                              {Object.entries(salesData.breakdown.byStatus).map(([status, count]: [string, any]) => (
                                <div key={status} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Orders by Payment Pie Chart */}
                    {salesData.breakdown && salesData.breakdown.byPayment && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Orders by Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={formatBreakdownForPie(salesData.breakdown.byPayment)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {formatBreakdownForPie(salesData.breakdown.byPayment).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={getPaymentColor(entry.name)} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col justify-center space-y-2">
                              {Object.entries(salesData.breakdown.byPayment).map(([payment, count]: [string, any]) => (
                                <div key={payment} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700 capitalize">{payment}</span>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No sales data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Report Tab */}
          <TabsContent value="products" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Products Report
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadProductsReport}
                    disabled={loadingProducts}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingProducts ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : productsData ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    {productsData.summary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{productsData.summary.totalProducts || 0}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Active Products</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">{productsData.summary.activeProducts || 0}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-yellow-50 border-yellow-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-yellow-700 mt-1">{productsData.summary.lowStockCount || 0}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Stock Value</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">{formatUSD(productsData.summary.totalStockValue || 0)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Top Products */}
                    {productsData.topProducts && productsData.topProducts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Top Products by Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead className="text-right">Total Sold</TableHead>
                                <TableHead className="text-right">Orders</TableHead>
                                <TableHead className="text-right">Total Revenue</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productsData.topProducts.map((product: any, index: number) => (
                                <TableRow key={product.inventoryId || index}>
                                  <TableCell className="font-medium">{product.productName || 'N/A'}</TableCell>
                                  <TableCell className="text-right">{product.totalSold || 0}</TableCell>
                                  <TableCell className="text-right">{product.orderCount || 0}</TableCell>
                                  <TableCell className="text-right font-semibold">{formatUSD(product.totalRevenue || 0)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {/* Category Performance */}
                    {productsData.categoryPerformance && productsData.categoryPerformance.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Category Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Products</TableHead>
                                <TableHead className="text-right">Total Sold</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Stock Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productsData.categoryPerformance.map((category: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{category.categoryName || 'N/A'}</TableCell>
                                  <TableCell className="text-right">{category.productCount || 0}</TableCell>
                                  <TableCell className="text-right">{category.totalSold || 0}</TableCell>
                                  <TableCell className="text-right font-semibold">{formatUSD(category.totalRevenue || 0)}</TableCell>
                                  <TableCell className="text-right">{formatUSD(category.stockValue || 0)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {/* Products Table */}
                    {productsData.products && productsData.products.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">All Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600 mb-4">
                            Showing {productsData.products.length} products
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead className="text-right">Stock</TableHead>
                                  <TableHead className="text-right">Sold</TableHead>
                                  <TableHead className="text-right">Revenue</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {productsData.products.slice(0, 50).map((product: any) => (
                                  <TableRow key={product.inventoryId}>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{product.productName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{product.oemPartNumber || '-'}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{product.category || '-'}</TableCell>
                                    <TableCell className="text-right">
                                      {product.isOutOfStock ? (
                                        <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                                      ) : product.isLowStock ? (
                                        <Badge className="bg-yellow-100 text-yellow-800">{product.currentStock}</Badge>
                                      ) : (
                                        product.currentStock || 0
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">{product.totalSold || 0}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatUSD(product.totalRevenue || 0)}</TableCell>
                                    <TableCell>
                                      {product.isActive ? (
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                      ) : (
                                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No products data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Report Tab */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Report
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadFinancialReport}
                    disabled={loadingFinancial}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingFinancial ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFinancial ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : financialData ? (
                  <div className="space-y-6">
                    {/* Profitability Metrics */}
                    {financialData.profitability && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Gross Profit Margin</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                              {financialData.profitability.grossProfitMargin?.toFixed(2) || '0.00'}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Operating Margin</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">
                              {financialData.profitability.operatingMargin?.toFixed(2) || '0.00'}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Net Profit Margin</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">
                              {financialData.profitability.netProfitMargin?.toFixed(2) || '0.00'}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Cash Flow Summary */}
                    {financialData.cashFlow && financialData.cashFlow.summary && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Cash Flow Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Total Inflow</p>
                              <p className="text-xl font-bold text-green-600">{formatUSD(financialData.cashFlow.summary.totalInflow || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Outflow</p>
                              <p className="text-xl font-bold text-red-600">{formatUSD(financialData.cashFlow.summary.totalOutflow || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Net Cash Flow</p>
                              <p className={`text-xl font-bold ${(financialData.cashFlow.summary.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatUSD(financialData.cashFlow.summary.netCashFlow || 0)}
                              </p>
                            </div>
                          </div>
                          {financialData.cashFlow.trends && financialData.cashFlow.trends.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-4">Cash Flow Trends</h4>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={financialData.cashFlow.trends}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  />
                                  <YAxis tickFormatter={(value) => formatUSD(value)} />
                                  <Tooltip 
                                    formatter={(value: number) => formatUSD(value)}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                  />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="inflow" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    name="Inflow"
                                    dot={{ r: 4 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="outflow" 
                                    stroke="#ef4444" 
                                    strokeWidth={2}
                                    name="Outflow"
                                    dot={{ r: 4 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="net" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    name="Net Cash Flow"
                                    dot={{ r: 4 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Income Statement */}
                    {financialData.incomeStatement && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Income Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Revenue Section */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Revenue</h4>
                              <div className="ml-4 space-y-1">
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-gray-700">Gross Sales</span>
                                  <span className="font-medium text-gray-900">{formatUSD(financialData.incomeStatement.revenue?.grossSales || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-gray-600 text-sm">Less: Returns and Refunds</span>
                                  <span className="text-gray-600 text-sm">({formatUSD(financialData.incomeStatement.revenue?.returnsAndRefunds || 0)})</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                  <span className="font-semibold text-gray-900">Net Sales</span>
                                  <span className="font-bold text-gray-900">{formatUSD(financialData.incomeStatement.revenue?.netSales || 0)}</span>
                                </div>
                              </div>
                            </div>

                            {/* COGS Section */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Cost of Goods Sold</h4>
                              <div className="ml-4 space-y-1">
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-gray-700">Total COGS</span>
                                  <span className="font-medium text-gray-900">{formatUSD(financialData.incomeStatement.costOfGoodsSold?.totalCOGS || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                  <span className="font-semibold text-gray-900">Gross Profit</span>
                                  <span className="font-bold text-gray-900">{formatUSD(financialData.incomeStatement.costOfGoodsSold?.grossProfit || 0)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Operating Expenses */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Operating Expenses</h4>
                              <div className="ml-4 space-y-1">
                                {financialData.incomeStatement.operatingExpenses && Object.entries(financialData.incomeStatement.operatingExpenses).map(([key, value]: [string, any]) => {
                                  if (key === 'total') return null;
                                  const categoryLabels: Record<string, string> = {
                                    'RENT': 'Rent',
                                    'UTILITIES': 'Utilities',
                                    'WAGES': 'Wages',
                                    'FUEL': 'Fuel',
                                    'MARKETING': 'Marketing',
                                    'EQUIPMENT': 'Equipment',
                                    'SUPPLIES': 'Supplies',
                                    'MAINTENANCE': 'Maintenance',
                                    'INSURANCE': 'Insurance',
                                    'OTHER': 'Other'
                                  };
                                  if (value === 0) return null;
                                  return (
                                    <div key={key} className="flex justify-between items-center py-1">
                                      <span className="text-gray-700">{categoryLabels[key] || key}</span>
                                      <span className="font-medium text-gray-900">{formatUSD(value || 0)}</span>
                                    </div>
                                  );
                                })}
                                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                  <span className="font-semibold text-gray-900">Total Operating Expenses</span>
                                  <span className="font-bold text-gray-900">{formatUSD(financialData.incomeStatement.operatingExpenses?.total || 0)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Operating Income */}
                            <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2 pt-3">
                              <span className="font-bold text-lg text-gray-900">Operating Income</span>
                              <span className="font-bold text-lg text-gray-900">{formatUSD(financialData.incomeStatement.operatingIncome || 0)}</span>
                            </div>

                            {/* Other Income/Expenses */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Other Income / Expenses</h4>
                              <div className="ml-4 space-y-1">
                                {financialData.incomeStatement.otherIncomeExpenses?.platformFees > 0 && (
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-700">Platform Fees</span>
                                    <span className="font-medium text-red-600">({formatUSD(financialData.incomeStatement.otherIncomeExpenses.platformFees)})</span>
                                  </div>
                                )}
                                {financialData.incomeStatement.otherIncomeExpenses?.otherIncome > 0 && (
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-700">Other Income</span>
                                    <span className="font-medium text-green-600">{formatUSD(financialData.incomeStatement.otherIncomeExpenses.otherIncome)}</span>
                                  </div>
                                )}
                                {financialData.incomeStatement.otherIncomeExpenses?.otherExpenses > 0 && (
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-700">Other Expenses</span>
                                    <span className="font-medium text-red-600">({formatUSD(financialData.incomeStatement.otherIncomeExpenses.otherExpenses)})</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                  <span className="font-semibold text-gray-900">Total Other Income / Expenses</span>
                                  <span className={`font-bold ${(financialData.incomeStatement.otherIncomeExpenses?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatUSD(financialData.incomeStatement.otherIncomeExpenses?.total || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Net Income */}
                            <div className={`flex justify-between items-center py-4 border-t-2 border-gray-400 mt-4 pt-4 ${(financialData.incomeStatement.netIncome || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg px-4`}>
                              <span className="font-bold text-xl text-gray-900">Net Income</span>
                              <span className={`font-bold text-2xl ${(financialData.incomeStatement.netIncome || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatUSD(financialData.incomeStatement.netIncome || 0)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Revenue vs Expenses Trends */}
                    {(financialData.revenue?.trends || financialData.expenses?.trends) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Revenue vs Expenses Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={combineRevenueExpenseTrends(financialData.revenue?.trends || [], financialData.expenses?.trends || [])}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              />
                              <YAxis tickFormatter={(value) => formatUSD(value)} />
                              <Tooltip 
                                formatter={(value: number) => formatUSD(value)}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Revenue"
                                dot={{ r: 4 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="expenses" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                name="Expenses"
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Profit Trends */}
                    {financialData.profit?.trends && financialData.profit.trends.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Profit Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={financialData.profit.trends}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              />
                              <YAxis tickFormatter={(value) => formatUSD(value)} />
                              <Tooltip 
                                formatter={(value: number) => formatUSD(value)}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Revenue"
                                dot={{ r: 4 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="expenses" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                name="Expenses"
                                dot={{ r: 4 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="profit" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                name="Profit"
                                dot={{ r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cash Flow by Type */}
                    {financialData.cashFlow?.byType && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Cash Flow by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={formatCashFlowByType(financialData.cashFlow.byType)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => formatUSD(value)} />
                              <Tooltip formatter={(value: number) => formatUSD(value)} />
                              <Legend />
                              <Bar dataKey="value" fill="#3b82f6" name="Amount" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Monthly Summary */}
                    {financialData.monthly?.data && financialData.monthly.data.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Monthly Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={financialData.monthly.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="month" 
                                tickFormatter={(value) => {
                                  const date = new Date(value + '-01');
                                  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                }}
                              />
                              <YAxis tickFormatter={(value) => formatUSD(value)} />
                              <Tooltip formatter={(value: number) => formatUSD(value)} />
                              <Legend />
                              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                              <Bar dataKey="netIncome" fill="#3b82f6" name="Net Income" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Expense Breakdown */}
                    {financialData.expenses && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            {financialData.expenses.byCategory && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-4">By Category</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <PieChart>
                                    <Pie
                                      data={formatExpenseCategories(financialData.expenses.byCategory)}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                      outerRadius={100}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {formatExpenseCategories(financialData.expenses.byCategory).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={getExpenseColor(entry.name)} />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatUSD(value)} />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            {/* Table */}
                            {financialData.expenses.breakdown && financialData.expenses.breakdown.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-4">Detailed Breakdown</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Category</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead className="text-right">Percentage</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {financialData.expenses.breakdown.map((expense: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">{getExpenseCategoryLabel(expense.category)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatUSD(expense.amount || 0)}</TableCell>
                                        <TableCell className="text-right">{expense.percentage?.toFixed(1) || '0.0'}%</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No financial data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Report Tab */}
          <TabsContent value="returns" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Returns Report
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadReturnsReport}
                    disabled={loadingReturns}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingReturns ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingReturns ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : returnsData ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    {returnsData.summary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-red-50 border-red-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                            <p className="text-2xl font-bold text-red-700 mt-1">{formatUSD(returnsData.summary.totalRefunds || 0)}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-orange-50 border-orange-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Refund Count</p>
                            <p className="text-2xl font-bold text-orange-700 mt-1">{returnsData.summary.refundCount || 0}</p>
                          </CardContent>
                        </Card>
                        <Card className={`${(returnsData.summary.refundRate || 0) > 5 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Refund Rate</p>
                            <p className={`text-2xl font-bold mt-1 ${(returnsData.summary.refundRate || 0) > 5 ? 'text-red-700' : 'text-yellow-700'}`}>
                              {returnsData.summary.refundRate?.toFixed(2) || '0.00'}%
                            </p>
                            {(returnsData.summary.refundRate || 0) > 5 && (
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-1" />
                            )}
                          </CardContent>
                        </Card>
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-gray-600">Return Requests</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{returnsData.summary.totalReturnRequests || 0}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Breakdown */}
                    {returnsData.breakdown && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {returnsData.breakdown.byReason && returnsData.breakdown.byReason.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Returns by Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {returnsData.breakdown.byReason.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">{getReturnReasonLabel(item.reason)}</span>
                                    <span className="font-semibold">{item.count || 0}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {returnsData.breakdown.byStatus && returnsData.breakdown.byStatus.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Returns by Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {returnsData.breakdown.byStatus.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 capitalize">{item.status}</span>
                                    <span className="font-semibold">{item.count || 0}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Return Requests Table */}
                    {returnsData.returnRequests && returnsData.returnRequests.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Return Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-96 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Order Number</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Fault</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {returnsData.returnRequests.map((request: any) => (
                                  <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.orderNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                      <Badge className={request.requestType === 'RETURN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                                        {request.requestType || 'N/A'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{getReturnReasonLabel(request.returnReason)}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>{getFaultBadge(request.faultClassification)}</TableCell>
                                    <TableCell className="font-semibold">{formatUSD(request.orderAmount || 0)}</TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Refunds Table */}
                    {returnsData.refunds && returnsData.refunds.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Refund Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {returnsData.refunds.map((refund: any) => (
                                <TableRow key={refund.id}>
                                  <TableCell>{refund.date ? formatDateWithTime(refund.date) : '-'}</TableCell>
                                  <TableCell>{refund.description || '-'}</TableCell>
                                  <TableCell className="text-right font-semibold text-red-600">{formatUSD(refund.amount || 0)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {/* Trends Info */}
                    {returnsData.trends && returnsData.trends.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Refund Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600 mb-4">
                            {returnsData.trends.length} days of data available for charts
                          </div>
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            Chart visualization will be implemented here
                            <div className="text-xs mt-2">Use trends array for line/bar charts</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No returns data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Helper function for expense category labels
function getExpenseCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    'RENT': 'Rent',
    'UTILITIES': 'Utilities',
    'WAGES': 'Wages',
    'FUEL': 'Fuel',
    'MARKETING': 'Marketing',
    'EQUIPMENT': 'Equipment',
    'SUPPLIES': 'Supplies',
    'MAINTENANCE': 'Maintenance',
    'INSURANCE': 'Insurance',
    'OTHER': 'Other',
  };
  return labels[category] || category;
}
