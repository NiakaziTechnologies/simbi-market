"use client";

import React from "react";

interface SalesTrendsChartProps {
  data?: any[];
}

export function SalesTrendsChart({ data }: SalesTrendsChartProps) {
  return (
    <div className="h-32 flex items-center justify-center bg-muted/50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl mb-2">📈</div>
        <div className="text-sm text-muted-foreground">Sales Trends Chart</div>
      </div>
    </div>
  );
}