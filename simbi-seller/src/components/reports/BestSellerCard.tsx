// @ts-nocheck
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/currency";

export default function BestSellerCard({ product, qty, revenue }: { product?: any; qty?: number; revenue?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Seller</CardTitle>
      </CardHeader>
      <CardContent>
        {product ? (
          <div>
            <div className="font-bold">{product.name}</div>
            <div className="text-sm text-muted-foreground">Sold: {qty} units</div>
            <div className="text-sm text-muted-foreground">Revenue: {formatUSD(revenue || 0)}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No sales data for the selected period</div>
        )}
      </CardContent>
    </Card>
  );
}
