"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  RotateCcw,
  Search,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
  Image as ImageIcon,
  User,
  Package,
  FileText,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getSellerReturns,
  submitSellerResponse,
  type SellerReturn,
} from "@/lib/api/seller-returns"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function normalizeImageUrl(url: string): string {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("//")) return `https:${url}`
  if (url.startsWith("http")) return url
  return url
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    "UNDER_REVIEW": {
      label: "Under Review",
      variant: "outline",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },
    "RESOLVED_BUYER_FAVOR": {
      label: "Resolved (Buyer Favor)",
      variant: "outline",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    "RESOLVED_SELLER_FAVOR": {
      label: "Resolved (Seller Favor)",
      variant: "outline",
      className: "bg-green-500/20 text-green-400 border-green-500/30"
    },
    "RESOLVED": {
      label: "Resolved",
      variant: "outline",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    },
    "OPEN": {
      label: "Open",
      variant: "outline",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    "CLOSED": {
      label: "Closed",
      variant: "outline",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    },
  }

  const statusInfo = statusMap[status] || {
    label: status,
    variant: "outline" as const,
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <Badge variant={statusInfo.variant} className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  )
}

function getFaultBadge(faultClassification: string | null) {
  if (!faultClassification) return null

  const faultMap: Record<string, { label: string; className: string }> = {
    "BUYER_FAULT": {
      label: "Buyer Fault",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    "SELLER_FAULT": {
      label: "Seller Fault",
      className: "bg-red-500/20 text-red-400 border-red-500/30"
    },
    "NO_FAULT": {
      label: "No Fault",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    },
    "UNCLASSIFIED": {
      label: "Unclassified",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },
  }

  const faultInfo = faultMap[faultClassification] || {
    label: faultClassification,
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <Badge variant="outline" className={faultInfo.className}>
      {faultInfo.label}
    </Badge>
  )
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<SellerReturn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [selectedReturn, setSelectedReturn] = useState<SellerReturn | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const { toast } = useToast()

  const loadReturns = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSellerReturns(page, limit)
      setReturns(data.returns)
      setTotalPages(data.pagination.totalPages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load returns')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadReturns()
  }, [loadReturns])

  const filteredReturns = returns.filter((returnItem) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      returnItem.order.orderNumber?.toLowerCase().includes(query) ||
      returnItem.id?.toLowerCase().includes(query) ||
      returnItem.buyer.firstName?.toLowerCase().includes(query) ||
      returnItem.buyer.lastName?.toLowerCase().includes(query) ||
      returnItem.buyer.email?.toLowerCase().includes(query)
    )
  })

  const handleViewDetails = (returnItem: SellerReturn) => {
    setSelectedReturn(returnItem)
    setResponseText(returnItem.sellerResponse || "")
    setIsDetailModalOpen(true)
  }

  const handleSubmitResponse = async () => {
    if (!selectedReturn) return

    if (!responseText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive",
      })
      return
    }

    if (responseText.trim().length < 10) {
      toast({
        title: "Error",
        description: "Response must be at least 10 characters",
        variant: "destructive",
      })
      return
    }

    if (responseText.trim().length > 2000) {
      toast({
        title: "Error",
        description: "Response must be less than 2000 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmittingResponse(true)
      await submitSellerResponse(selectedReturn.id, { response: responseText.trim() })
      toast({
        title: "Success",
        description: "Response submitted successfully",
      })
      // Reload returns to get updated data
      await loadReturns()
      // Update selected return with new response
      setSelectedReturn(prev => prev ? { ...prev, sellerResponse: responseText.trim() } : null)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit response",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingResponse(false)
    }
  }

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
          Returns
        </h1>
        <p className="text-muted-foreground font-light">
          Manage return requests and disputes
        </p>
      </motion.div>

      {/* Returns Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Return Requests
              </CardTitle>
              <CardDescription>
                {total > 0 ? `${total} total return${total !== 1 ? 's' : ''}` : "No returns"}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search returns..."
                className="pl-9 bg-muted/50 border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadReturns} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No returns found matching your search" : "No returns found"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Return ID</TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fault Classification</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem, index) => (
                    <motion.tr
                      key={returnItem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium text-foreground font-mono text-sm">
                          #{returnItem.id.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {returnItem.order.orderNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {returnItem.buyer.firstName} {returnItem.buyer.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {returnItem.buyer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {returnItem.requestType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(returnItem.status)}
                      </TableCell>
                      <TableCell>
                        {getFaultBadge(returnItem.faultClassification)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(returnItem.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(returnItem)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="!max-w-5xl !w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedReturn && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">Return Details</DialogTitle>
                <DialogDescription>
                  View and respond to return request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Header Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Return ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground font-mono">
                        #{selectedReturn.id.slice(0, 8)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(selectedReturn.status)}
                    </CardContent>
                  </Card>
                </div>

                {/* Return Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-light flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Return Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Request Type</Label>
                        <div className="mt-1">
                          <Badge variant="outline">{selectedReturn.requestType}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Return Reason</Label>
                        <div className="mt-1 text-foreground">
                          {selectedReturn.returnReason.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Order Number</Label>
                        <div className="mt-1 text-foreground font-medium">
                          {selectedReturn.order.orderNumber}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedReturn.status)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Created</Label>
                        <div className="mt-1 text-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(selectedReturn.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dispute Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-light flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Dispute Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Dispute Type</Label>
                        <div className="mt-1">
                          <Badge variant="outline">{selectedReturn.disputeType}</Badge>
                        </div>
                      </div>
                      {selectedReturn.faultClassification && (
                        <div>
                          <Label className="text-muted-foreground">Fault Classification</Label>
                          <div className="mt-1">
                            {getFaultBadge(selectedReturn.faultClassification)}
                          </div>
                        </div>
                      )}
                      <div>
                        <Label className="text-muted-foreground">Order Amount</Label>
                        <div className="mt-1 text-foreground font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(selectedReturn.order.totalAmount, selectedReturn.order.currency)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Logistics Cost Charged To</Label>
                        <div className="mt-1">
                          <Badge variant="outline">
                            {selectedReturn.logisticsCostChargedTo}
                          </Badge>
                        </div>
                      </div>
                      {selectedReturn.returnLogisticsCost > 0 && (
                        <div>
                          <Label className="text-muted-foreground">Return Logistics Cost</Label>
                          <div className="mt-1 text-foreground font-medium flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(selectedReturn.returnLogisticsCost, selectedReturn.order.currency)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Buyer Evidence Images */}
                {selectedReturn.buyerEvidenceUrls && selectedReturn.buyerEvidenceUrls.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-light flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Buyer Evidence Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedReturn.buyerEvidenceUrls.map((url, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                          >
                            <Image
                              src={normalizeImageUrl(url)}
                              alt={`Buyer evidence ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Buyer Description */}
                {selectedReturn.buyerDescription && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-light flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Buyer Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground whitespace-pre-wrap">
                        {selectedReturn.buyerDescription}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Seller Response */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-light flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Seller Response/Comment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedReturn.sellerResponse ? (
                      <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <Label className="text-muted-foreground mb-2 block">Your Response</Label>
                        <p className="text-foreground whitespace-pre-wrap">
                          {selectedReturn.sellerResponse}
                        </p>
                        {selectedReturn.updatedAt && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Submitted on {format(new Date(selectedReturn.updatedAt), "MMMM dd, yyyy 'at' h:mm a")}
                          </p>
                        )}
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
                          <p className="text-sm text-blue-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Response already submitted. You cannot modify or resubmit your response.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Enter your response to the buyer's return request..."
                            rows={6}
                            className="min-h-[150px]"
                          />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Minimum 10 characters, maximum 2000 characters</span>
                            <span className={responseText.length > 2000 ? "text-destructive" : ""}>
                              {responseText.length}/2000
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={handleSubmitResponse}
                          disabled={isSubmittingResponse || !responseText.trim() || responseText.trim().length < 10 || responseText.trim().length > 2000}
                          className="bg-accent hover:bg-accent/90"
                        >
                          {isSubmittingResponse ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Submit Response
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Important Note and Confirm Receipt */}
                {!selectedReturn.sellerReceiptConfirmed && (
                  <>
                    <Card className="bg-blue-500/10 border-blue-500/30">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <Label className="text-blue-400 mb-2 block">Important</Label>
                            <p className="text-sm text-foreground">
                              Important: Confirm receipt within 12 hours of delivery. After confirmation, admin will perform final inspection and determine fault classification.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <Button
                          size="lg"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={true}
                        >
                          <Check className="h-5 w-5 mr-2" />
                          Confirm Receipt
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Note: Confirm receipt functionality will be available soon
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Receipt Confirmed Status */}
                {selectedReturn.sellerReceiptConfirmed && selectedReturn.sellerReceiptConfirmedAt && (
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <Label className="text-green-400 mb-2 block">Receipt Confirmed</Label>
                          <p className="text-sm text-foreground">
                            Receipt was confirmed on {format(new Date(selectedReturn.sellerReceiptConfirmedAt), "MMMM dd, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Admin Notes */}
                {selectedReturn.adminNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-light flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Admin Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground whitespace-pre-wrap">
                        {selectedReturn.adminNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Resolution Info */}
                {selectedReturn.resolutionDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-light flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Resolution Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-muted-foreground">Resolution Date</Label>
                        <div className="mt-1 text-foreground">
                          {format(new Date(selectedReturn.resolutionDate), "MMMM dd, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      {selectedReturn.resolutionOutcome && (
                        <div>
                          <Label className="text-muted-foreground">Resolution Outcome</Label>
                          <div className="mt-1 text-foreground">
                            {selectedReturn.resolutionOutcome}
                          </div>
                        </div>
                      )}
                      {selectedReturn.inspectionCompletedAt && (
                        <div>
                          <Label className="text-muted-foreground">Inspection Completed</Label>
                          <div className="mt-1 text-foreground">
                            {format(new Date(selectedReturn.inspectionCompletedAt), "MMMM dd, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
