// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

export function TopProductsChart({ data }: { data?: any[] }) {
  const chartData = data ?? [
    { name: 'Brake Pads', sold: 156, revenue: 18720 },
    { name: 'Oil Filters', sold: 142, revenue: 14200 },
    { name: 'Air Filters', sold: 128, revenue: 12800 },
    { name: 'Spark Plugs', sold: 119, revenue: 11900 },
    { name: 'Headlights', sold: 98, revenue: 19600 },
  ];

  return (
    <Card className="premium-card animate-luxury-fade-in-up border border-purple-200/50 shadow-2xl relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-xl"></div>

      <CardHeader className="pb-6 relative">
        <CardTitle className="text-xl font-bold luxury-gradient-text flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Top Products
        </CardTitle>
        <p className="text-slate-600 font-medium">
          Best selling products by quantity
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="currentColor" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value:any, name:any, props:any) => [value, name === 'sold' ? 'Units Sold' : name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
              />
              <Bar dataKey="sold" fill="url(#productsGradient)" radius={[6, 6, 0, 0]} barSize={18}>
                <LabelList
                  dataKey="sold"
                  position="top"
                  formatter={(v:any)=>String(v)}
                  style={{ fontSize: '12px', fontWeight: '600', fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
              <defs>
                <linearGradient id="productsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
