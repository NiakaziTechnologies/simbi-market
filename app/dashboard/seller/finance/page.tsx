"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  BookOpen,
  PieChart,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getFinancialSummary,
  getTrialBalance,
  getGeneralLedger,
  getExpenseBreakdown,
  type FinancialSummary,
  type TrialBalanceAccount,
  type LedgerEntry,
  type ExpenseBreakdownItem,
} from "@/lib/api/seller-accounting"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("income-statement")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Income Statement State
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  // Trial Balance State
  const [trialBalance, setTrialBalance] = useState<{
    accounts: TrialBalanceAccount[]
    totalDebits: number
    totalCredits: number
    difference: number
    isBalanced: boolean
  } | null>(null)
  const [isLoadingTrialBalance, setIsLoadingTrialBalance] = useState(false)

  // General Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [ledgerPage, setLedgerPage] = useState(1)
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1)
  const [ledgerTotal, setLedgerTotal] = useState(0)
  const [isLoadingLedger, setIsLoadingLedger] = useState(false)

  // Expenses Analysis State
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdownItem[]>([])
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)

  const loadFinancialSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true)
      const data = await getFinancialSummary()
      setFinancialSummary(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load financial summary",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSummary(false)
    }
  }, [toast])

  const loadTrialBalance = useCallback(async () => {
    try {
      setIsLoadingTrialBalance(true)
      const data = await getTrialBalance()
      setTrialBalance(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load trial balance",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTrialBalance(false)
    }
  }, [toast])

  const loadGeneralLedger = useCallback(async () => {
    try {
      setIsLoadingLedger(true)
      const data = await getGeneralLedger(ledgerPage, 20)
      setLedgerEntries(data.entries)
      setLedgerTotalPages(data.pagination.pages || 1)
      setLedgerTotal(data.pagination.total)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load general ledger",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLedger(false)
    }
  }, [ledgerPage, toast])

  const loadExpenseBreakdown = useCallback(async () => {
    try {
      setIsLoadingExpenses(true)
      const data = await getExpenseBreakdown()
      setExpenseBreakdown(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load expense breakdown",
        variant: "destructive",
      })
    } finally {
      setIsLoadingExpenses(false)
    }
  }, [toast])

  useEffect(() => {
    if (activeTab === "income-statement") {
      loadFinancialSummary()
    } else if (activeTab === "trial-balance") {
      loadTrialBalance()
    } else if (activeTab === "general-ledger") {
      loadGeneralLedger()
    } else if (activeTab === "expenses-analysis") {
      loadExpenseBreakdown()
    }
  }, [activeTab, loadFinancialSummary, loadTrialBalance, loadGeneralLedger, loadExpenseBreakdown])

  useEffect(() => {
    if (activeTab === "general-ledger") {
      loadGeneralLedger()
    }
  }, [ledgerPage, activeTab, loadGeneralLedger])

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      "SALE": { label: "Sale", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      "COMMISSION": { label: "Commission", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      "EXPENSE": { label: "Expense", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      "REFUND": { label: "Refund", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      "PAYOUT": { label: "Payout", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      "OTHER": { label: "Other", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    }
    const typeInfo = typeMap[type] || { label: type, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
    return (
      <Badge variant="outline" className={typeInfo.className}>
        {typeInfo.label}
      </Badge>
    )
  }

  const expenseChartData = expenseBreakdown.map((item) => ({
    name: item.category.replace(/_/g, ' '),
    value: item.amount,
    percentage: item.percentage,
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Finance
        </h1>
        <p className="text-muted-foreground font-light">
          View financial reports and analytics
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger 
            value="income-statement" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <FileText className="h-4 w-4" />
            Income Statement
          </TabsTrigger>
          <TabsTrigger 
            value="trial-balance" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <BookOpen className="h-4 w-4" />
            Trial Balance
          </TabsTrigger>
          <TabsTrigger 
            value="general-ledger" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <FileText className="h-4 w-4" />
            General Ledger
          </TabsTrigger>
          <TabsTrigger 
            value="expenses-analysis" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <PieChart className="h-4 w-4" />
            Expenses Analysis
          </TabsTrigger>
        </TabsList>

        {/* Income Statement Tab */}
        <TabsContent value="income-statement" className="space-y-6">
          {isLoadingSummary ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : financialSummary ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(financialSummary.totalRevenue)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(financialSummary.totalExpenses)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Platform Commission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">
                      -{formatCurrency(financialSummary.totalCommission)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(financialSummary.netProfit)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Income Statement Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-light">Income Statement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Revenue Section */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Revenue</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Sales</span>
                        <span className="text-foreground font-medium">{formatCurrency(financialSummary.revenue.grossSales)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Returns & Refunds</span>
                        <span className="text-red-400">-{formatCurrency(financialSummary.revenue.returnsAndRefunds)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-foreground font-semibold">Net Sales</span>
                        <span className="text-foreground font-semibold">{formatCurrency(financialSummary.revenue.netSales)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost of Goods Sold */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Cost of Goods Sold</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total COGS</span>
                        <span className="text-red-400">{formatCurrency(financialSummary.costOfGoodsSold.totalCOGS)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-foreground font-semibold">Gross Profit</span>
                        <span className="text-green-400 font-semibold">{formatCurrency(financialSummary.costOfGoodsSold.grossProfit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operating Expenses */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Operating Expenses</h3>
                    <div className="pl-4 space-y-1">
                      {Object.entries(financialSummary.operatingExpenses)
                        .filter(([key]) => key !== 'total')
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                            <span className="text-red-400">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-foreground font-semibold">Total Operating Expenses</span>
                        <span className="text-red-400 font-semibold">{formatCurrency(financialSummary.operatingExpenses.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operating Income */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm pt-2 border-t-2 border-border">
                      <span className="text-foreground font-semibold">Operating Income</span>
                      <span className={`font-semibold ${financialSummary.operatingIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(financialSummary.operatingIncome)}
                      </span>
                    </div>
                  </div>

                  {/* Other Income/Expenses */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Other Income/Expenses</h3>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fees</span>
                        <span className="text-red-400">-{formatCurrency(financialSummary.otherIncomeExpenses.platformFees)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Other Income</span>
                        <span className="text-green-400">{formatCurrency(financialSummary.otherIncomeExpenses.otherIncome)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Other Expenses</span>
                        <span className="text-red-400">-{formatCurrency(financialSummary.otherIncomeExpenses.otherExpenses)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-foreground font-semibold">Total Other Income/Expenses</span>
                        <span className={`font-semibold ${financialSummary.otherIncomeExpenses.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(financialSummary.otherIncomeExpenses.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg pt-4 border-t-2 border-border">
                      <span className="text-foreground font-bold">Net Income</span>
                      <span className={`font-bold text-xl ${financialSummary.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(financialSummary.netIncome)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No financial data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trial Balance Tab */}
        <TabsContent value="trial-balance" className="space-y-6">
          {isLoadingTrialBalance ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : trialBalance ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(trialBalance.totalDebits)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(trialBalance.totalCredits)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Balance Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trialBalance.isBalanced ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-lg font-semibold">Balanced</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <XCircle className="h-5 w-5" />
                        <span className="text-lg font-semibold">Unbalanced</span>
                      </div>
                    )}
                    {!trialBalance.isBalanced && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Difference: {formatCurrency(Math.abs(trialBalance.difference))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Trial Balance Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-light">Trial Balance</CardTitle>
                  <CardDescription>
                    {trialBalance.accounts.length} account{trialBalance.accounts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Account Code</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trialBalance.accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono text-sm">{account.code}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-foreground">{account.name}</div>
                                {account.description && (
                                  <div className="text-xs text-muted-foreground">{account.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{account.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {account.totalDebit > 0 ? formatCurrency(account.totalDebit) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.totalCredit > 0 ? formatCurrency(account.totalCredit) : '-'}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(Math.abs(account.balance))}
                              {account.balance >= 0 ? ' Dr' : ' Cr'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No trial balance data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* General Ledger Tab */}
        <TabsContent value="general-ledger" className="space-y-6">
          {isLoadingLedger ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : ledgerEntries.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-light">General Ledger</CardTitle>
                  <CardDescription>
                    {ledgerTotal} total entr{ledgerTotal !== 1 ? 'ies' : 'y'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <div className="text-sm">
                                {format(new Date(entry.transactionDate), "MMM dd, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(entry.transactionDate), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>{getTypeBadge(entry.type)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {entry.category.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="text-sm text-foreground truncate">{entry.description}</div>
                                {entry.referenceId && (
                                  <div className="text-xs text-muted-foreground font-mono truncate">
                                    Ref: {entry.referenceId.slice(0, 8)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {entry.debit > 0 ? (
                                <span className="text-red-400">{formatCurrency(entry.debit)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {entry.credit > 0 ? (
                                <span className="text-green-400">{formatCurrency(entry.credit)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${entry.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(Math.abs(entry.balance))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {ledgerTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {ledgerPage} of {ledgerTotalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLedgerPage(prev => Math.max(1, prev - 1))}
                          disabled={ledgerPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLedgerPage(prev => Math.min(ledgerTotalPages, prev + 1))}
                          disabled={ledgerPage === ledgerTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No ledger entries available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Expenses Analysis Tab */}
        <TabsContent value="expenses-analysis" className="space-y-6">
          {isLoadingExpenses ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : expenseBreakdown.length > 0 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(expenseBreakdown.reduce((sum, item) => sum + item.amount, 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {expenseBreakdown.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {expenseBreakdown.reduce((sum, item) => sum + item.count, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-light">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Pie
                          data={expenseChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Expense List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-light">Expense Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseBreakdown.map((item, index) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-foreground">
                              {item.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {item.count} transaction{item.count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.percentage.toFixed(1)}%
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No expense data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
