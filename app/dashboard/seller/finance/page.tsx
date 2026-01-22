"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  XCircle
} from "lucide-react";

// Mock formatUSD function
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Mock formatDateWithTime function
const formatDateWithTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>('income-statement');

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

  // Mock data for Income Statement
  const mockIncomeStatement = {
    period: {
      startDate: startDate || '2024-01-01',
      endDate: endDate || '2024-12-31'
    },
    revenue: {
      grossSales: 125000,
      returnsAndRefunds: 2500,
      netSales: 122500
    },
    costOfGoodsSold: {
      totalCOGS: 61500,
      grossProfit: 61000
    },
    operatingExpenses: {
      RENT: 8000,
      UTILITIES: 3200,
      WAGES: 25000,
      FUEL: 1800,
      MARKETING: 4500,
      EQUIPMENT: 1200,
      SUPPLIES: 800,
      MAINTENANCE: 600,
      INSURANCE: 2400,
      OTHER: 500,
      total: 47500
    },
    operatingIncome: 13500,
    otherIncomeExpenses: {
      platformFees: 12250,
      otherIncome: 500,
      otherExpenses: 200,
      total: -11950
    },
    netIncome: 1550
  };

  // Mock data for Trial Balance
  const mockTrialBalance = {
    isBalanced: true,
    difference: 0,
    totalDebits: 187500,
    totalCredits: 187500,
    accounts: [
      { id: '1', code: '1001', name: 'Cash', type: 'ASSET', totalDebit: 25000, totalCredit: 0, balance: 25000 },
      { id: '2', code: '1002', name: 'Accounts Receivable', type: 'ASSET', totalDebit: 15000, totalCredit: 0, balance: 15000 },
      { id: '3', code: '2001', name: 'Accounts Payable', type: 'LIABILITY', totalDebit: 0, totalCredit: 8500, balance: -8500 },
      { id: '4', code: '3001', name: 'Owner Equity', type: 'EQUITY', totalDebit: 0, totalCredit: 50000, balance: -50000 },
      { id: '5', code: '4001', name: 'Sales Revenue', type: 'REVENUE', totalDebit: 0, totalCredit: 125000, balance: -125000 },
      { id: '6', code: '5001', name: 'Cost of Goods Sold', type: 'COGS', totalDebit: 61500, totalCredit: 0, balance: 61500 },
      { id: '7', code: '5002', name: 'Operating Expenses', type: 'EXPENSE', totalDebit: 47500, totalCredit: 0, balance: 47500 },
      { id: '8', code: '5003', name: 'Platform Fees', type: 'EXPENSE', totalDebit: 12250, totalCredit: 0, balance: 12250 }
    ]
  };

  // Mock data for General Ledger
  const mockLedgerEntries = [
    {
      id: '1',
      transactionDate: '2024-01-15T10:30:00Z',
      type: 'SALE',
      description: 'Sale of Toyota Camry Brake Pads',
      category: 'Product Sale',
      debit: 0,
      credit: 1250,
      balance: 1250
    },
    {
      id: '2',
      transactionDate: '2024-01-15T10:35:00Z',
      type: 'PLATFORM_FEE',
      description: 'Platform fee for sale #ORD-001',
      category: 'Fees',
      debit: 125,
      credit: 0,
      balance: 1125
    },
    {
      id: '3',
      transactionDate: '2024-01-16T14:20:00Z',
      type: 'EXPENSE',
      description: 'Office rent payment',
      category: 'RENT',
      debit: 800,
      credit: 0,
      balance: 325
    },
    {
      id: '4',
      transactionDate: '2024-01-17T09:15:00Z',
      type: 'SALE',
      description: 'Sale of Honda Civic Air Filter',
      category: 'Product Sale',
      debit: 0,
      credit: 890,
      balance: 1215
    },
    {
      id: '5',
      transactionDate: '2024-01-17T09:20:00Z',
      type: 'PLATFORM_FEE',
      description: 'Platform fee for sale #ORD-002',
      category: 'Fees',
      debit: 89,
      credit: 0,
      balance: 1126
    }
  ];

  // Mock data for Expense Breakdown
  const mockExpenseBreakdown = [
    { category: 'RENT', count: 1, totalAmount: 8000 },
    { category: 'UTILITIES', count: 1, totalAmount: 3200 },
    { category: 'WAGES', count: 12, totalAmount: 25000 },
    { category: 'FUEL', count: 5, totalAmount: 1800 },
    { category: 'MARKETING', count: 3, totalAmount: 4500 },
    { category: 'EQUIPMENT', count: 2, totalAmount: 1200 },
    { category: 'SUPPLIES', count: 8, totalAmount: 800 },
    { category: 'MAINTENANCE', count: 3, totalAmount: 600 },
    { category: 'INSURANCE', count: 1, totalAmount: 2400 },
    { category: 'OTHER', count: 2, totalAmount: 500 }
  ];

  // Load Income Statement
  const loadIncomeStatement = async () => {
    setLoadingIncome(true);
    setTimeout(() => {
      setIncomeStatement(mockIncomeStatement);
      setLoadingIncome(false);
    }, 500);
  };

  // Load Trial Balance
  const loadTrialBalance = async () => {
    setLoadingTrial(true);
    setTimeout(() => {
      setTrialBalance(mockTrialBalance);
      setLoadingTrial(false);
    }, 500);
  };

  // Load General Ledger
  const loadGeneralLedger = async () => {
    setLoadingLedger(true);
    setTimeout(() => {
      setLedgerEntries(mockLedgerEntries);
      setLedgerPagination({
        page: ledgerPage,
        limit: ledgerLimit,
        total: 25,
        pages: Math.ceil(25 / ledgerLimit)
      });
      setLoadingLedger(false);
    }, 500);
  };

  // Load Expense Breakdown
  const loadExpenseBreakdown = async () => {
    setLoadingExpense(true);
    setTimeout(() => {
      setExpenseBreakdown(mockExpenseBreakdown);
      setLoadingExpense(false);
    }, 500);
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'income-statement') {
      loadIncomeStatement();
    } else if (activeTab === 'trial-balance') {
      loadTrialBalance();
    } else if (activeTab === 'general-ledger') {
      loadGeneralLedger();
    } else if (activeTab === 'expense-analysis') {
      loadExpenseBreakdown();
    }
  }, [activeTab]);

  // Reload when filters change
  useEffect(() => {
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
    if (activeTab === 'general-ledger') {
      loadGeneralLedger();
    }
  }, [ledgerPage]);

  const getAccountTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'ASSET': 'border-blue-500/30 text-blue-400 bg-blue-500/5',
      'LIABILITY': 'border-red-500/30 text-red-400 bg-red-500/5',
      'EQUITY': 'border-purple-500/30 text-purple-400 bg-purple-500/5',
      'REVENUE': 'border-green-500/30 text-green-400 bg-green-500/5',
      'EXPENSE': 'border-orange-500/30 text-orange-400 bg-orange-500/5',
      'COGS': 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5',
    };
    return <Badge className={colors[type] || 'border-muted text-muted-foreground bg-muted/30'}>{type}</Badge>;
  };

  const getTransactionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'SALE': 'border-green-500/30 text-green-400 bg-green-500/5',
      'EXPENSE': 'border-red-500/30 text-red-400 bg-red-500/5',
      'PLATFORM_FEE': 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5',
      'REFUND': 'border-orange-500/30 text-orange-400 bg-orange-500/5',
      'PAYOUT': 'border-blue-500/30 text-blue-400 bg-blue-500/5',
      'ADJUSTMENT': 'border-purple-500/30 text-purple-400 bg-purple-500/5',
    };
    return <Badge className={colors[type] || 'border-muted text-muted-foreground bg-muted/30'}>{type}</Badge>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              Finance
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage your financial reports and accounting
            </p>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="glass-card border border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="text-foreground">Start Date:</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 border-border bg-background text-foreground"
            />
            <Label className="text-foreground">End Date:</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 border-border bg-background text-foreground"
            />
            <Button
              variant="outline"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="border-border text-foreground hover:bg-accent/10"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/30 border border-border p-1">
          <TabsTrigger value="income-statement" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Income Statement
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            Trial Balance
          </TabsTrigger>
          <TabsTrigger value="general-ledger" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            General Ledger
          </TabsTrigger>
          <TabsTrigger value="expense-analysis" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <Receipt className="w-4 h-4 mr-2" />
            Expense Analysis
          </TabsTrigger>
        </TabsList>

        {/* Income Statement Tab */}
        <TabsContent value="income-statement" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Income Statement
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadIncomeStatement}
                  disabled={loadingIncome}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingIncome ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingIncome ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : incomeStatement ? (
                <div className="space-y-6">
                  {incomeStatement.period && Object.keys(incomeStatement.period).length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Period: {incomeStatement.period.startDate ? new Date(incomeStatement.period.startDate).toLocaleDateString() : 'All time'} - {incomeStatement.period.endDate ? new Date(incomeStatement.period.endDate).toLocaleDateString() : 'All time'}
                    </div>
                  )}

                  {/* Income Statement Table */}
                  <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-6 py-4 border-b border-border">
                      <h3 className="text-xl font-bold text-foreground">Income Statement</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Revenue Section */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Revenue</h4>
                          <div className="ml-4 space-y-1">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-foreground">Gross Sales</span>
                              <span className="font-medium text-foreground">{formatUSD(incomeStatement.revenue?.grossSales || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-muted-foreground text-sm">Less: Returns and Refunds</span>
                              <span className="text-muted-foreground text-sm">({formatUSD(incomeStatement.revenue?.returnsAndRefunds || 0)})</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                              <span className="font-semibold text-foreground">Net Sales</span>
                              <span className="font-bold text-foreground">{formatUSD(incomeStatement.revenue?.netSales || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Cost of Goods Sold Section */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Cost of Goods Sold</h4>
                          <div className="ml-4 space-y-1">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-foreground">Total COGS</span>
                              <span className="font-medium text-foreground">{formatUSD(incomeStatement.costOfGoodsSold?.totalCOGS || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                              <span className="font-semibold text-foreground">Gross Profit</span>
                              <span className="font-bold text-foreground">{formatUSD(incomeStatement.costOfGoodsSold?.grossProfit || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Operating Expenses Section */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Operating Expenses</h4>
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
                                  <span className="text-foreground">{categoryLabels[key] || key}</span>
                                  <span className="font-medium text-foreground">{formatUSD(value || 0)}</span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                              <span className="font-semibold text-foreground">Total Operating Expenses</span>
                              <span className="font-bold text-foreground">{formatUSD(incomeStatement.operatingExpenses?.total || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Operating Income */}
                        <div className="flex justify-between items-center py-3 border-t-2 border-border mt-2 pt-3">
                          <span className="font-bold text-lg text-foreground">Operating Income</span>
                          <span className="font-bold text-lg text-foreground">{formatUSD(incomeStatement.operatingIncome || 0)}</span>
                        </div>

                        {/* Other Income/Expenses Section */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Other Income / Expenses</h4>
                          <div className="ml-4 space-y-1">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-foreground">Platform Fees</span>
                              <span className="font-medium text-red-400">({formatUSD(incomeStatement.otherIncomeExpenses?.platformFees || 0)})</span>
                            </div>
                            {incomeStatement.otherIncomeExpenses?.otherIncome > 0 && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-foreground">Other Income</span>
                                <span className="font-medium text-green-400">{formatUSD(incomeStatement.otherIncomeExpenses.otherIncome)}</span>
                              </div>
                            )}
                            {incomeStatement.otherIncomeExpenses?.otherExpenses > 0 && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-foreground">Other Expenses</span>
                                <span className="font-medium text-red-400">({formatUSD(incomeStatement.otherIncomeExpenses.otherExpenses)})</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-2 border-t border-border mt-2 pt-2">
                              <span className="font-semibold text-foreground">Total Other Income / Expenses</span>
                              <span className={`font-bold ${incomeStatement.otherIncomeExpenses?.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatUSD(incomeStatement.otherIncomeExpenses?.total || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Net Income */}
                        <div className={`flex justify-between items-center py-4 border-t-2 border-border mt-4 pt-4 ${incomeStatement.netIncome >= 0 ? 'bg-accent/5' : 'bg-red-500/5'} rounded-lg px-4`}>
                          <span className="font-bold text-xl text-foreground">Net Income</span>
                          <span className={`font-bold text-2xl ${incomeStatement.netIncome >= 0 ? 'text-accent' : 'text-red-400'}`}>
                            {formatUSD(incomeStatement.netIncome || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Balance Tab */}
        <TabsContent value="trial-balance" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calculator className="w-5 h-5" />
                  Trial Balance
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadTrialBalance}
                  disabled={loadingTrial}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingTrial ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTrial ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : trialBalance ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {trialBalance.isBalanced ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span className="text-accent font-medium">Trial Balance is Balanced</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Trial Balance is Not Balanced</span>
                      </>
                    )}
                    {trialBalance.difference !== 0 && (
                      <span className="text-sm text-muted-foreground">
                        (Difference: {formatUSD(Math.abs(trialBalance.difference || 0))})
                      </span>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Code</TableHead>
                        <TableHead className="text-foreground">Account Name</TableHead>
                        <TableHead className="text-foreground">Type</TableHead>
                        <TableHead className="text-right text-foreground">Debit</TableHead>
                        <TableHead className="text-right text-foreground">Credit</TableHead>
                        <TableHead className="text-right text-foreground">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalance.accounts && trialBalance.accounts.length > 0 ? (
                        trialBalance.accounts.map((account: any) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono text-foreground">{account.code}</TableCell>
                            <TableCell className="text-foreground">{account.name}</TableCell>
                            <TableCell>{getAccountTypeBadge(account.type)}</TableCell>
                            <TableCell className="text-right text-foreground">{formatUSD(account.totalDebit || 0)}</TableCell>
                            <TableCell className="text-right text-foreground">{formatUSD(account.totalCredit || 0)}</TableCell>
                            <TableCell className={`text-right font-semibold ${account.balance >= 0 ? 'text-accent' : 'text-red-400'}`}>
                              {formatUSD(account.balance || 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No accounts found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {trialBalance.accounts && trialBalance.accounts.length > 0 && (
                    <div className="flex justify-end gap-6 pt-4 border-t border-border">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Debits</p>
                        <p className="text-lg font-semibold text-foreground">{formatUSD(trialBalance.totalDebits || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Credits</p>
                        <p className="text-lg font-semibold text-foreground">{formatUSD(trialBalance.totalCredits || 0)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Ledger Tab */}
        <TabsContent value="general-ledger" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5" />
                  General Ledger
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger className="w-40 border-border bg-background text-foreground">
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
                    className="border-border text-foreground hover:bg-accent/10"
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
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : ledgerEntries.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Date</TableHead>
                        <TableHead className="text-foreground">Type</TableHead>
                        <TableHead className="text-foreground">Description</TableHead>
                        <TableHead className="text-foreground">Category</TableHead>
                        <TableHead className="text-right text-foreground">Debit</TableHead>
                        <TableHead className="text-right text-foreground">Credit</TableHead>
                        <TableHead className="text-right text-foreground">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-foreground">
                            {entry.transactionDate ? formatDateWithTime(entry.transactionDate) : '-'}
                          </TableCell>
                          <TableCell>{getTransactionTypeBadge(entry.type)}</TableCell>
                          <TableCell className="max-w-xs truncate text-foreground">{entry.description || '-'}</TableCell>
                          <TableCell className="text-foreground">{entry.category || '-'}</TableCell>
                          <TableCell className="text-right text-foreground">{entry.debit ? formatUSD(entry.debit) : '-'}</TableCell>
                          <TableCell className="text-right text-foreground">{entry.credit ? formatUSD(entry.credit) : '-'}</TableCell>
                          <TableCell className="text-right font-semibold text-foreground">{formatUSD(entry.balance || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {ledgerPagination && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {((ledgerPagination.page - 1) * ledgerPagination.limit) + 1} to {Math.min(ledgerPagination.page * ledgerPagination.limit, ledgerPagination.total)} of {ledgerPagination.total} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                          disabled={ledgerPage === 1}
                          className="border-border text-foreground hover:bg-accent/10"
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-foreground">
                          Page {ledgerPagination.page} of {ledgerPagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLedgerPage(p => Math.min(ledgerPagination.pages, p + 1))}
                          disabled={ledgerPage >= ledgerPagination.pages}
                          className="border-border text-foreground hover:bg-accent/10"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No ledger entries found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Analysis Tab */}
        <TabsContent value="expense-analysis" className="space-y-6 mt-6">
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Receipt className="w-5 h-5" />
                  Expense Analysis
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={loadExpenseBreakdown}
                  disabled={loadingExpense}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingExpense ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExpense ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : expenseBreakdown.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-foreground">{formatUSD(totalExpenses)}</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Category</TableHead>
                        <TableHead className="text-foreground">Count</TableHead>
                        <TableHead className="text-right text-foreground">Total Amount</TableHead>
                        <TableHead className="text-right text-foreground">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseBreakdown.map((item, index) => {
                        const percentage = totalExpenses > 0 ? ((item.totalAmount / totalExpenses) * 100).toFixed(1) : '0.0';
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-foreground">
                              {getExpenseCategoryLabel(item.category)}
                            </TableCell>
                            <TableCell className="text-foreground">{item.count || 0}</TableCell>
                            <TableCell className="text-right font-semibold text-foreground">
                              {formatUSD(item.totalAmount || 0)}
                            </TableCell>
                            <TableCell className="text-right text-foreground">
                              {percentage}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}