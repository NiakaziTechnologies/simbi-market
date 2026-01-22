"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, RefreshCw, Calendar, TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "PENDING":
      return "border-yellow-500/30 text-yellow-400 bg-yellow-500/5";
    case "PROCESSING":
      return "border-blue-500/30 text-blue-400 bg-blue-500/5";
    case "COMPLETED":
      return "border-green-500/30 text-green-400 bg-green-500/5";
    case "FAILED":
      return "border-red-500/30 text-red-400 bg-red-500/5";
    default:
      return "border-muted text-muted-foreground bg-muted/30";
  }
};

const getStatusIcon = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "PENDING":
      return <Clock className="h-3 w-3" />;
    case "PROCESSING":
      return <AlertCircle className="h-3 w-3" />;
    case "COMPLETED":
      return <CheckCircle2 className="h-3 w-3" />;
    case "FAILED":
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

// Mock data
const mockPendingData = {
  summary: {
    totalPaid: 12500,
    totalPlatformFee: 1250,
    totalSellerAmount: 11250,
    totalPaidOut: 10000,
    pendingAmount: 1250,
    ordersCount: 25
  },
  orders: [
    {
      orderId: "ORD-001",
      orderNumber: "ORD-001",
      paidAmount: 1250,
      platformCommission: 125,
      sellerNetAmount: 1125,
      paidOutAmount: 1000,
      pendingAmount: 125,
      currency: "USD",
      paymentDate: "2024-01-15T10:30:00Z",
      deliveredDate: "2024-01-16T14:20:00Z"
    },
    {
      orderId: "ORD-002",
      orderNumber: "ORD-002",
      paidAmount: 890,
      platformCommission: 89,
      sellerNetAmount: 801,
      paidOutAmount: 801,
      pendingAmount: 0,
      currency: "USD",
      paymentDate: "2024-01-14T15:45:00Z",
      deliveredDate: "2024-01-15T09:15:00Z"
    }
  ]
};

const mockHistoryData = {
  payouts: [
    {
      id: "PYT-001",
      order: {
        id: "ORD-001",
        orderNumber: "ORD-001",
        totalAmount: 1250,
        currency: "USD",
        deliveredDate: "2024-01-16T14:20:00Z"
      },
      payout: {
        grossAmount: 1250,
        platformCommission: 125,
        gatewayFee: 25,
        netAmount: 1100,
        currency: "USD",
        status: "COMPLETED"
      },
      payment: {
        scheduledDate: "2024-01-17T00:00:00Z",
        processedDate: "2024-01-17T10:30:00Z",
        bankReference: "REF123456"
      },
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-17T10:30:00Z"
    },
    {
      id: "PYT-002",
      order: {
        id: "ORD-002",
        orderNumber: "ORD-002",
        totalAmount: 890,
        currency: "USD",
        deliveredDate: "2024-01-15T09:15:00Z"
      },
      payout: {
        grossAmount: 890,
        platformCommission: 89,
        gatewayFee: 18,
        netAmount: 783,
        currency: "USD",
        status: "COMPLETED"
      },
      payment: {
        scheduledDate: "2024-01-16T00:00:00Z",
        processedDate: "2024-01-16T08:45:00Z",
        bankReference: "REF123457"
      },
      createdAt: "2024-01-15T09:15:00Z",
      updatedAt: "2024-01-16T08:45:00Z"
    }
  ],
  summary: {
    totalPayouts: 2340,
    completedCount: 15,
    processingCount: 2,
    totalRecords: 17
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 17,
    pages: 1
  }
};

const mockSummaryData = {
  summary: {
    totalPaid: 25000,
    totalPlatformFee: 2500,
    totalSellerAmount: 22500,
    totalPaidOut: 21000,
    pendingAmount: 1500,
    ordersCount: 50,
    completedOrders: 45,
    pendingOrders: 5
  },
  recentPayouts: [
    {
      id: "PYT-001",
      amount: 1100,
      status: "COMPLETED",
      processedDate: "2024-01-17T10:30:00Z",
      bankReference: "REF123456"
    },
    {
      id: "PYT-002",
      amount: 783,
      status: "COMPLETED",
      processedDate: "2024-01-16T08:45:00Z",
      bankReference: "REF123457"
    }
  ],
  period: "Last 30 days"
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'summary'>('pending');
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [summaryDays, setSummaryDays] = useState(30);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingPayouts();
    } else if (activeTab === 'history') {
      loadPayoutHistory();
    } else if (activeTab === 'summary') {
      loadPayoutSummary();
    }
  }, [activeTab, historyPage, historyStatusFilter, summaryDays]);

  const loadPendingPayouts = async () => {
    setLoading(true);
    setTimeout(() => {
      setPendingData(mockPendingData);
      setLoading(false);
    }, 500);
  };

  const loadPayoutHistory = async () => {
    setLoading(true);
    setTimeout(() => {
      setHistoryData(mockHistoryData);
      setLoading(false);
    }, 500);
  };

  const loadPayoutSummary = async () => {
    setLoading(true);
    setTimeout(() => {
      setSummaryData(mockSummaryData);
      setLoading(false);
    }, 500);
  };

  if (loading && !pendingData && !historyData && !summaryData) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Payments</h1>
              <p className="text-muted-foreground">Loading your payments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              Payments
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              View your pending payouts, payment history, and earnings summary
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === 'pending') loadPendingPayouts();
                else if (activeTab === 'history') loadPayoutHistory();
                else if (activeTab === 'summary') loadPayoutSummary();
              }}
              className="border-border text-foreground hover:bg-accent/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card border border-border">
        <div className="border-b border-border">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending Payouts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Summary
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Pending Payouts Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              {pendingData?.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatUSD(pendingData.summary.totalPaid)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">From {pendingData.summary.ordersCount} orders</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Platform Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatUSD(pendingData.summary.totalPlatformFee)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total commission</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-accent">
                        {formatUSD(pendingData.summary.pendingAmount)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {pendingData?.orders && pendingData.orders.length > 0 ? (
                <Card className="glass-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Pending Payout Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order #</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Fee</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {pendingData.orders.map((order: any) => (
                            <tr key={order.orderId} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-foreground">#{order.orderNumber}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-foreground">
                                  {formatUSD(order.paidAmount)} {order.currency}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-muted-foreground">
                                  {formatUSD(order.platformCommission)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-foreground">
                                  {formatUSD(order.sellerNetAmount)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-accent">
                                  {formatUSD(order.pendingAmount)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {formatDateWithTime(order.paymentDate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card border border-border">
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Wallet className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-xl font-bold text-foreground mb-3">No pending payouts</div>
                    <div className="text-muted-foreground">All payments have been processed</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Status:</label>
                  <Select value={historyStatusFilter} onValueChange={(value) => {
                    setHistoryStatusFilter(value);
                    setHistoryPage(1);
                  }}>
                    <SelectTrigger className="w-40 bg-background border-border">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {historyData?.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatUSD(historyData.summary.totalPayouts)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-accent">
                        {historyData.summary.completedCount}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-400">
                        {historyData.summary.processingCount}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {historyData?.payouts && historyData.payouts.length > 0 ? (
                <Card className="glass-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Payout History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {historyData.payouts.map((payout: any) => (
                        <div key={payout.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-semibold text-foreground">
                                  Order #{payout.order.orderNumber}
                                </div>
                                <Badge className={getStatusColor(payout.payout.status)}>
                                  {getStatusIcon(payout.payout.status)}
                                  <span className="ml-1">{payout.payout.status}</span>
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Gross Amount</div>
                                  <div className="font-medium text-foreground">{formatUSD(payout.payout.grossAmount)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Platform Fee</div>
                                  <div className="font-medium text-foreground">{formatUSD(payout.payout.platformCommission)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Net Amount</div>
                                  <div className="font-semibold text-accent">{formatUSD(payout.payout.netAmount)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Processed</div>
                                  <div className="font-medium text-foreground">
                                    {payout.payment.processedDate ? formatDateWithTime(payout.payment.processedDate) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              {payout.payment.bankReference && (
                                <div className="text-xs text-muted-foreground">
                                  Bank Reference: {payout.payment.bankReference}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card border border-border">
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Wallet className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-xl font-bold text-foreground mb-3">No payout history</div>
                    <div className="text-muted-foreground">No payouts found for the selected filters</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Period:</label>
                  <Select value={summaryDays.toString()} onValueChange={(value) => setSummaryDays(Number(value))}>
                    <SelectTrigger className="w-40 bg-background border-border">
                      <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {summaryData?.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatUSD(summaryData.summary.totalPaid)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{summaryData.period}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Platform Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatUSD(summaryData.summary.totalPlatformFee)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total commission</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid Out</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-accent">
                        {formatUSD(summaryData.summary.totalPaidOut)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Received</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-400">
                        {formatUSD(summaryData.summary.pendingAmount)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {summaryData?.recentPayouts && summaryData.recentPayouts.length > 0 && (
                <Card className="glass-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Recent Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summaryData.recentPayouts.map((payout: any) => (
                        <div key={payout.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(payout.status)}>
                              {getStatusIcon(payout.status)}
                              <span className="ml-1">{payout.status}</span>
                            </Badge>
                            <div>
                              <div className="text-sm font-medium text-foreground">{formatUSD(payout.amount)}</div>
                              {payout.bankReference && (
                                <div className="text-xs text-muted-foreground">Ref: {payout.bankReference}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateWithTime(payout.processedDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}