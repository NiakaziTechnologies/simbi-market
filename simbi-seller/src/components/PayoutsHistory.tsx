// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { formatUSD } from "@/lib/currency";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import {
  ArrowUpDown,
  RefreshCw,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingDown,
  Package,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

export default function PayoutsHistory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<'date'|'amount'>('date');
  const [dir, setDir] = useState<'asc'|'desc'>('desc');
  const [lossesData, setLossesData] = useState<any>(null);
  const { accessToken } = useSellerAuth();

  useEffect(() => {
    loadPayouts();
  }, [accessToken]);

  const loadPayouts = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.request<{ success: boolean; message: string; data?: { ledger: any[] } }>(
        '/accounting/ledger',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (data.success && data.data?.ledger) {
        // Transform ledger data to payout format
        const payouts = data.data.ledger
          .filter((entry: any) => entry.type === 'SALE')
          .map((entry: any) => ({
            id: entry.id,
            amount: entry.amountUSD,
            date: entry.transactionDate,
            status: 'completed',
            method: 'Bank Transfer'
          }));
        setItems(payouts);
      }
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...items].sort((a:any,b:any)=>{
    if (sort === 'date') {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return dir === 'asc' ? da - db : db - da;
    }
    return dir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30', borderColor: 'border-blue-200 dark:border-blue-700' },
      'pending': { variant: 'secondary' as const, icon: Clock, color: 'text-amber-600', bgColor: 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30', borderColor: 'border-amber-200 dark:border-amber-700' },
      'failed': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', bgColor: 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30', borderColor: 'border-red-200 dark:border-red-700' },
      'processing': { variant: 'outline' as const, icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30', borderColor: 'border-blue-200 dark:border-blue-700' },
      'cancelled': { variant: 'outline' as const, icon: XCircle, color: 'text-slate-600', bgColor: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30', borderColor: 'border-slate-200 dark:border-slate-700' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-2 px-3 py-1 ${config.bgColor} ${config.borderColor} border-2 text-xs font-semibold`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="font-bold">{status}</span>
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('bank')) {
      return <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    return <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Clean Header Section - Metis Style */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
              <div className="h-12 w-12 bg-green-500 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              Earnings
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Track your payouts and payment history
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'date'|'amount')}
                className="px-3 py-2 bg-transparent border-none text-gray-700 focus:outline-none text-sm"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <select
                value={dir}
                onChange={(e) => setDir(e.target.value as 'asc'|'desc')}
                className="px-3 py-2 bg-transparent border-none text-gray-700 focus:outline-none text-sm"
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>

            <Button
              variant="outline"
              onClick={loadPayouts}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>


      {/* Clean Empty State */}
      {!loading && items.length === 0 && (
        <div className="bg-white border border-gray-200 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-8">
              <DollarSign className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Payouts Yet</h3>
            <p className="text-gray-600 text-center max-w-lg leading-relaxed text-lg">
              Your payout history will appear here once you start receiving payments from sales. Keep up the excellent work building your business!
            </p>
          </div>
        </div>
      )}

      {/* Clean Payouts List */}
      {!loading && items.length > 0 && (
        <div className="space-y-6">
          {/* Payouts Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Payouts</h3>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {sorted.length} payout{sorted.length !== 1 ? 's' : ''} • {formatUSD(sorted.reduce((sum, p) => sum + p.amount, 0))} total
              </div>
            </div>
          </div>

          {/* Payouts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((payout) => {
              const { date, time } = formatDate(payout.date);
              return (
                <Card key={payout.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getMethodIcon(payout.method)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">#{payout.id.slice(-8)}</div>
                            <div className="text-xs text-gray-500">{payout.method}</div>
                          </div>
                        </div>
                        {getStatusBadge(payout.status)}
                      </div>

                      {/* Amount */}
                      <div className="text-center py-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatUSD(payout.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payout.status === 'completed' ? 'Paid' : 'Processing'}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Summary Stats */}
      {!loading && items.length > 0 && (
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatUSD(items.reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="text-sm font-semibold text-gray-700">Total Earnings</div>
              <div className="text-xs text-gray-500">All time payouts</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {items.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm font-semibold text-gray-700">Successful Payouts</div>
              <div className="text-xs text-gray-500">Completed transactions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {items.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm font-semibold text-gray-700">Pending Payments</div>
              <div className="text-xs text-gray-500">Awaiting processing</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
