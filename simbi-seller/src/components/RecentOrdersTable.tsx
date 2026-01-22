// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FixedSizeList as List } from "react-window";
import { formatDateWithTime } from "@/lib/date";
import { apiClient } from "@/lib/apiClient";

const getStatusColor = (status: string) => {
   switch (status) {
     case "taken_up":
       return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700";
     case "processing":
       return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700";
     case "shipped":
       return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
     case "pending":
       return "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
     case "cancelled":
       return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
     case "rejected":
       return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
     default:
       return "bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
   }
 };

export function RecentOrdersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), q, sort, order: orderDir });
    
    // ✅ Use centralized apiClient with automatic token injection
    apiClient.request(`/api/sales?${params.toString()}`)
      .then((data) => {
        if (!mounted) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, limit, q, sort, orderDir]);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    // optimistic update
    setItems((prev) => prev.map((it) => (it.id === orderId ? { ...it, status: newStatus } : it)));
    try {
      // ✅ Use centralized apiClient with automatic token injection
      const json = await apiClient.post('/api/orders/update', {
        orderId, 
        status: newStatus
      });
      
      if (!json.success) {
        // revert if failed
        setItems((prev) => prev.map((it) => (it.id === orderId ? { ...it, status: it.status } : it)));
        console.error('Failed to update order status', json);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const Row = ({ index, style }: { index: number; style: any }) => {
    const order = items[index];
    if (!order) return <div style={style} />;
    return (
      <div style={style} className={`grid grid-cols-12 gap-3 p-6 items-center hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-blue-50/30 hover:to-indigo-50/30 transition-all duration-300 ${index % 2 ? "bg-white/30" : "bg-slate-50/30"}`}>
        <div className="col-span-2">
          <div className="font-bold text-slate-900 text-sm bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-2 rounded-lg border border-slate-200">
            #{order.id}
          </div>
        </div>
        <div className="col-span-2">
          <div className="font-semibold text-slate-800 text-sm truncate bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200" title={order.customer || "No customer"}>
            {order.customer || "—"}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-sm text-slate-600 truncate bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-2 rounded-lg border border-indigo-200" title={(order.items || []).map((it: any) => it.productId).join(", ")}>
            {(order.items || []).length > 0 ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}` : "No items"}
          </div>
        </div>
        <div className="col-span-2">
          <div className="font-bold text-lg luxury-gradient-text bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200">
            ${order.total}
          </div>
        </div>
        <div className="col-span-2">
          {(['cancelled', 'taken_up', 'rejected'].includes(order.status)) ? (
            // Final statuses - not editable by sellers
            <div className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${getStatusColor(order.status)}`}>
              {order.status === 'taken_up' && '✅ Taken Up'}
              {order.status === 'cancelled' && '❌ Cancelled'}
              {order.status === 'rejected' && '🚫 Rejected'}
              <span className="text-xs ml-2 opacity-75">(Final)</span>
            </div>
          ) : (
            // Editable statuses for sellers
            <select
              aria-label={`Change status for ${order.id}`}
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${getStatusColor(order.status)}`}
            >
              <option value="pending">⏳ Pending</option>
              <option value="processing">⚙️ Processing</option>
              <option value="shipped">📦 Shipped</option>
            </select>
          )}
        </div>
        <div className="col-span-2">
          <div className="text-sm text-slate-600 font-semibold bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-2 rounded-lg border border-rose-200">
            {formatDateWithTime(order.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="premium-card border border-purple-200/50 shadow-2xl relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/5 to-transparent rounded-full blur-2xl"></div>

      <div className="p-8 border-b border-purple-200/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold luxury-gradient-text">Recent Orders</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Search orders..."
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  className="w-72 pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/80 rounded-xl p-2 border border-slate-200">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-transparent border-none text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
              >
                <option value="date">📅 Sort by Date</option>
                <option value="total">💰 Sort by Amount</option>
              </select>
            </div>
            <div className="flex items-center gap-3 bg-white/80 rounded-xl p-2 border border-slate-200">
              <select
                value={orderDir}
                onChange={(e) => { setOrderDir(e.target.value as any); setPage(1); }}
                className="px-4 py-2 bg-transparent border-none text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
              >
                <option value="desc">⬇️ Newest First</option>
                <option value="asc">⬆️ Oldest First</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 px-6 py-3 transition-all duration-300"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="overflow-hidden">
          <div className="w-full">
            {/* Premium Table Header */}
            <div className="grid grid-cols-12 gap-3 font-bold text-slate-800 p-6 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 rounded-2xl border border-purple-200/50 mb-4">
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span>Order ID</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Customer</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span>Products</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span>Amount</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Status</span>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Date</span>
              </div>
            </div>

            <List height={400} itemCount={items.length} itemSize={64} width={'100%'}>
              {Row}
            </List>

            {/* Premium Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-8 p-6 bg-gradient-to-r from-slate-50/80 to-purple-50/80 rounded-2xl border border-slate-200/50">
              <div className="text-sm text-slate-600 font-semibold">
                Showing <span className="text-purple-600 font-bold">{items.length}</span> of <span className="text-purple-600 font-bold">{total}</span> orders
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="luxury-button text-white px-6 py-3"
                >
                  ← Previous
                </Button>
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3 border border-slate-200">
                  <span className="text-sm font-semibold text-slate-700">Page</span>
                  <span className="text-lg font-bold luxury-gradient-text">{page}</span>
                </div>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < limit}
                  className="luxury-button text-white px-6 py-3"
                >
                  Next →
                </Button>
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3 border border-slate-200">
                  <select
                    value={String(limit)}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="px-4 py-2 bg-transparent border-none text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
