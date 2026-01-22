// @ts-nocheck
"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import PayoutsHistory from "@/components/PayoutsHistory";

export default function Page() {
  return (
    <DashboardLayout>
      <div className="space-y-10 p-4">
        {/* Clean Header Section - Metis Style */}
        <div className="bg-white border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Earnings Dashboard
              </h1>
              <p className="text-gray-600 text-lg font-medium leading-relaxed max-w-2xl">
                Track your payouts and comprehensive payment history with advanced insights and analytics
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-sm text-gray-600 font-semibold">Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PayoutsHistory />
      </div>
    </DashboardLayout>
  );
}
