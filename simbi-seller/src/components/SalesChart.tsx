// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatUSD } from "@/lib/currency";
import { formatDateShort, formatDateLong } from "@/lib/date";

export function SalesChart({ data, unfulfilledData }: { data?: any[], unfulfilledData?: any[] }) {
  const chartData = data ?? [
    { date: 'Jan', sales: 12800, orders: 145, unfulfilled: 10 },
    { date: 'Feb', sales: 15600, orders: 178, unfulfilled: 0 },
    { date: 'Mar', sales: 18900, orders: 203, unfulfilled: 3 },
    { date: 'Apr', sales: 16200, orders: 189, unfulfilled: 0 },
    { date: 'May', sales: 21400, orders: 245, unfulfilled: 0 },
    { date: 'Jun', sales: 24800, orders: 289, unfulfilled: 0 },
    { date: 'Jul', sales: 28600, orders: 321, unfulfilled: 5 },
    { date: 'Aug', sales: 25200, orders: 298, unfulfilled: 2 },
    { date: 'Sep', sales: 32100, orders: 365, unfulfilled: 0 },
    { date: 'Oct', sales: 29800, orders: 342, unfulfilled: 10 },
    { date: 'Nov', sales: 35400, orders: 398, unfulfilled: 0 },
    { date: 'Dec', sales: 42200, orders: 456, unfulfilled: 5 },
  ];

   // Merge unfulfilled data with chart data if provided
   const mergedData = unfulfilledData && unfulfilledData.length > 0 ? chartData.map(item => {
     const unfulfilledItem = unfulfilledData.find(u => u.date === item.date);
     return {
       ...item,
       unfulfilled: unfulfilledItem ? Number(unfulfilledItem.unfulfilled) || 0 : 0
     };
   }) : chartData;

   console.log('📊 Chart data sample:', chartData.slice(0, 3));
   console.log('📊 Unfulfilled data sample:', unfulfilledData?.slice(0, 3));
   console.log('📊 Merged chart data sample:', mergedData.slice(0, 3));

   // Calculate proper domain for unfulfilled orders Y-axis
   const unfulfilledValues = mergedData.map(d => Number(d.unfulfilled) || 0);
   const maxUnfulfilled = Math.max(...unfulfilledValues);
   const minUnfulfilled = Math.min(...unfulfilledValues);

   // Create uniform intervals (every 5 units) - ensure minimum range
   const calculatedMax = Math.ceil((maxUnfulfilled + 1) / 5) * 5;
   const yAxisMax = Math.max(10, calculatedMax); // Minimum 10 to show proper scale
   const yAxisMin = 0;

   console.log('📊 Unfulfilled data analysis:', {
     values: unfulfilledValues,
     max: maxUnfulfilled,
     min: minUnfulfilled,
     calculatedMax,
     finalMax: yAxisMax
   });

  return (
    <Card className="premium-card animate-luxury-fade-in-up border border-purple-200/50 shadow-2xl relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-xl"></div>

      <CardHeader className="pb-6 relative">
        <CardTitle className="text-xl font-bold luxury-gradient-text flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          Sales Performance Analytics
        </CardTitle>
        <p className="text-slate-600 font-medium">
          Advanced sales vs unfulfilled orders comparison with real-time insights
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="currentColor" />
              <XAxis
                dataKey={"date"}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(t:any)=>formatDateShort(t)}
              />
              <YAxis
                yAxisId="sales"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatUSD(Number(v))}
              />
              <YAxis
                yAxisId="unfulfilled"
                orientation="right"
                domain={[yAxisMin, yAxisMax]}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickCount={6}
                interval="preserveStart"
                tickFormatter={(v) => {
                  // Format as clean integers: 0, 5, 10, 15, etc.
                  try {
                    let num: number;
                    if (typeof v === 'number') {
                      num = Math.round(v);
                    } else if (typeof v === 'string') {
                      // Handle string values that might have formatting
                      const cleaned = v.replace(/[^0-9.-]/g, '');
                      num = parseInt(cleaned, 10);
                    } else {
                      num = parseInt(String(v), 10);
                    }

                    // Ensure we have a valid number
                    if (isNaN(num) || !isFinite(num)) {
                      return '0';
                    }

                    return String(Math.max(0, num)); // Ensure non-negative
                  } catch (error) {
                    console.warn('Error formatting Y-axis tick:', v, error);
                    return '0';
                  }
                }}
              />
              <Tooltip
                labelFormatter={(label:any)=>formatDateLong(label)}
                formatter={(value: any, name: any) => {
                  if (name === 'sales') return [formatUSD(Number(value)), 'Sales'];
                  if (name === 'unfulfilled') return [value, 'Unfulfilled Orders'];
                  return [typeof value === 'number' ? formatUSD(value) : value, name];
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                          {formatDateLong(label)}
                        </p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-600 dark:text-slate-300">
                              {entry.name === 'sales' ? 'Sales:' : 'Unfulfilled:'}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {entry.name === 'sales'
                                ? formatUSD(Number(entry.value) || 0)
                                : `${Math.round(Number(entry.value) || 0)} orders`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
              />
              <Line
                yAxisId="sales"
                type="monotone"
                dataKey="sales"
                stroke="url(#salesGradient)"
                strokeWidth={3}
                dot={{ fill: 'url(#salesDot)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'url(#salesActiveDot)', strokeWidth: 2, fill: 'white' }}
              />
              <Line
                yAxisId="unfulfilled"
                type="monotone"
                dataKey="unfulfilled"
                stroke="url(#unfulfilledGradient)"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: 'url(#unfulfilledDot)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'url(#unfulfilledActiveDot)', strokeWidth: 2, fill: 'white' }}
              />
              <Legend
                content={({ payload }) => (
                  <div className="flex items-center justify-center gap-6 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {entry.value === 'sales' ? 'Sales' : 'Unfulfilled Orders'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <radialGradient id="salesDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </radialGradient>
                <radialGradient id="salesActiveDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </radialGradient>
                <linearGradient id="unfulfilledGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#B91C1C" />
                </linearGradient>
                <radialGradient id="unfulfilledDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </radialGradient>
                <radialGradient id="unfulfilledActiveDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#B91C1C" />
                </radialGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
