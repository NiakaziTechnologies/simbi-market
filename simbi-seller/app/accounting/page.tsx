// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Calculator,
  Plus,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Calendar,
  Filter,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

type LedgerEntry = {
  id: string;
  date: string;
  type: "SALE" | "EXPENSE" | "COMMISSION" | "REFUND";
  category: string;
  description: string;
  amount: number;
  reference?: string;
  taxCategory?: "VATable" | "Non-VATable";
};

type ExpenseEntry = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  receipt?: string;
};

export default function AccountingPage() {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const { accessToken } = useSellerAuth();

  // Load accounting data from API
  useEffect(() => {
    const loadAccountingData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load ledger from API
        const ledgerData = await apiClient.request<{ success: boolean; message: string; data?: { ledger: any[] } }>(
          '/accounting/ledger',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (ledgerData.success && ledgerData.data?.ledger) {
          setLedgerEntries(ledgerData.data.ledger || []);
        }

        // Load expenses from API
        const expensesData = await apiClient.request<{ success: boolean; message: string; data?: { expenses: any[] } }>(
          '/accounting/expenses',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (expensesData.success && expensesData.data?.expenses) {
          setExpenseEntries(expensesData.data.expenses || []);
        }

      } catch (err) {
        console.error('Accounting data loading error:', err);
        setError('Failed to load accounting data');
      } finally {
        setLoading(false);
      }
    };

    loadAccountingData();
  }, [accessToken]);

  // Calculate financial summaries
  const financialSummary = useMemo(() => {
    const totalSales = ledgerEntries
      .filter(entry => entry.type === "SALE")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalCommissions = Math.abs(ledgerEntries
      .filter(entry => entry.type === "COMMISSION")
      .reduce((sum, entry) => sum + entry.amount, 0));

    const totalExpenses = expenseEntries.reduce((sum, expense) => sum + expense.amount, 0);

    const netProfit = totalSales - totalCommissions - totalExpenses;

    return {
      totalSales,
      totalCommissions,
      totalExpenses,
      netProfit
    };
  }, [ledgerEntries, expenseEntries]);

  // Add manual expense - US-S-302
  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const data = await apiClient.post<{ success: boolean; message: string }>(
        '/accounting/expenses',
        {
          date: newExpense.date,
          category: newExpense.category,
          amount: newExpense.amount,
          description: newExpense.description,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (data.success) {
        // Refresh the data
        window.location.reload();
      } else {
        alert(`Failed to add expense: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  // Generate ZIMRA Report - US-S-303
  const generateZIMRAReport = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const data = await apiClient.request<{ success: boolean; message: string; data?: any }>(
        `/accounting/summary?year=${year}&month=${month}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (data.success && data.data) {
        const summary = data.data;

        const reportText = `
ZIMRA TAX REPORT
Period: ${selectedPeriod}
Generated: ${new Date().toLocaleDateString()}

REVENUE SUMMARY:
Total Sales: ${formatUSD(summary.revenue.totalRevenue)}
Total Commission Paid: ${formatUSD(summary.costs.platformCommissions)}
Total Operating Expenses: ${formatUSD(summary.expenses.totalExpenses)}

PROFIT & LOSS:
Net Profit: ${formatUSD(summary.netProfit)}
Profit Margin: ${summary.profitMargin}%

This report is generated for tax compliance purposes.
        `.trim();

        const blob = new Blob([reportText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `zimra-report-${selectedPeriod}-${year}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating ZIMRA report:', error);
      alert('Failed to generate ZIMRA report. Please try again.');
    }
  };

  // Export for Sage Pastel - US-S-304
  const exportForSagePastel = async () => {
    try {
      const currentDate = new Date();
      const fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const toDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

      const response = await apiClient.request(
        `/accounting/export/sage-pastel?from=${fromDate}&to=${toDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      // Create download link for the CSV file
      const blob = new Blob([response as any], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sage-pastel-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Sage Pastel data:', error);
      alert('Failed to export Sage Pastel data. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-[#3498DB] rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                Accounting & Financial Management
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Track sales, expenses, and generate compliance reports
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setExpenseFormOpen(true)}
                className="bg-[#2ECC71] hover:bg-[#27AE60] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <Button
                onClick={generateZIMRAReport}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                ZIMRA Report
              </Button>
              <Button
                onClick={exportForSagePastel}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Sage
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatUSD(financialSummary.totalSales)}</p>
                  <p className="text-sm text-green-600">VATable revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatUSD(financialSummary.totalCommissions)}</p>
                  <p className="text-sm text-red-600">Platform fees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operating Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatUSD(financialSummary.totalExpenses)}</p>
                  <p className="text-sm text-orange-600">Manual entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatUSD(financialSummary.netProfit)}
                  </p>
                  <p className="text-sm text-gray-600">After all deductions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* General Ledger */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3498DB]" />
              General Ledger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ledgerEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${entry.type === 'SALE' ? 'bg-green-500' : entry.type === 'EXPENSE' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.description}</p>
                      <p className="text-sm text-gray-600">{entry.category} • {entry.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.amount >= 0 ? '+' : ''}{formatUSD(entry.amount)}
                    </p>
                    {entry.reference && (
                      <p className="text-sm text-gray-500">Ref: {entry.reference}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Expense Entry Dialog - US-S-302 */}
        <Dialog open={expenseFormOpen} onOpenChange={setExpenseFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#3498DB]" />
                Add Operating Expense
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="border-gray-300 focus:ring-[#3498DB] focus:border-[#3498DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#3498DB] focus:border-[#3498DB]"
                >
                  <option value="">Select category</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Wages">Wages</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  placeholder="Expense description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="border-gray-300 focus:ring-[#3498DB] focus:border-[#3498DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount || ""}
                  onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                  className="border-gray-300 focus:ring-[#3498DB] focus:border-[#3498DB]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setExpenseFormOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addExpense}
                  className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
                >
                  Add Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}