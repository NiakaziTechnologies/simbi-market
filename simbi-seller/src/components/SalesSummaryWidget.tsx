// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/currency";
import { apiClient } from "@/lib/apiClient";

interface SalesSummaryWidgetProps {
  salesSummary?: {
    daily?: { value: number; title?: string; period?: string; description?: string };
    weekly?: { value: number; title?: string; period?: string; description?: string };
    monthly?: { value: number; title?: string; period?: string; description?: string };
  };
}

export default function SalesSummaryWidget({ salesSummary }: SalesSummaryWidgetProps = {}) {
  const [data, setData] = useState<{ daily:number; weekly:number; monthly:number; series:any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If salesSummary is provided from comprehensive endpoint, use it
    if (salesSummary) {
      setData({
        daily: salesSummary.daily?.value || 0,
        weekly: salesSummary.weekly?.value || 0,
        monthly: salesSummary.monthly?.value || 0,
        series: []
      });
      setLoading(false);
      return;
    }

    // Otherwise, fetch from trends endpoint (fallback)
    let mounted = true;
    setLoading(true);
    
    apiClient.request('/api/seller/dashboard/trends?period=7d')
      .then((response) => { 
        if (mounted && response.success) {
          // Map the trends data to the expected format
          const trendsData = response.data || [];
          const daily = trendsData.length > 0 ? trendsData[trendsData.length - 1]?.value || 0 : 0;
          const weekly = trendsData.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
          const monthly = weekly * 4; // Approximate monthly from weekly
          
          setData({
            daily,
            weekly,
            monthly,
            series: trendsData
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [salesSummary]);

  if (!data && loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Sales Summary</CardTitle>
              <p className="text-sm text-gray-600">Overview of your sales performance</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Sales */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{salesSummary?.daily?.title || "Daily Sales"}</h3>
                  <p className="text-sm text-gray-500">{salesSummary?.daily?.period || "Today"}</p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatUSD(data?.daily || 0)}</div>
            <div className="text-sm text-gray-600">{salesSummary?.daily?.description || "Revenue generated today"}</div>
          </div>

          {/* Weekly Sales */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{salesSummary?.weekly?.title || "Weekly Sales"}</h3>
                  <p className="text-sm text-gray-500">{salesSummary?.weekly?.period || "This week"}</p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatUSD(data?.weekly || 0)}</div>
            <div className="text-sm text-gray-600">{salesSummary?.weekly?.description || "Revenue this week"}</div>
          </div>

          {/* Monthly Sales */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V9a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m6 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m6 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{salesSummary?.monthly?.title || "Monthly Sales"}</h3>
                  <p className="text-sm text-gray-500">{salesSummary?.monthly?.period || "This month"}</p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatUSD(data?.monthly || 0)}</div>
            <div className="text-sm text-gray-600">{salesSummary?.monthly?.description || "Revenue this month"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
