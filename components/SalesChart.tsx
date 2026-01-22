"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SalesChartProps {
  data?: Array<{
    date: string;
    sales: number;
    orders: number;
    unfulfilled: number;
  }>;
  unfulfilledData?: any;
}

export function SalesChart({ data, unfulfilledData }: SalesChartProps) {
  return (
    <Card className="glass-card border border-border">
      <CardContent className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">📊</div>
            <div className="text-foreground font-semibold">Sales Performance Chart</div>
            <div className="text-sm text-muted-foreground">
              {data ? `${data.length} data points loaded` : 'Loading chart data...'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}