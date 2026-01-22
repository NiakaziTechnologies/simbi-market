"use client";

import React, { useState, useEffect } from "react";
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

// Mock formatUSD function
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Mock formatDateWithTime function
const formatDateWithTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>('sales');
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

  // Mock data for Sales Report
  const mockSalesData = {
    summary: {
      totalOrders: 245,
      totalRevenue: 125000,
      netRevenue: 118750,
      avgOrderValue: 510
    },
    breakdown: {
      byStatus: {
        'Delivered': 180,
        'Shipped': 35,
        'Processing': 25,
        'Pending': 5
      },
      byPayment: {
        'Paid': 220,
        'Partial': 15,
        'Unpaid': 10
      }
    },
    trends: {
      period: 'daily',
      data: [
        { period: '2024-01-15', totalRevenue: 2500, netRevenue: 2375, totalCommission: 125 },
        { period: '2024-01-16', totalRevenue: 3200, netRevenue: 3040, totalCommission: 160 },
        { period: '2024-01-17', totalRevenue: 2800, netRevenue: 2660, totalCommission: 140 },
        { period: '2024-01-18', totalRevenue: 3500, netRevenue: 3325, totalCommission: 175 },
        { period: '2024-01-19', totalRevenue: 4100, netRevenue: 3895, totalCommission: 205 }
      ]
    },
    daily: {
      data: [
        { date: '2024-01-15', orderCount: 5, totalItems: 12, totalRevenue: 2500, netRevenue: 2375, avgOrderValue: 500 },
        { date: '2024-01-16', orderCount: 6, totalItems: 15, totalRevenue: 3200, netRevenue: 3040, avgOrderValue: 533 },
        { date: '2024-01-17', orderCount: 5, totalItems: 11, totalRevenue: 2800, netRevenue: 2660, avgOrderValue: 560 },
        { date: '2024-01-18', orderCount: 7, totalItems: 18, totalRevenue: 3500, netRevenue: 3325, avgOrderValue: 500 },
        { date: '2024-01-19', orderCount: 8, totalItems: 22, totalRevenue: 4100, netRevenue: 3895, avgOrderValue: 513 }
      ]
    },
    byCategory: {
      data: [
        { category: 'Brake Parts', orderCount: 45, totalItems: 120, revenue: 25000 },
        { category: 'Engine Parts', orderCount: 38, totalItems: 95, revenue: 32000 },
        { category: 'Suspension', orderCount: 32, totalItems: 80, revenue: 28000 },
        { category: 'Electrical', orderCount: 28, totalItems: 70, revenue: 22000 },
        { category: 'Body Parts', orderCount: 25, totalItems: 62, revenue: 18000 }
      ]
    }
  };

  // Mock data for Products Report
  const mockProductsData = {
    summary: {
      totalProducts: 245,
      activeProducts: 220,
      lowStockCount: 15,
      totalStockValue: 85000
    },
    topProducts: [
      { productName: 'Toyota Camry Brake Pad Set', totalSold: 45, orderCount: 42, totalRevenue: 11250 },
      { productName: 'Honda Civic Air Filter', totalSold: 38, orderCount: 35, totalRevenue: 7600 },
      { productName: 'Ford Ranger Oil Filter', totalSold: 32, orderCount: 30, totalRevenue: 6400 },
      { productName: 'BMW X5 Spark Plugs', totalSold: 28, orderCount: 26, totalRevenue: 8400 },
      { productName: 'Chevrolet Silverado Brake Rotors', totalSold: 25, orderCount: 23, totalRevenue: 12500 }
    ],
    categoryPerformance: [
      { categoryName: 'Brake Parts', productCount: 45, totalSold: 120, totalRevenue: 25000, stockValue: 15000 },
      { categoryName: 'Engine Parts', productCount: 38, totalSold: 95, totalRevenue: 32000, stockValue: 22000 },
      { categoryName: 'Suspension', productCount: 32, totalSold: 80, totalRevenue: 28000, stockValue: 18000 },
      { categoryName: 'Electrical', productCount: 28, totalSold: 70, totalRevenue: 22000, stockValue: 12000 },
      { categoryName: 'Body Parts', productCount: 25, totalSold: 62, totalRevenue: 18000, stockValue: 10000 }
    ],
    products: [
      {
        inventoryId: '1',
        productName: 'Toyota Camry Brake Pad Set',
        oemPartNumber: '04465-0D110',
        category: 'Brake Parts',
        currentStock: 25,
        isLowStock: false,
        isOutOfStock: false,
        totalSold: 45,
        totalRevenue: 11250,
        isActive: true
      },
      {
        inventoryId: '2',
        productName: 'Honda Civic Air Filter',
        oemPartNumber: '17220-R40-A01',
        category: 'Engine Parts',
        currentStock: 8,
        isLowStock: true,
        isOutOfStock: false,
        totalSold: 38,
        totalRevenue: 7600,
        isActive: true
      },
      {
        inventoryId: '3',
        productName: 'Ford Ranger Oil Filter',
        oemPartNumber: 'FL-400S',
        category: 'Engine Parts',
        currentStock: 0,
        isLowStock: false,
        isOutOfStock: true,
        totalSold: 32,
        totalRevenue: 6400,
        isActive: true
      }
    ]
  };

  // Mock data for Financial Report
  const mockFinancialData = {
    profitability: {
      grossProfitMargin: 38.5,
      operatingMargin: 15.2,
      netProfitMargin: 12.8
    },
    cashFlow: {
      summary: {
        totalInflow: 145000,
        totalOutflow: 125000,
        netCashFlow: 20000
      },
      trends: [
        { date: '2024-01-15', inflow: 2500, outflow: 1800, net: 700 },
        { date: '2024-01-16', inflow: 3200, outflow: 2200, net: 1000 },
        { date: '2024-01-17', inflow: 2800, outflow: 1900, net: 900 },
        { date: '2024-01-18', inflow: 3500, outflow: 2400, net: 1100 },
        { date: '2024-01-19', inflow: 4100, outflow: 2800, net: 1300 }
      ],
      byType: {
        sales: 125000,
        expenses: 95000,
        commission: 6250,
        refunds: 6250,
        payouts: 125000
      }
    },
    incomeStatement: {
      revenue: {
        grossSales: 125000,
        returnsAndRefunds: 6250,
        netSales: 118750
      },
      costOfGoodsSold: {
        totalCOGS: 73000,
        grossProfit: 45750
      },
      operatingExpenses: {
        RENT: 8000,
        UTILITIES: 3200,
        WAGES: 25000,
        FUEL: 1800,
        MARKETING: 4500,
        EQUIPMENT: 1200,
        SUPPLIES: 800,
        MAINTENANCE: 600,
        INSURANCE: 2400,
        OTHER: 500,
        total: 47500
      },
      operatingIncome: -1750,
      otherIncomeExpenses: {
        platformFees: 11875,
        otherIncome: 500,
        otherExpenses: 200,
        total: -11575
      },
      netIncome: -13325
    },
    monthly: {
      data: [
        { month: '2023-10', revenue: 85000, expenses: 72000, netIncome: 13000 },
        { month: '2023-11', revenue: 92000, expenses: 78000, netIncome: 14000 },
        { month: '2023-12', revenue: 110000, expenses: 95000, netIncome: 15000 },
        { month: '2024-01', revenue: 125000, expenses: 105000, netIncome: 20000 }
      ]
    }
  };

  // Mock data for Returns Report
  const mockReturnsData = {
    summary: {
      totalRefunds: 6250,
      refundCount: 12,
      refundRate: 4.9,
      totalReturnRequests: 15
    },
    breakdown: {
      byReason: [
        { reason: 'DEFECTIVE', count: 5 },
        { reason: 'WRONG_PART', count: 4 },
        { reason: 'CHANGE_OF_MIND', count: 3 },
        { reason: 'DAMAGED', count: 2 },
        { reason: 'NOT_AS_DESCRIBED', count: 1 }
      ],
      byStatus: [
        { status: 'resolved', count: 10 },
        { status: 'pending', count: 3 },
        { status: 'open', count: 2 }
      ]
    },
    returnRequests: [
      {
        id: 'RET-001',
        orderNumber: 'ORD-001',
        requestType: 'RETURN',
        returnReason: 'DEFECTIVE',
        status: 'RESOLVED',
        faultClassification: 'SELLER_FAULT',
        orderAmount: 1250,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'RET-002',
        orderNumber: 'ORD-002',
        requestType: 'EXCHANGE',
        returnReason: 'WRONG_PART',
        status: 'RESOLVED',
        faultClassification: 'BUYER_FAULT',
        orderAmount: 890,
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 'RET-003',
        orderNumber: 'ORD-003',
        requestType: 'RETURN',
        returnReason: 'CHANGE_OF_MIND',
        status: 'PENDING',
        faultClassification: 'BUYER_FAULT',
        orderAmount: 2100,
        createdAt: '2024-01-17T09:15:00Z'
      }
    ],
    refunds: [
      {
        id: 'REF-001',
        date: '2024-01-16T11:00:00Z',
        description: 'Refund for defective brake pads',
        amount: 1250
      },
      {
        id: 'REF-002',
        date: '2024-01-17T16:30:00Z',
        description: 'Partial refund for wrong air filter',
        amount: 445
      }
    ],
    trends: [
      { date: '2024-01-15', returns: 2, refunds: 1 },
      { date: '2024-01-16', returns: 3, refunds: 2 },
      { date: '2024-01-17', returns: 1, refunds: 1 },
      { date: '2024-01-18', returns: 4, refunds: 3 },
      { date: '2024-01-19', returns: 2, refunds: 1 }
    ]
  };

  // Load Sales Report
  const loadSalesReport = async () => {
    setLoadingSales(true);
    setTimeout(() => {
      setSalesData(mockSalesData);
      setLoadingSales(false);
    }, 500);
  };

  // Load Products Report
  const loadProductsReport = async () => {
    setLoadingProducts(true);
    setTimeout(() => {
      setProductsData(mockProductsData);
      setLoadingProducts(false);
    }, 500);
  };

  // Load Financial Report
  const loadFinancialReport = async () => {
    setLoadingFinancial(true);
    setTimeout(() => {
      setFinancialData(mockFinancialData);
      setLoadingFinancial(false);
    }, 500);
  };

  // Load Returns Report
  const loadReturnsReport = async () => {
    setLoadingReturns(true);
    setTimeout(() => {
      setReturnsData(mockReturnsData);
      setLoadingReturns(false);
    }, 500);
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'sales') {
      loadSalesReport();
    } else if (activeTab === 'products') {
      loadProductsReport();
    } else if (activeTab === 'financial') {
      loadFinancialReport();
    } else if (activeTab === 'returns') {
      loadReturnsReport();
    }
  }, [activeTab]);

  // Reload when filters change
  useEffect(() => {
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
        return <Badge className="border-green-500/30 text-green-400 bg-green-500/5">Resolved</Badge>;
      case 'OPEN':
      case 'PENDING':
        return <Badge className="border-yellow-500/30 text-yellow-400 bg-yellow-500/5">Pending</Badge>;
      case 'CLOSED':
      case 'CANCELLED':
        return <Badge className="border-gray-500/30 text-gray-400 bg-gray-500/5">Closed</Badge>;
      default:
        return <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">{status}</Badge>;
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
        return <Badge className="border-red-500/30 text-red-400 bg-red-500/5">Seller Fault</Badge>;
      case 'BUYER_FAULT':
        return <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">Buyer Fault</Badge>;
      case 'NO_FAULT':
        return <Badge className="border-gray-500/30 text-gray-400 bg-gray-500/5">No Fault</Badge>;
      default:
        return <Badge className="border-muted text-muted-foreground bg-muted/30">{fault || 'Unknown'}</Badge>;
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

  // Simple Line Chart Component
  const SimpleLineChart = ({ data, dataKey, color = '#3b82f6', height = 300 }: any) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d: any) => d[dataKey] || 0));
    const minValue = Math.min(...data.map((d: any) => d[dataKey] || 0));
    const range = maxValue - minValue || 1;

    const points = data.map((d: any, i: number) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d[dataKey] - minValue) / range) * 80; // 80% height for chart
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />

          {/* Data points */}
          {data.map((d: any, i: number) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d[dataKey] - minValue) / range) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, dataKey, color = '#3b82f6', height = 300 }: any) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d: any) => d[dataKey] || 0));
    const barWidth = 100 / data.length;

    return (
      <div className="w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="barGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#barGrid)" />

          {/* Bars */}
          {data.map((d: any, i: number) => {
            const barHeight = maxValue > 0 ? (d[dataKey] / maxValue) * 80 : 0; // 80% height for chart
            const x = i * barWidth + barWidth * 0.1;
            const y = 100 - barHeight;
            const width = barWidth * 0.8;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={color}
                rx="0.5"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // Simple Pie Chart Component
  const SimplePieChart = ({ data, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], height = 300 }: any) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
    let currentAngle = -90; // Start from top

    return (
      <div className="w-full flex justify-center" style={{ height }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {data.map((item: any, index: number) => {
            const percentage = total > 0 ? item.value / total : 0;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Convert angles to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            // Calculate path
            const x1 = 100 + 80 * Math.cos(startRad);
            const y1 = 100 + 80 * Math.sin(startRad);
            const x2 = 100 + 80 * Math.cos(endRad);
            const y2 = 100 + 80 * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle = endAngle;

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            );
          })}
          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="40" fill="rgba(0,0,0,0.5)" />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Comprehensive business intelligence and performance analytics
            </p>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="glass-card border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-foreground">Start Date:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40 border-border bg-background text-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-foreground">End Date:</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40 border-border bg-background text-foreground"
              />
            </div>
            {activeTab === 'sales' && (
              <div className="flex items-center gap-2">
                <Label className="text-foreground">Period:</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32 border-border bg-background text-foreground">
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
              className="border-border text-foreground hover:bg-accent/10"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/30 border border-border p-1">
          <TabsTrigger value="sales" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2" />
            Products Report
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Financial Report
          </TabsTrigger>
          <TabsTrigger value="returns" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Returns Report
          </TabsTrigger>
        </TabsList>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Sales Report
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadSalesReport}
                  disabled={loadingSales}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingSales ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : salesData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  {salesData.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{salesData.summary.totalOrders || 0}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold text-accent mt-1">{formatUSD(salesData.summary.totalRevenue || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                          <p className="text-2xl font-bold text-accent mt-1">{formatUSD(salesData.summary.netRevenue || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{formatUSD(salesData.summary.avgOrderValue || 0)}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Breakdown */}
                  {salesData.breakdown && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="glass-card border border-border">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">Orders by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {salesData.breakdown.byStatus && Object.entries(salesData.breakdown.byStatus).map(([status, count]: [string, any]) => (
                              <div key={status} className="flex justify-between items-center">
                                <span className="text-sm text-foreground capitalize">{status}</span>
                                <span className="font-semibold text-foreground">{count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">Orders by Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {salesData.breakdown.byPayment && Object.entries(salesData.breakdown.byPayment).map(([payment, count]: [string, any]) => (
                              <div key={payment} className="flex justify-between items-center">
                                <span className="text-sm text-foreground capitalize">{payment}</span>
                                <span className="font-semibold text-foreground">{count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Revenue Trends Chart */}
                  {salesData.trends && salesData.trends.data && salesData.trends.data.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Revenue Trends ({salesData.trends.period})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <SimpleLineChart
                            data={salesData.trends.data}
                            dataKey="totalRevenue"
                            color="#10b981"
                            height={250}
                          />
                          <div className="flex justify-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                              <span className="text-muted-foreground">Total Revenue</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                              <span className="text-muted-foreground">Net Revenue</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                              <span className="text-muted-foreground">Commission</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Daily Sales Bar Chart */}
                  {salesData.daily && salesData.daily.data && salesData.daily.data.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Daily Sales Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <SimpleBarChart
                            data={salesData.daily.data}
                            dataKey="orderCount"
                            color="#3b82f6"
                            height={250}
                          />
                          <div className="flex justify-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                              <span className="text-muted-foreground">Orders</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                              <span className="text-muted-foreground">Items Sold</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sales by Category Bar Chart */}
                  {salesData.byCategory && salesData.byCategory.data && salesData.byCategory.data.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Sales by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <SimpleBarChart
                            data={salesData.byCategory.data}
                            dataKey="orderCount"
                            color="#8b5cf6"
                            height={250}
                          />
                          <div className="text-center text-sm text-muted-foreground">
                            Orders by Product Category
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Orders by Status Pie Chart */}
                  {salesData.breakdown && salesData.breakdown.byStatus && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Orders by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <SimplePieChart
                            data={formatBreakdownForPie(salesData.breakdown.byStatus)}
                            colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
                            height={250}
                          />
                          <div className="flex flex-col justify-center space-y-3">
                            {Object.entries(salesData.breakdown.byStatus).map(([status, count]: [string, any], index: number) => (
                              <div key={status} className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4] }}
                                  ></div>
                                  <span className="text-sm text-foreground capitalize">{status}</span>
                                </div>
                                <span className="font-semibold text-foreground">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Orders by Payment Pie Chart */}
                  {salesData.breakdown && salesData.breakdown.byPayment && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Orders by Payment Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <SimplePieChart
                            data={formatBreakdownForPie(salesData.breakdown.byPayment)}
                            colors={['#10b981', '#f59e0b', '#ef4444', '#6b7280']}
                            height={250}
                          />
                          <div className="flex flex-col justify-center space-y-3">
                            {Object.entries(salesData.breakdown.byPayment).map(([payment, count]: [string, any], index: number) => (
                              <div key={payment} className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'][index % 4] }}
                                  ></div>
                                  <span className="text-sm text-foreground capitalize">{payment}</span>
                                </div>
                                <span className="font-semibold text-foreground">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Report Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Package className="w-5 h-5" />
                  Products Report
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadProductsReport}
                  disabled={loadingProducts}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingProducts ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : productsData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  {productsData.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{productsData.summary.totalProducts || 0}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                          <p className="text-2xl font-bold text-accent mt-1">{productsData.summary.activeProducts || 0}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                          <p className="text-2xl font-bold text-yellow-400 mt-1">{productsData.summary.lowStockCount || 0}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{formatUSD(productsData.summary.totalStockValue || 0)}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Top Products */}
                  {productsData.topProducts && productsData.topProducts.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Top Products by Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-foreground">Product Name</TableHead>
                              <TableHead className="text-right text-foreground">Total Sold</TableHead>
                              <TableHead className="text-right text-foreground">Orders</TableHead>
                              <TableHead className="text-right text-foreground">Total Revenue</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productsData.topProducts.map((product: any, index: number) => (
                              <TableRow key={product.inventoryId || index}>
                                <TableCell className="text-foreground font-medium">{product.productName || 'N/A'}</TableCell>
                                <TableCell className="text-right text-foreground">{product.totalSold || 0}</TableCell>
                                <TableCell className="text-right text-foreground">{product.orderCount || 0}</TableCell>
                                <TableCell className="text-right font-semibold text-foreground">{formatUSD(product.totalRevenue || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category Performance */}
                  {productsData.categoryPerformance && productsData.categoryPerformance.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Category Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-foreground">Category</TableHead>
                              <TableHead className="text-right text-foreground">Products</TableHead>
                              <TableHead className="text-right text-foreground">Total Sold</TableHead>
                              <TableHead className="text-right text-foreground">Revenue</TableHead>
                              <TableHead className="text-right text-foreground">Stock Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productsData.categoryPerformance.map((category: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="text-foreground font-medium">{category.categoryName || 'N/A'}</TableCell>
                                <TableCell className="text-right text-foreground">{category.productCount || 0}</TableCell>
                                <TableCell className="text-right text-foreground">{category.totalSold || 0}</TableCell>
                                <TableCell className="text-right font-semibold text-foreground">{formatUSD(category.totalRevenue || 0)}</TableCell>
                                <TableCell className="text-right text-foreground">{formatUSD(category.stockValue || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Products Table */}
                  {productsData.products && productsData.products.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">All Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                          Showing {productsData.products.length} products
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-foreground">Product</TableHead>
                                <TableHead className="text-foreground">Category</TableHead>
                                <TableHead className="text-right text-foreground">Stock</TableHead>
                                <TableHead className="text-right text-foreground">Sold</TableHead>
                                <TableHead className="text-right text-foreground">Revenue</TableHead>
                                <TableHead className="text-foreground">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productsData.products.slice(0, 50).map((product: any) => (
                                <TableRow key={product.inventoryId}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium text-foreground">{product.productName || 'N/A'}</div>
                                      <div className="text-xs text-muted-foreground">{product.oemPartNumber || '-'}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-foreground">{product.category || '-'}</TableCell>
                                  <TableCell className="text-right">
                                    {product.isOutOfStock ? (
                                      <Badge className="border-red-500/30 text-red-400 bg-red-500/5">Out of Stock</Badge>
                                    ) : product.isLowStock ? (
                                      <Badge className="border-yellow-500/30 text-yellow-400 bg-yellow-500/5">{product.currentStock}</Badge>
                                    ) : (
                                      <span className="text-foreground">{product.currentStock || 0}</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right text-foreground">{product.totalSold || 0}</TableCell>
                                  <TableCell className="text-right font-semibold text-foreground">{formatUSD(product.totalRevenue || 0)}</TableCell>
                                  <TableCell>
                                    {product.isActive ? (
                                      <Badge className="border-accent/30 text-accent bg-accent/5">Active</Badge>
                                    ) : (
                                      <Badge className="border-muted text-muted-foreground bg-muted/30">Inactive</Badge>
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
                <div className="text-center py-12 text-muted-foreground">
                  No products data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Report Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <DollarSign className="w-5 h-5" />
                  Financial Report
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadFinancialReport}
                  disabled={loadingFinancial}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingFinancial ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingFinancial ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : financialData ? (
                <div className="space-y-6">
                  {/* Profitability Metrics */}
                  {financialData.profitability && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Gross Profit Margin</p>
                          <p className="text-2xl font-bold text-accent mt-1">
                            {financialData.profitability.grossProfitMargin?.toFixed(2) || '0.00'}%
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Operating Margin</p>
                          <p className="text-2xl font-bold text-accent mt-1">
                            {financialData.profitability.operatingMargin?.toFixed(2) || '0.00'}%
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Net Profit Margin</p>
                          <p className="text-2xl font-bold text-accent mt-1">
                            {financialData.profitability.netProfitMargin?.toFixed(2) || '0.00'}%
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Cash Flow Summary */}
                  {financialData.cashFlow && financialData.cashFlow.summary && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Cash Flow Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Inflow</p>
                            <p className="text-xl font-bold text-accent">{formatUSD(financialData.cashFlow.summary.totalInflow || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Outflow</p>
                            <p className="text-xl font-bold text-red-400">{formatUSD(financialData.cashFlow.summary.totalOutflow || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                            <p className={`text-xl font-bold ${(financialData.cashFlow.summary.netCashFlow || 0) >= 0 ? 'text-accent' : 'text-red-400'}`}>
                              {formatUSD(financialData.cashFlow.summary.netCashFlow || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <SimpleLineChart
                            data={financialData.cashFlow.trends}
                            dataKey="net"
                            color="#3b82f6"
                            height={200}
                          />
                          <div className="flex justify-center space-x-6 text-sm mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                              <span className="text-muted-foreground">Inflow</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                              <span className="text-muted-foreground">Outflow</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                              <span className="text-muted-foreground">Net Cash Flow</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Income Statement */}
                  {financialData.incomeStatement && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Income Statement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Revenue Section */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Revenue</h4>
                            <div className="ml-4 space-y-1">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-foreground">Gross Sales</span>
                                <span className="font-medium text-foreground">{formatUSD(financialData.incomeStatement.revenue?.grossSales || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground text-sm">Less: Returns and Refunds</span>
                                <span className="text-muted-foreground text-sm">({formatUSD(financialData.incomeStatement.revenue?.returnsAndRefunds || 0)})</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                                <span className="font-semibold text-foreground">Net Sales</span>
                                <span className="font-bold text-foreground">{formatUSD(financialData.incomeStatement.revenue?.netSales || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* COGS Section */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Cost of Goods Sold</h4>
                            <div className="ml-4 space-y-1">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-foreground">Total COGS</span>
                                <span className="font-medium text-foreground">{formatUSD(financialData.incomeStatement.costOfGoodsSold?.totalCOGS || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                                <span className="font-semibold text-foreground">Gross Profit</span>
                                <span className="font-bold text-foreground">{formatUSD(financialData.incomeStatement.costOfGoodsSold?.grossProfit || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Operating Expenses */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Operating Expenses</h4>
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
                                    <span className="text-foreground">{categoryLabels[key] || key}</span>
                                    <span className="font-medium text-foreground">{formatUSD(value || 0)}</span>
                                  </div>
                                );
                              })}
                              <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                                <span className="font-semibold text-foreground">Total Operating Expenses</span>
                                <span className="font-bold text-foreground">{formatUSD(financialData.incomeStatement.operatingExpenses?.total || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Operating Income */}
                          <div className="flex justify-between items-center py-3 border-t-2 border-border mt-2 pt-3">
                            <span className="font-bold text-lg text-foreground">Operating Income</span>
                            <span className="font-bold text-lg text-foreground">{formatUSD(financialData.incomeStatement.operatingIncome || 0)}</span>
                          </div>

                          {/* Other Income/Expenses */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Other Income / Expenses</h4>
                            <div className="ml-4 space-y-1">
                              {financialData.incomeStatement.otherIncomeExpenses?.platformFees > 0 && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-foreground">Platform Fees</span>
                                  <span className="font-medium text-red-400">({formatUSD(financialData.incomeStatement.otherIncomeExpenses.platformFees)})</span>
                                </div>
                              )}
                              {financialData.incomeStatement.otherIncomeExpenses?.otherIncome > 0 && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-foreground">Other Income</span>
                                  <span className="font-medium text-accent">{formatUSD(financialData.incomeStatement.otherIncomeExpenses.otherIncome)}</span>
                                </div>
                              )}
                              {financialData.incomeStatement.otherIncomeExpenses?.otherExpenses > 0 && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-foreground">Other Expenses</span>
                                  <span className="font-medium text-red-400">({formatUSD(financialData.incomeStatement.otherIncomeExpenses.otherExpenses)})</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                                <span className="font-semibold text-foreground">Total Other Income / Expenses</span>
                                <span className={`font-bold ${(financialData.incomeStatement.otherIncomeExpenses?.total || 0) >= 0 ? 'text-accent' : 'text-red-400'}`}>
                                  {formatUSD(financialData.incomeStatement.otherIncomeExpenses?.total || 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Net Income */}
                          <div className={`flex justify-between items-center py-4 border-t-2 border-border mt-4 pt-4 ${(financialData.incomeStatement.netIncome || 0) >= 0 ? 'bg-accent/5' : 'bg-red-500/5'} rounded-lg px-4`}>
                            <span className="font-bold text-xl text-foreground">Net Income</span>
                            <span className={`font-bold text-2xl ${(financialData.incomeStatement.netIncome || 0) >= 0 ? 'text-accent' : 'text-red-400'}`}>
                              {formatUSD(financialData.incomeStatement.netIncome || 0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Profit Trends */}
                  {financialData.profit?.trends && financialData.profit.trends.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Profit Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SimpleLineChart
                          data={financialData.profit.trends}
                          dataKey="profit"
                          color="#10b981"
                          height={200}
                        />
                        <div className="flex justify-center space-x-4 text-sm mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                            <span className="text-muted-foreground">Profit</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Monthly Summary Bar Chart */}
                  {financialData.monthly?.data && financialData.monthly.data.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Monthly Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SimpleBarChart
                          data={financialData.monthly.data}
                          dataKey="revenue"
                          color="#8b5cf6"
                          height={200}
                        />
                        <div className="flex justify-center space-x-4 text-sm mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#8b5cf6] rounded-full"></div>
                            <span className="text-muted-foreground">Revenue</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                            <span className="text-muted-foreground">Expenses</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                            <span className="text-muted-foreground">Net Income</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No financial data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Report Tab */}
        <TabsContent value="returns" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <RotateCcw className="w-5 h-5" />
                  Returns Report
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadReturnsReport}
                  disabled={loadingReturns}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingReturns ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingReturns ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : returnsData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  {returnsData.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
                          <p className="text-2xl font-bold text-red-400 mt-1">{formatUSD(returnsData.summary.totalRefunds || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Refund Count</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{returnsData.summary.refundCount || 0}</p>
                        </CardContent>
                      </Card>
                      <Card className={`${(returnsData.summary.refundRate || 0) > 5 ? 'glass-card border-red-500/30' : 'glass-card border border-border'}`}>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Refund Rate</p>
                          <p className={`text-2xl font-bold mt-1 ${(returnsData.summary.refundRate || 0) > 5 ? 'text-red-400' : 'text-foreground'}`}>
                            {returnsData.summary.refundRate?.toFixed(2) || '0.00'}%
                          </p>
                          {(returnsData.summary.refundRate || 0) > 5 && (
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-1" />
                          )}
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-border">
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-muted-foreground">Return Requests</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{returnsData.summary.totalReturnRequests || 0}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Breakdown */}
                  {returnsData.breakdown && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {returnsData.breakdown.byReason && returnsData.breakdown.byReason.length > 0 && (
                        <Card className="glass-card border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg text-foreground">Returns by Reason</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {returnsData.breakdown.byReason.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-foreground">{getReturnReasonLabel(item.reason)}</span>
                                  <span className="font-semibold text-foreground">{item.count || 0}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {returnsData.breakdown.byStatus && returnsData.breakdown.byStatus.length > 0 && (
                        <Card className="glass-card border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg text-foreground">Returns by Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {returnsData.breakdown.byStatus.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-foreground capitalize">{item.status}</span>
                                  <span className="font-semibold text-foreground">{item.count || 0}</span>
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
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Return Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-foreground">Order Number</TableHead>
                                <TableHead className="text-foreground">Type</TableHead>
                                <TableHead className="text-foreground">Reason</TableHead>
                                <TableHead className="text-foreground">Status</TableHead>
                                <TableHead className="text-foreground">Fault</TableHead>
                                <TableHead className="text-foreground">Amount</TableHead>
                                <TableHead className="text-foreground">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {returnsData.returnRequests.map((request: any) => (
                                <TableRow key={request.id}>
                                  <TableCell className="text-foreground font-medium">{request.orderNumber || 'N/A'}</TableCell>
                                  <TableCell>
                                    <Badge className={request.requestType === 'RETURN' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-blue-500/30 text-blue-400 bg-blue-500/5'}>
                                      {request.requestType || 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-foreground">{getReturnReasonLabel(request.returnReason)}</TableCell>
                                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                                  <TableCell>{getFaultBadge(request.faultClassification)}</TableCell>
                                  <TableCell className="text-foreground font-semibold">{formatUSD(request.orderAmount || 0)}</TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
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
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Refund Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-foreground">Date</TableHead>
                              <TableHead className="text-foreground">Description</TableHead>
                              <TableHead className="text-right text-foreground">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {returnsData.refunds.map((refund: any) => (
                              <TableRow key={refund.id}>
                                <TableCell className="text-foreground">{refund.date ? formatDateWithTime(refund.date) : '-'}</TableCell>
                                <TableCell className="text-foreground">{refund.description || '-'}</TableCell>
                                <TableCell className="text-right font-semibold text-red-400">{formatUSD(refund.amount || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Refund Trends Chart */}
                  {returnsData.trends && returnsData.trends.length > 0 && (
                    <Card className="glass-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">Refund Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                          {returnsData.trends.length} days of refund data
                        </div>
                        <SimpleLineChart
                          data={returnsData.trends}
                          dataKey="refunds"
                          color="#ef4444"
                          height={200}
                        />
                        <div className="flex justify-center space-x-4 text-sm mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                            <span className="text-muted-foreground">Refunds</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#f59e0b] rounded-full"></div>
                            <span className="text-muted-foreground">Returns</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No returns data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}