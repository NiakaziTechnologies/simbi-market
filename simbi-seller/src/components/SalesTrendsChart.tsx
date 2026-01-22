// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatUSD } from "@/lib/currency";
import { formatDateShort, formatDateLong } from "@/lib/date";

export function SalesTrendsChart({ data }: { data?: any[] }) {
  const chartData =
    data ?? [
      { date: "2025-01-01", sales: 12800 },
      { date: "2025-02-01", sales: 15600 },
      { date: "2025-03-01", sales: 18900 },
      { date: "2025-04-01", sales: 16200 },
      { date: "2025-05-01", sales: 21400 },
      { date: "2025-06-01", sales: 24800 },
    ];

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Sales Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Sales trends (bar)</p>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(t:any)=>formatDateShort(t)} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatUSD(Number(v))} />
              <Tooltip
                labelFormatter={(l:any)=>formatDateLong(l)}
                formatter={(value: any) => (typeof value === "number" ? formatUSD(value) : value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="sales" fill="#FF4500" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
