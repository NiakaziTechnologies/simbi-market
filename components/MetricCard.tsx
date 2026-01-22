"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card className="glass-card border border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {icon && <div className="text-accent">{icon}</div>}
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}