"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, Clock, History, BarChart3, Loader2, DollarSign, TrendingUp, Package, CheckCircle2, AlertCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  getPendingPayouts, 
  getPayoutHistory, 
  getPayoutsSummary,
  type PendingPayoutOrder,
  type PayoutHistoryItem,
  type PayoutsSummaryData
} from "@/lib/api/seller-payouts"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayoutOrder[]>([])
  const [pendingSummary, setPendingSummary] = useState<any>(null)
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([])
  const [historySummary, setHistorySummary] = useState<any>(null)
  const [payoutsSummary, setPayoutsSummary] = useState<PayoutsSummaryData | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPagination, setHistoryPagination] = useState<any>(null)
  const [summaryDays, setSummaryDays] = useState(30)
  const [loading, setLoading] = useState({
    pending: false,
    history: false,
    summary: false
  })
  const { toast } = useToast()

  // Load pending payouts
  useEffect(() => {
    const loadPendingPayouts = async () => {
      setLoading(prev => ({ ...prev, pending: true }))
      try {
        const data = await getPendingPayouts()
        setPendingPayouts(data.orders)
        setPendingSummary(data.summary)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load pending payouts",
          variant: "destructive",
        })
      } finally {
        setLoading(prev => ({ ...prev, pending: false }))
      }
    }

    if (activeTab === "pending") {
      loadPendingPayouts()
    }
  }, [activeTab, toast])

  // Load payout history
  useEffect(() => {
    const loadPayoutHistory = async () => {
      setLoading(prev => ({ ...prev, history: true }))
      try {
        const data = await getPayoutHistory(historyPage, 20)
        setPayoutHistory(data.payouts)
        setHistorySummary(data.summary)
        setHistoryPagination(data.pagination)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load payout history",
          variant: "destructive",
        })
      } finally {
        setLoading(prev => ({ ...prev, history: false }))
      }
    }

    if (activeTab === "history") {
      loadPayoutHistory()
    }
  }, [activeTab, historyPage, toast])

  // Load summary
  useEffect(() => {
    const loadSummary = async () => {
      setLoading(prev => ({ ...prev, summary: true }))
      try {
        const data = await getPayoutsSummary(summaryDays)
        setPayoutsSummary(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load summary",
          variant: "destructive",
        })
      } finally {
        setLoading(prev => ({ ...prev, summary: false }))
      }
    }

    if (activeTab === "summary") {
      loadSummary()
    }
  }, [activeTab, summaryDays, toast])

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Payments & Payouts
        </h1>
        <p className="text-muted-foreground font-light">Manage your payouts and payment history</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="pending"
            className="bg-transparent flex items-center gap-2 text-foreground data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-blue-600 hover:!text-white"
          >
            <Clock className="h-4 w-4" />
            Pending Payouts
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="bg-transparent flex items-center gap-2 text-foreground data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-blue-600 hover:!text-white"
          >
            <History className="h-4 w-4" />
            Payment History
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="bg-transparent flex items-center gap-2 text-foreground data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-blue-600 hover:!text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Pending Payouts Tab */}
        <TabsContent value="pending" className="space-y-6">
          {loading.pending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              {pendingSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(pendingSummary.pendingAmount)}</div>
                      <p className="text-xs text-muted-foreground">{pendingSummary.ordersCount} orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(pendingSummary.totalPaid)}</div>
                      <p className="text-xs text-muted-foreground">Gross amount</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(pendingSummary.totalPlatformFee)}</div>
                      <p className="text-xs text-muted-foreground">Total commission</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Pending Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payout Orders</CardTitle>
                  <CardDescription>Orders awaiting payout processing</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingPayouts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No pending payouts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingPayouts.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{order.orderNumber}</h3>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="text-xs">Total Amount:</span>
                                <p className="font-medium text-foreground">{formatCurrency(order.totalAmount, order.currency)}</p>
                              </div>
                              <div>
                                <span className="text-xs">Gross Amount:</span>
                                <p className="font-medium text-foreground">{formatCurrency(order.grossAmount, order.currency)}</p>
                              </div>
                              <div>
                                <span className="text-xs">Platform Fee:</span>
                                <p className="font-medium text-foreground">{formatCurrency(order.platformCommission, order.currency)}</p>
                              </div>
                              <div>
                                <span className="text-xs">Net Amount:</span>
                                <p className="font-medium text-accent">{formatCurrency(order.netAmount, order.currency)}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Delivered: {formatDate(order.deliveredDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          {loading.history ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Summary */}
              {historySummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(historySummary.totalPayouts)}</div>
                      <p className="text-xs text-muted-foreground">{historySummary.totalRecords} records</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{historySummary.completedCount}</div>
                      <p className="text-xs text-muted-foreground">Successfully processed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Processing</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{historySummary.processingCount}</div>
                      <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* History List */}
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>All processed payouts</CardDescription>
                </CardHeader>
                <CardContent>
                  {payoutHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No payout history</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payoutHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{item.order.orderNumber}</h3>
                              <Badge 
                                variant={item.payout.status === 'COMPLETED' ? 'default' : 'secondary'}
                              >
                                {item.payout.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-2">
                              <div>
                                <span className="text-xs">Order Total:</span>
                                <p className="font-medium text-foreground">{formatCurrency(item.order.totalAmount, item.order.currency)}</p>
                              </div>
                              <div>
                                <span className="text-xs">Gross Amount:</span>
                                <p className="font-medium text-foreground">{formatCurrency(item.payout.grossAmount, item.payout.currency)}</p>
                              </div>
                              <div>
                                <span className="text-xs">Platform Fee:</span>
                                <p className="font-medium text-foreground">{formatCurrency(item.payout.platformCommission, item.payout.currency)}</p>
                              </div>
                              <div>
                                <span className="text-xs">Net Amount:</span>
                                <p className="font-medium text-accent">{formatCurrency(item.payout.netAmount, item.payout.currency)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Processed: {item.payment.processedDate ? formatDate(item.payment.processedDate) : 'N/A'}</span>
                              {item.payment.bankReference && (
                                <span>Reference: {item.payment.bankReference}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {historyPagination && historyPagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {historyPagination.page} of {historyPagination.pages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                          disabled={historyPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage(prev => Math.min(historyPagination.pages, prev + 1))}
                          disabled={historyPage === historyPagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {loading.summary ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : payoutsSummary ? (
            <>
              {/* Period Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Period:</span>
                <div className="flex gap-2">
                  {[7, 30, 90, 365].map((days) => (
                    <Button
                      key={days}
                      variant={summaryDays === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSummaryDays(days)}
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(payoutsSummary.summary.totalPaid)}</div>
                    <p className="text-xs text-muted-foreground">{payoutsSummary.summary.ordersCount} orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(payoutsSummary.summary.totalPaidOut)}</div>
                    <p className="text-xs text-muted-foreground">Net amount</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(payoutsSummary.summary.totalPlatformFee)}</div>
                    <p className="text-xs text-muted-foreground">Total commission</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(payoutsSummary.summary.pendingAmount)}</div>
                    <p className="text-xs text-muted-foreground">{payoutsSummary.summary.pendingOrders} pending</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Payouts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payouts</CardTitle>
                  <CardDescription>Latest payouts in the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {payoutsSummary.recentPayouts.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No recent payouts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payoutsSummary.recentPayouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{formatCurrency(payout.amount)}</p>
                                <Badge 
                                  variant={payout.status === 'COMPLETED' ? 'default' : 'secondary'}
                                >
                                  {payout.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Processed: {formatDate(payout.processedDate)}</span>
                                {payout.bankReference && (
                                  <span>Reference: {payout.bankReference}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No summary data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
