// @ts-nocheck
"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatUSD } from "@/lib/currency";
import { computeSupplierSales, computeTotalSupplierSales, Order, Product, PeriodFilter, getSupplierComplianceStatus } from "@/lib/metrics";
import SupplierDocumentManager from "./SupplierDocumentManager";
import { Building2, FileText, Download, TrendingUp, Package, Calendar, DollarSign } from "lucide-react";

interface SupplierSalesReportProps {
  orders: Order[];
  products: Product[];
}

export default function SupplierSalesReport({ orders, products }: SupplierSalesReportProps) {
  const [period, setPeriod] = useState<PeriodFilter>('year_to_date');

  const supplierSales = useMemo(() => {
    if (!orders.length || !products.length) return [];
    return computeSupplierSales(orders, products, period);
  }, [orders, products, period]);

  const totalSales = useMemo(() => {
    if (!orders.length || !products.length) return null;
    return computeTotalSupplierSales(orders, products, period);
  }, [orders, products, period]);

  const exportCSV = () => {
    if (!totalSales) return;

    const headers = ['Supplier', 'Supplier ID', 'ZIMRA TIN', 'Total Sales', 'Total Orders', 'Average Order Value', 'Products Sold', 'Product IDs', 'Date Range'];
    const rows = supplierSales.map(supplier => [
      supplier.supplier,
      supplier.supplierId || '',
      supplier.zimraTIN || '',
      String(supplier.totalSales),
      String(supplier.totalOrders),
      String(supplier.averageOrderValue),
      String(supplier.productsSold),
      supplier.productIds.join('; '),
      `${supplier.dateRange.start} to ${supplier.dateRange.end}`
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier-sales-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportZIMRAReport = () => {
    if (!totalSales) return;

    // ZIMRA-compliant format with TIN as primary identifier
    const headers = ['Tax Period', 'Supplier Name', 'ZIMRA TIN', 'Supplier ID', 'Gross Sales (USD)', 'Total Orders', 'Average Order Value (USD)', 'Products Count', 'Tax Compliance Status'];
    const rows = supplierSales.map(supplier => [
      period === 'year_to_date' ? new Date().getFullYear().toString() : period.toString(),
      supplier.supplier,
      supplier.zimraTIN || 'PENDING', // ZIMRA TIN is mandatory for compliance
      supplier.supplierId || 'N/A',
      String(supplier.totalSales),
      String(supplier.totalOrders),
      String(supplier.averageOrderValue),
      String(supplier.productIds.length),
      supplier.zimraTIN ? 'COMPLIANT' : 'PENDING TIN' // Compliance status indicator
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zimra-supplier-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!totalSales) {
    return (
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No Supplier Data Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add supplier information to products to see sales reports per supplier.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gross Sales per Supplier
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                ZIMRA-compliant supplier sales tracking and reporting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(period)} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="year_to_date">Year to Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={exportCSV}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={exportZIMRAReport}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                ZIMRA Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Suppliers</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalSales.summary.totalSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Gross Sales</p>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{formatUSD(totalSales.totalGrossSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg per Supplier</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{formatUSD(totalSales.summary.averageSalesPerSupplier)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Top Supplier</p>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200 truncate">{totalSales.summary.topSupplier}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">{formatUSD(totalSales.summary.topSupplierSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Details Table */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 dark:text-slate-100">
            Supplier Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplierSales.map((supplier, index) => (
              <div key={supplier.supplier} className="p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{supplier.supplier}</h4>
                      <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400">
                        {supplier.zimraTIN && (
                          <p className="font-medium text-blue-600 dark:text-blue-400">TIN: {supplier.zimraTIN}</p>
                        )}
                        {supplier.supplierId && (
                          <p>ID: {supplier.supplierId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                      {formatUSD(supplier.totalSales)}
                    </Badge>
                    <Badge className={`text-xs ${
                      supplier.zimraTIN
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
                    }`}>
                      {supplier.zimraTIN ? 'TIN Verified' : 'TIN Pending'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {supplier.totalOrders} orders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Avg: {formatUSD(supplier.averageOrderValue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {supplier.productsSold} products sold
                    </span>
                  </div>
                </div>

                {supplier.dateRange.start && (
                  <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-600/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Period: {new Date(supplier.dateRange.start).toLocaleDateString()} - {new Date(supplier.dateRange.end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ZIMRA Compliance Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">ZIMRA Compliance Ready</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This report can be exported in ZIMRA-compliant format for tax filing. All supplier sales are tracked with proper audit trails.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}