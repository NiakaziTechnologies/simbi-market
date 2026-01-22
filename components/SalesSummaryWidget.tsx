"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesSummaryWidgetProps {
  salesSummary?: {
    daily?: { value: number; title: string; period: string; description?: string };
    weekly?: { value: number; title: string; period: string; description?: string };
    monthly?: { value: number; title: string; period: string; description?: string };
  };
}

export default function SalesSummaryWidget({ salesSummary }: SalesSummaryWidgetProps) {
  return (
    <Card className="glass-card border border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Sales Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  Today
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-accent font-bold">
                  ${salesSummary?.daily?.value || 0}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {salesSummary?.daily?.description || "Active"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  This Week
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-accent font-bold">
                  ${salesSummary?.weekly?.value || 0}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {salesSummary?.weekly?.description || "Active"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  This Month
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-accent font-bold">
                  ${salesSummary?.monthly?.value || 0}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {salesSummary?.monthly?.description || "Active"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}