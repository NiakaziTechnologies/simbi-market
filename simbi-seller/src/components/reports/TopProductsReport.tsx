// @ts-nocheck
"use client";

import React, { useMemo, useState } from "react";
import { formatUSD } from "@/lib/currency";
import { Button } from "@/components/ui/button";

import VirtualList from "@/components/VirtualList";

export default function TopProductsReport({ dataByQty = [], dataByValue = [], productsMap = {} }: { dataByQty?: any[]; dataByValue?: any[]; productsMap?: Record<string, any> }) {
  const [mode, setMode] = useState<'qty'|'value'>('qty');
  const data = mode === 'qty' ? dataByQty : dataByValue;

  const exportCSV = () => {
    const headers = ['rank','product','qty','value'];
    const rows = data.map((r:any, idx:number)=>[String(idx+1), (productsMap[r.id]?.name||r.id), String(r.qty), String(r.revenue)]);
    const csv = [headers, ...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `top-products-${mode}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Top Products
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant={mode==='qty'? 'default' : 'outline'}
            onClick={() => setMode('qty')}
            className={mode==='qty' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg' : 'border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'}
          >
            By Quantity
          </Button>
          <Button
            variant={mode==='value'? 'default' : 'outline'}
            onClick={() => setMode('value')}
            className={mode==='value' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg' : 'border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'}
          >
            By Value
          </Button>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="w-full text-sm">
          <div className="grid grid-cols-12 gap-2 font-bold text-slate-700 dark:text-slate-200 p-3 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50 mb-2">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Product</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-3">Value</div>
          </div>

          <VirtualList
            items={data}
            rowHeight={56}
            height={400}
            overscan={8}
            renderItem={(row: any, idx: number) => (
              <div className={`grid grid-cols-12 gap-2 p-3 rounded-lg transition-colors ${idx % 2 ? 'bg-slate-50/50 dark:bg-slate-700/20' : 'bg-white/50 dark:bg-slate-800/30'} hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200/50 dark:hover:border-emerald-700/50`}>
                <div className="col-span-1 flex items-center">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {idx+1}
                  </div>
                </div>
                <div className="col-span-6 flex items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{productsMap[row.id]?.name || row.id}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{row.qty}</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="font-bold text-blue-700 dark:text-blue-300">{formatUSD(row.revenue)}</span>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
