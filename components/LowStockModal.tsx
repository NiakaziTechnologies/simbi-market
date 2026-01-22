"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LowStockModalProps {
  children: React.ReactNode;
}

export function LowStockModal({ children }: LowStockModalProps) {
  return <>{children}</>;
}