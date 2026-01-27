"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Package,
  DollarSign,
  RotateCcw,
  Loader2,
  RefreshCw,
  Calendar,
  TrendingUp,
  ShoppingCart,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getSalesReport,
  getProductsReport,
  getFinancialReport,
  getReturnsReport,
  type SalesReport,
  type ProductsReport,
  type FinancialReport,
  type ReturnsReport,
} from "@/lib/api/seller-reports"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales")
  const [period, setPeriod] = useState("daily")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { toast } = useToast()

  // Sales Report State
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [isLoadingSales, setIsLoadingSales] = useState(false)

  // Products Report State
  const [productsReport, setProductsReport] = useState<ProductsReport | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Financial Report State
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false)

  // Returns Report State
  const [returnsReport, setReturnsReport] = useState<ReturnsReport | null>(null)
  const [isLoadingReturns, setIsLoadingReturns] = useState(false)

  const loadSalesReport = useCallback(async () => {
    try {
      setIsLoadingSales(true)
      const data = await getSalesReport(period, startDate || undefined, endDate || undefined)
      setSalesReport(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load sales report",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSales(false)
    }
  }, [period, startDate, endDate, toast])

  const loadProductsReport = useCallback(async () => {
    try {
      setIsLoadingProducts(true)
      const data = await getProductsReport(startDate || undefined, endDate || undefined)
      setProductsReport(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load products report",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }, [startDate, endDate, toast])

  const loadFinancialReport = useCallback(async () => {
    try {
      setIsLoadingFinancial(true)
      const data = await getFinancialReport(startDate || undefined, endDate || undefined)
      setFinancialReport(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load financial report",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFinancial(false)
    }
  }, [startDate, endDate, toast])

  const loadReturnsReport = useCallback(async () => {
    try {
      setIsLoadingReturns(true)
      const data = await getReturnsReport(startDate || undefined, endDate || undefined)
      setReturnsReport(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load returns report",
        variant: "destructive",
      })
    } finally {
      setIsLoadingReturns(false)
    }
  }, [startDate, endDate, toast])

  useEffect(() => {
    if (activeTab === "sales") {
      loadSalesReport()
    } else if (activeTab === "products") {
      loadProductsReport()
    } else if (activeTab === "financial") {
      loadFinancialReport()
    } else if (activeTab === "returns") {
      loadReturnsReport()
    }
  }, [activeTab, loadSalesReport, loadProductsReport, loadFinancialReport, loadReturnsReport])

  const handleRefresh = () => {
    if (activeTab === "sales") {
      loadSalesReport()
    } else if (activeTab === "products") {
      loadProductsReport()
    } else if (activeTab === "financial") {
      loadFinancialReport()
    } else if (activeTab === "returns") {
      loadReturnsReport()
    }
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    setPeriod("daily")
  }

  const salesChartData = salesReport?.trends.data.map((item) => ({
    date: format(new Date(item.period), "MMM dd"),
    fullDate: item.period,
    totalRevenue: item.totalRevenue,
    netRevenue: item.netRevenue,
    commission: item.totalCommission,
  })) || []

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
          Reports
        </h1>
        <p className="text-muted-foreground font-light">
          View detailed analytics and insights
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="glass-card border-border">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={handleClear} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger 
            value="sales" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <BarChart3 className="h-4 w-4" />
            Sales Report
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <Package className="h-4 w-4" />
            Products Report
          </TabsTrigger>
          <TabsTrigger 
            value="financial" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <DollarSign className="h-4 w-4" />
            Financial Report
          </TabsTrigger>
          <TabsTrigger 
            value="returns" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <RotateCcw className="h-4 w-4" />
            Returns Report
          </TabsTrigger>
        </TabsList>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card className="glass-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle className="text-xl font-light">Sales Report</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingSales}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSales ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSales ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : salesReport ? (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {salesReport.summary.totalOrders}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(salesReport.summary.totalRevenue)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(salesReport.summary.netRevenue)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(salesReport.summary.avgOrderValue)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Breakdown Lists */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-light">Orders by Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-foreground">Delivered</span>
                          <span className="font-medium text-foreground">{salesReport.breakdown.byStatus.delivered}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">Processing</span>
                          <span className="font-medium text-foreground">{salesReport.breakdown.byStatus.processing}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">Shipped</span>
                          <span className="font-medium text-foreground">{salesReport.breakdown.byStatus.shipped}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-light">Orders by Payment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-foreground">Paid</span>
                          <span className="font-medium text-foreground">{salesReport.breakdown.byPayment.paid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">Partial</span>
                          <span className="font-medium text-foreground">{salesReport.breakdown.byPayment.partial}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">Unpaid</span>
                          <span className="font-medium text-foreground">{salesReport.breakdown.byPayment.unpaid}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue Trends Chart */}
                  {salesChartData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-light">Revenue Trends ({period})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="totalRevenue" 
                              stroke="#22c55e" 
                              strokeWidth={2}
                              name="Total Revenue"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="netRevenue" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              name="Net Revenue"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="commission" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              name="Commission"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No sales data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Report Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="glass-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle className="text-xl font-light">Products Report</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingProducts}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : productsReport ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {productsReport.summary.totalProducts}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                          {productsReport.summary.activeProducts}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">
                          {productsReport.summary.lowStockCount}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(productsReport.summary.totalStockValue)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Products Table */}
                  {productsReport.products.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-light">Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {productsReport.products.map((product) => (
                            <div key={product.inventoryId} className="p-4 border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-foreground">{product.productName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {product.oemPartNumber} • {product.manufacturer} • {product.category}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={product.isActive ? "outline" : "secondary"}>
                                    {product.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  {product.isLowStock && (
                                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="grid md:grid-cols-4 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Current Stock:</span>
                                  <span className="ml-2 font-medium text-foreground">{product.currentStock}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Stock Value:</span>
                                  <span className="ml-2 font-medium text-foreground">{formatCurrency(product.stockValue)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total Sold:</span>
                                  <span className="ml-2 font-medium text-foreground">{product.totalSold}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Sell Through Rate:</span>
                                  <span className="ml-2 font-medium text-foreground">{product.sellThroughRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Report Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card className="glass-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <CardTitle className="text-xl font-light">Financial Report</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingFinancial}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingFinancial ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingFinancial ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : financialReport ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(financialReport.incomeStatement.totalRevenue)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-400">
                          {formatCurrency(financialReport.incomeStatement.totalExpenses)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${financialReport.incomeStatement.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(financialReport.incomeStatement.netIncome)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit Margin</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {financialReport.profitability.netProfitMargin.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cash Flow Chart */}
                  {financialReport.cashFlow.trends.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-light">Cash Flow Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={financialReport.cashFlow.trends.map(item => ({
                            date: format(new Date(item.date), "MMM dd"),
                            inflow: item.inflow,
                            outflow: item.outflow,
                            net: item.net,
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="inflow" stroke="#22c55e" strokeWidth={2} name="Inflow" />
                            <Line type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} name="Outflow" />
                            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No financial data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Report Tab */}
        <TabsContent value="returns" className="space-y-6">
          <Card className="glass-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  <CardTitle className="text-xl font-light">Returns Report</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingReturns}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingReturns ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReturns ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : returnsReport ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Return Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {returnsReport.summary.totalReturnRequests}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Refund Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {returnsReport.summary.refundRate.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunds</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(returnsReport.summary.totalRefunds)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Refund Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(returnsReport.summary.avgRefundAmount)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Return Requests Table */}
                  {returnsReport.returnRequests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-light">Return Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {returnsReport.returnRequests.map((request) => (
                            <div key={request.id} className="p-4 border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-foreground">{request.orderNumber}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {request.buyerName} • {request.buyerEmail}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{request.status}</Badge>
                                  {request.faultClassification && (
                                    <Badge variant="outline" className="text-xs">
                                      {request.faultClassification.replace(/_/g, ' ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Order Amount:</span>
                                  <span className="ml-2 font-medium text-foreground">{formatCurrency(request.orderAmount)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Reason:</span>
                                  <span className="ml-2 font-medium text-foreground">{request.returnReason.replace(/_/g, ' ')}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Created:</span>
                                  <span className="ml-2 font-medium text-foreground">
                                    {format(new Date(request.createdAt), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No returns data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
