// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, RefreshCw, Calendar, TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatDateWithTime } from "@/lib/date";
import { formatUSD } from "@/lib/currency";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
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

export default function Page() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'summary'>('pending');
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [summaryDays, setSummaryDays] = useState(30);
  const { accessToken } = useSellerAuth();

  // Load pending payouts
  const loadPendingPayouts = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiClient.request<{
        success: boolean;
        data?: {
          summary: {
            totalPaid: number;
            totalPlatformFee: number;
            totalSellerAmount: number;
            totalPaidOut: number;
            pendingAmount: number;
            ordersCount: number;
          };
          orders: Array<{
            orderId: string;
            orderNumber: string;
            paidAmount: number;
            platformCommission: number;
            sellerNetAmount: number;
            paidOutAmount: number;
            pendingAmount: number;
            currency: string;
            paymentDate: string;
            deliveredDate: string;
          }>;
        };
      }>('/api/seller/payouts/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setPendingData(response.data);
      }
    } catch (err) {
      console.error("Failed to load pending payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load payout history
  const loadPayoutHistory = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: historyPage.toString(),
        limit: '20',
      });
      if (historyStatusFilter !== 'all') {
        params.append('status', historyStatusFilter);
      }

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          payouts: Array<{
            id: string;
            order: {
              id: string;
              orderNumber: string;
              totalAmount: number;
              currency: string;
              deliveredDate: string;
            };
            payout: {
              grossAmount: number;
              platformCommission: number;
              gatewayFee: number;
              netAmount: number;
              currency: string;
              status: string;
            };
            payment: {
              scheduledDate: string;
              processedDate?: string;
              bankReference?: string;
            };
            createdAt: string;
            updatedAt: string;
          }>;
          summary: {
            totalPayouts: number;
            completedCount: number;
            processingCount: number;
            totalRecords: number;
          };
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
      }>(`/api/seller/payouts/history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setHistoryData(response.data);
      }
    } catch (err) {
      console.error("Failed to load payout history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load payout summary
  const loadPayoutSummary = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiClient.request<{
        success: boolean;
        data?: {
          summary: {
            totalPaid: number;
            totalPlatformFee: number;
            totalSellerAmount: number;
            totalPaidOut: number;
            pendingAmount: number;
            ordersCount: number;
            completedOrders: number;
            pendingOrders: number;
          };
          recentPayouts: Array<{
            id: string;
            amount: number;
            status: string;
            processedDate: string;
            bankReference?: string;
          }>;
          period: string;
        };
      }>(`/api/seller/payouts/summary?days=${summaryDays}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setSummaryData(response.data);
      }
    } catch (err) {
      console.error("Failed to load payout summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      if (activeTab === 'pending') {
        loadPendingPayouts();
      } else if (activeTab === 'history') {
        loadPayoutHistory();
      } else if (activeTab === 'summary') {
        loadPayoutSummary();
      }
    }
  }, [accessToken, activeTab, historyPage, historyStatusFilter, summaryDays]);

  if (loading && !pendingData && !historyData && !summaryData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                <p className="text-gray-600">Loading your payments...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                Payments
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
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
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Payouts
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatUSD(pendingData.summary.totalPaid)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">From {pendingData.summary.ordersCount} orders</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Platform Fees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatUSD(pendingData.summary.totalPlatformFee)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total commission</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatUSD(pendingData.summary.pendingAmount)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting payout</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {pendingData?.orders && pendingData.orders.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Payout Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order #</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paid Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Platform Fee</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Net Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Pending</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {pendingData.orders.map((order: any) => (
                              <tr key={order.orderId} className="hover:bg-blue-50 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-gray-900">#{order.orderNumber}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatUSD(order.paidAmount)} {order.currency}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600">
                                    {formatUSD(order.platformCommission)}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatUSD(order.sellerNetAmount)}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-orange-600">
                                    {formatUSD(order.pendingAmount)}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
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
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-3">No pending payouts</div>
                      <div className="text-gray-600">All payments have been processed</div>
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
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={historyStatusFilter}
                      onChange={(e) => {
                        setHistoryStatusFilter(e.target.value);
                        setHistoryPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>

                {historyData?.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Payouts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatUSD(historyData.summary.totalPayouts)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                          {historyData.summary.completedCount}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {historyData.summary.processingCount}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {historyData?.payouts && historyData.payouts.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payout History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {historyData.payouts.map((payout: any) => (
                          <div key={payout.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-semibold text-gray-900">
                                    Order #{payout.order.orderNumber}
                                  </div>
                                  <Badge className={getStatusColor(payout.payout.status)}>
                                    {getStatusIcon(payout.payout.status)}
                                    <span className="ml-1">{payout.payout.status}</span>
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-600">Gross Amount</div>
                                    <div className="font-medium text-gray-900">{formatUSD(payout.payout.grossAmount)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Platform Fee</div>
                                    <div className="font-medium text-gray-900">{formatUSD(payout.payout.platformCommission)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Net Amount</div>
                                    <div className="font-semibold text-emerald-600">{formatUSD(payout.payout.netAmount)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Processed</div>
                                    <div className="font-medium text-gray-900">
                                      {payout.payment.processedDate ? formatDateWithTime(payout.payment.processedDate) : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                {payout.payment.bankReference && (
                                  <div className="text-xs text-gray-500">
                                    Bank Reference: {payout.payment.bankReference}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {historyData.pagination && historyData.pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Page {historyData.pagination.page} of {historyData.pagination.pages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                              disabled={historyPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistoryPage(p => Math.min(historyData.pagination.pages, p + 1))}
                              disabled={historyPage === historyData.pagination.pages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-3">No payout history</div>
                      <div className="text-gray-600">No payouts found for the selected filters</div>
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
                    <label className="text-sm font-medium text-gray-700">Period:</label>
                    <select
                      value={summaryDays}
                      onChange={(e) => setSummaryDays(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={7}>Last 7 days</option>
                      <option value={30}>Last 30 days</option>
                      <option value={90}>Last 90 days</option>
                      <option value={365}>Last year</option>
                    </select>
                  </div>
                </div>

                {summaryData?.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatUSD(summaryData.summary.totalPaid)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{summaryData.period}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Platform Fees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatUSD(summaryData.summary.totalPlatformFee)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total commission</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Paid Out</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatUSD(summaryData.summary.totalPaidOut)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Received</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatUSD(summaryData.summary.pendingAmount)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting payout</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {summaryData?.recentPayouts && summaryData.recentPayouts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {summaryData.recentPayouts.map((payout: any) => (
                          <div key={payout.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(payout.status)}>
                                {getStatusIcon(payout.status)}
                                <span className="ml-1">{payout.status}</span>
                              </Badge>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{formatUSD(payout.amount)}</div>
                                {payout.bankReference && (
                                  <div className="text-xs text-gray-500">Ref: {payout.bankReference}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
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
    </DashboardLayout>
  );
}
















