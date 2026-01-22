// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator,
  FileText,
  Receipt,
  TrendingUp,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { formatDateWithTime } from "@/lib/date";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<string>('income-statement');
  const { accessToken } = useSellerAuth();
  const { toast } = useToast();

  // Date filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Income Statement state
  const [incomeStatement, setIncomeStatement] = useState<any>(null);
  const [loadingIncome, setLoadingIncome] = useState(false);

  // Trial Balance state
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [loadingTrial, setLoadingTrial] = useState(false);

  // General Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [ledgerPagination, setLedgerPagination] = useState<any>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [transactionType, setTransactionType] = useState<string>('all');
  const [ledgerPage, setLedgerPage] = useState<number>(1);
  const [ledgerLimit] = useState<number>(20);

  // Expense Analysis state
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [loadingExpense, setLoadingExpense] = useState(false);

  // Load Income Statement
  const loadIncomeStatement = async () => {
    if (!accessToken) return;

    try {
      setLoadingIncome(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/accounting/summary?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setIncomeStatement(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load income statement:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load income statement",
        variant: "destructive",
      });
    } finally {
      setLoadingIncome(false);
    }
  };

  // Load Trial Balance
  const loadTrialBalance = async () => {
    if (!accessToken) return;

    try {
      setLoadingTrial(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/accounting/reports/trial-balance?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setTrialBalance(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load trial balance:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load trial balance",
        variant: "destructive",
      });
    } finally {
      setLoadingTrial(false);
    }
  };

  // Load General Ledger
  const loadGeneralLedger = async () => {
    if (!accessToken) return;

    try {
      setLoadingLedger(true);
      const params = new URLSearchParams();
      if (transactionType !== 'all') params.append('transactionType', transactionType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', ledgerPage.toString());
      params.append('limit', ledgerLimit.toString());

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          entries?: any[];
          pagination?: any;
        };
      }>(`/api/seller/accounting/ledger?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setLedgerEntries(Array.isArray(response.data.entries) ? response.data.entries : []);
        setLedgerPagination(response.data.pagination || null);
      }
    } catch (err: any) {
      console.error('Failed to load general ledger:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load general ledger",
        variant: "destructive",
      });
    } finally {
      setLoadingLedger(false);
    }
  };

  // Load Expense Breakdown
  const loadExpenseBreakdown = async () => {
    if (!accessToken) return;

    try {
      setLoadingExpense(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.request<{
        success: boolean;
        data?: any[];
      }>(`/api/seller/accounting/expenses/breakdown?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setExpenseBreakdown(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      console.error('Failed to load expense breakdown:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load expense breakdown",
        variant: "destructive",
      });
    } finally {
      setLoadingExpense(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!accessToken) return;

    if (activeTab === 'income-statement') {
      loadIncomeStatement();
    } else if (activeTab === 'trial-balance') {
      loadTrialBalance();
    } else if (activeTab === 'general-ledger') {
      loadGeneralLedger();
    } else if (activeTab === 'expense-analysis') {
      loadExpenseBreakdown();
    }
  }, [activeTab, accessToken]);

  // Reload when filters change
  useEffect(() => {
    if (!accessToken) return;

    if (activeTab === 'income-statement') {
      loadIncomeStatement();
    } else if (activeTab === 'trial-balance') {
      loadTrialBalance();
    } else if (activeTab === 'general-ledger') {
      setLedgerPage(1);
      loadGeneralLedger();
    } else if (activeTab === 'expense-analysis') {
      loadExpenseBreakdown();
    }
  }, [startDate, endDate, transactionType]);

  // Reload ledger when page changes
  useEffect(() => {
    if (activeTab === 'general-ledger' && accessToken) {
      loadGeneralLedger();
    }
  }, [ledgerPage]);

  const getAccountTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'ASSET': 'bg-blue-100 text-blue-800',
      'LIABILITY': 'bg-red-100 text-red-800',
      'EQUITY': 'bg-purple-100 text-purple-800',
      'REVENUE': 'bg-green-100 text-green-800',
      'EXPENSE': 'bg-orange-100 text-orange-800',
      'COGS': 'bg-yellow-100 text-yellow-800',
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const getTransactionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'SALE': 'bg-green-100 text-green-800',
      'EXPENSE': 'bg-red-100 text-red-800',
      'PLATFORM_FEE': 'bg-yellow-100 text-yellow-800',
      'REFUND': 'bg-orange-100 text-orange-800',
      'PAYOUT': 'bg-blue-100 text-blue-800',
      'ADJUSTMENT': 'bg-purple-100 text-purple-800',
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const getExpenseCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'RENT': 'Rent',
      'UTILITIES': 'Utilities',
      'WAGES': 'Wages',
      'FUEL': 'Fuel',
      'MARKETING': 'Marketing',
      'EQUIPMENT': 'Equipment',
      'SUPPLIES': 'Supplies',
      'MAINTENANCE': 'Maintenance',
      'INSURANCE': 'Insurance',
      'OTHER': 'Other',
    };
    return labels[category] || category;
  };

  const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-[#2ECC71] rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                Finance
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage your financial reports and accounting
              </p>
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>Start Date:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40 border border-gray-300"
              />
              <Label>End Date:</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40 border border-gray-300"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="income-statement" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Income Statement
            </TabsTrigger>
            <TabsTrigger value="trial-balance" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Trial Balance
            </TabsTrigger>
            <TabsTrigger value="general-ledger" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              General Ledger
            </TabsTrigger>
            <TabsTrigger value="expense-analysis" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <Receipt className="w-4 h-4 mr-2" />
              Expense Analysis
            </TabsTrigger>
          </TabsList>

          {/* Income Statement Tab */}
          <TabsContent value="income-statement" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Income Statement
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadIncomeStatement}
                    disabled={loadingIncome}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingIncome ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingIncome ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : incomeStatement ? (
                  <div className="space-y-6">
                    {incomeStatement.period && Object.keys(incomeStatement.period).length > 0 && (
                      <div className="text-sm text-gray-600">
                        Period: {incomeStatement.period.startDate ? new Date(incomeStatement.period.startDate).toLocaleDateString() : 'All time'} - {incomeStatement.period.endDate ? new Date(incomeStatement.period.endDate).toLocaleDateString() : 'All time'}
                      </div>
                    )}
                    
                    {/* Income Statement Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">Income Statement</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Revenue Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Revenue</h4>
                            <div className="ml-4 space-y-1">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-700">Gross Sales</span>
                                <span className="font-medium text-gray-900">{formatUSD(incomeStatement.revenue?.grossSales || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600 text-sm">Less: Returns and Refunds</span>
                                <span className="text-gray-600 text-sm">({formatUSD(incomeStatement.revenue?.returnsAndRefunds || 0)})</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                <span className="font-semibold text-gray-900">Net Sales</span>
                                <span className="font-bold text-gray-900">{formatUSD(incomeStatement.revenue?.netSales || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cost of Goods Sold Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Cost of Goods Sold</h4>
                            <div className="ml-4 space-y-1">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-700">Total COGS</span>
                                <span className="font-medium text-gray-900">{formatUSD(incomeStatement.costOfGoodsSold?.totalCOGS || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                <span className="font-semibold text-gray-900">Gross Profit</span>
                                <span className="font-bold text-gray-900">{formatUSD(incomeStatement.costOfGoodsSold?.grossProfit || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Operating Expenses Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Operating Expenses</h4>
                            <div className="ml-4 space-y-1">
                              {incomeStatement.operatingExpenses && Object.entries(incomeStatement.operatingExpenses).map(([key, value]: [string, any]) => {
                                if (key === 'total') return null;
                                const categoryLabels: Record<string, string> = {
                                  'RENT': 'Rent',
                                  'UTILITIES': 'Utilities',
                                  'WAGES': 'Wages',
                                  'FUEL': 'Fuel',
                                  'MARKETING': 'Marketing',
                                  'EQUIPMENT': 'Equipment',
                                  'SUPPLIES': 'Supplies',
                                  'MAINTENANCE': 'Maintenance',
                                  'INSURANCE': 'Insurance',
                                  'OTHER': 'Other'
                                };
                                if (value === 0) return null;
                                return (
                                  <div key={key} className="flex justify-between items-center py-1">
                                    <span className="text-gray-700">{categoryLabels[key] || key}</span>
                                    <span className="font-medium text-gray-900">{formatUSD(value || 0)}</span>
                                  </div>
                                );
                              })}
                              <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                <span className="font-semibold text-gray-900">Total Operating Expenses</span>
                                <span className="font-bold text-gray-900">{formatUSD(incomeStatement.operatingExpenses?.total || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Operating Income */}
                          <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2 pt-3">
                            <span className="font-bold text-lg text-gray-900">Operating Income</span>
                            <span className="font-bold text-lg text-gray-900">{formatUSD(incomeStatement.operatingIncome || 0)}</span>
                          </div>

                          {/* Other Income/Expenses Section */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Other Income / Expenses</h4>
                            <div className="ml-4 space-y-1">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-700">Platform Fees</span>
                                <span className="font-medium text-red-600">({formatUSD(incomeStatement.otherIncomeExpenses?.platformFees || 0)})</span>
                              </div>
                              {incomeStatement.otherIncomeExpenses?.otherIncome > 0 && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-gray-700">Other Income</span>
                                  <span className="font-medium text-green-600">{formatUSD(incomeStatement.otherIncomeExpenses.otherIncome)}</span>
                                </div>
                              )}
                              {incomeStatement.otherIncomeExpenses?.otherExpenses > 0 && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-gray-700">Other Expenses</span>
                                  <span className="font-medium text-red-600">({formatUSD(incomeStatement.otherIncomeExpenses.otherExpenses)})</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                                <span className="font-semibold text-gray-900">Total Other Income / Expenses</span>
                                <span className={`font-bold ${(incomeStatement.otherIncomeExpenses?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatUSD(incomeStatement.otherIncomeExpenses?.total || 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Net Income */}
                          <div className={`flex justify-between items-center py-4 border-t-2 border-gray-400 mt-4 pt-4 ${(incomeStatement.netIncome || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg px-4`}>
                            <span className="font-bold text-xl text-gray-900">Net Income</span>
                            <span className={`font-bold text-2xl ${(incomeStatement.netIncome || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {formatUSD(incomeStatement.netIncome || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trial Balance Tab */}
          <TabsContent value="trial-balance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Trial Balance
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadTrialBalance}
                    disabled={loadingTrial}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingTrial ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTrial ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : trialBalance ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {trialBalance.isBalanced ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">Trial Balance is Balanced</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-red-600 font-medium">Trial Balance is Not Balanced</span>
                        </>
                      )}
                      {trialBalance.difference !== 0 && (
                        <span className="text-sm text-gray-600">
                          (Difference: {formatUSD(Math.abs(trialBalance.difference || 0))})
                        </span>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trialBalance.accounts && trialBalance.accounts.length > 0 ? (
                          trialBalance.accounts.map((account: any) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-mono">{account.code}</TableCell>
                              <TableCell>{account.name}</TableCell>
                              <TableCell>{getAccountTypeBadge(account.type)}</TableCell>
                              <TableCell className="text-right">{formatUSD(account.totalDebit || 0)}</TableCell>
                              <TableCell className="text-right">{formatUSD(account.totalCredit || 0)}</TableCell>
                              <TableCell className={`text-right font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatUSD(account.balance || 0)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No accounts found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {trialBalance.accounts && trialBalance.accounts.length > 0 && (
                      <div className="flex justify-end gap-6 pt-4 border-t">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Debits</p>
                          <p className="text-lg font-semibold">{formatUSD(trialBalance.totalDebits || 0)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Credits</p>
                          <p className="text-lg font-semibold">{formatUSD(trialBalance.totalCredits || 0)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Ledger Tab */}
          <TabsContent value="general-ledger" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    General Ledger
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger className="w-40 border border-gray-300">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="SALE">Sale</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="PLATFORM_FEE">Platform Fee</SelectItem>
                        <SelectItem value="REFUND">Refund</SelectItem>
                        <SelectItem value="PAYOUT">Payout</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={loadGeneralLedger}
                      disabled={loadingLedger}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingLedger ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingLedger ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : ledgerEntries.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              {entry.transactionDate ? formatDateWithTime(entry.transactionDate) : '-'}
                            </TableCell>
                            <TableCell>{getTransactionTypeBadge(entry.type)}</TableCell>
                            <TableCell className="max-w-xs truncate">{entry.description || '-'}</TableCell>
                            <TableCell>{entry.category || '-'}</TableCell>
                            <TableCell className="text-right">{entry.debit ? formatUSD(entry.debit) : '-'}</TableCell>
                            <TableCell className="text-right">{entry.credit ? formatUSD(entry.credit) : '-'}</TableCell>
                            <TableCell className="text-right font-semibold">{formatUSD(entry.balance || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {ledgerPagination && (
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-600">
                          Showing {((ledgerPagination.page - 1) * ledgerPagination.limit) + 1} to {Math.min(ledgerPagination.page * ledgerPagination.limit, ledgerPagination.total)} of {ledgerPagination.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                            disabled={ledgerPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {ledgerPagination.page} of {ledgerPagination.pages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLedgerPage(p => Math.min(ledgerPagination.pages, p + 1))}
                            disabled={ledgerPage >= ledgerPagination.pages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No ledger entries found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expense Analysis Tab */}
          <TabsContent value="expense-analysis" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Expense Analysis
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={loadExpenseBreakdown}
                    disabled={loadingExpense}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingExpense ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingExpense ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : expenseBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-gray-900">{formatUSD(totalExpenses)}</p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseBreakdown.map((item, index) => {
                          const percentage = totalExpenses > 0 ? ((item.totalAmount / totalExpenses) * 100).toFixed(1) : '0.0';
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {getExpenseCategoryLabel(item.category)}
                              </TableCell>
                              <TableCell>{item.count || 0}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatUSD(item.totalAmount || 0)}
                              </TableCell>
                              <TableCell className="text-right">
                                {percentage}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
