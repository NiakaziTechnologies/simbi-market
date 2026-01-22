"use client";

import React from "react";

interface EndOfDayReportModalProps {
  children: React.ReactNode;
  orders: any[];
  products: any[];
}

export function EndOfDayReportModal({ children, orders, products }: EndOfDayReportModalProps) {
  return <>{children}</>;
}