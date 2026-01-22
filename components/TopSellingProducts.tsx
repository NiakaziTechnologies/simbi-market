"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopSellingProducts() {
  const mockProducts = [
    { name: "Brake Pads", revenue: 2500, quantity: 50 },
    { name: "Oil Filter", revenue: 1800, quantity: 75 },
    { name: "Spark Plugs", revenue: 1200, quantity: 30 }
  ];

  return (
    <Card className="glass-card border border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">{product.name}</div>
                <div className="text-sm text-muted-foreground">{product.quantity} sold</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-accent">${product.revenue}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}