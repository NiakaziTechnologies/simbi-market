"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Eye, Clock, AlertCircle, Shield, Loader2 } from "lucide-react"
import { getPendingReturns, classifyFault, type AdminReturn } from "@/lib/api/admin-returns"
import { formatDistanceToNow, format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const statusColors: Record<string, string> = {
  OPEN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RESOLVED_BUYER_FAVOR: "bg-green-500/20 text-green-400 border-green-500/30",
  RESOLVED_SELLER_FAVOR: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  RESOLVED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
}

const requestTypeColors: Record<string, string> = {
  RETURN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EXCHANGE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DISPUTE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}

const FAULT_CLASSIFICATIONS = [
  { value: "BUYER_FAULT", label: "Buyer Fault" },
  { value: "SELLER_FAULT", label: "Seller Fault" },
  { value: "NO_FAULT", label: "No Fault" },
  { value: "UNCLASSIFIED", label: "Unclassified" },
]

export function PendingReturnsTab() {
  const [returns, setReturns] = useState<AdminReturn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [selectedReturn, setSelectedReturn] = useState<AdminReturn | null>(null)
  const [isClassifyModalOpen, setIsClassifyModalOpen] = useState(false)
  const [faultClassification, setFaultClassification] = useState("")
  const [reason, setReason] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [isClassifying, setIsClassifying] = useState(false)
  const { toast } = useToast()

  const loadReturns = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getPendingReturns(page, limit)
      setReturns(data.returns)
      setTotalPages(data.pagination.totalPages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load pending returns')
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
      returnItem.buyer.firstName?.toLowerCase().includes(query) ||
      returnItem.buyer.lastName?.toLowerCase().includes(query) ||
      returnItem.buyer.email?.toLowerCase().includes(query) ||
      returnItem.seller.businessName?.toLowerCase().includes(query) ||
      returnItem.returnReason?.toLowerCase().includes(query)
    )
  })

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  const normalizeImageUrl = (url: string | null | undefined): string => {
    if (!url) return ""
    if (url.startsWith("//")) {
      return `https:${url}`
    }
    if (url.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL || "https://simbi-three.vercel.app"}${url}`
    }
    return url
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Returns
              </CardTitle>
              <CardDescription>
                {total > 0 ? `${total} pending return(s) requiring review` : "Returns pending admin review"}
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
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No pending returns found matching your search" : "No pending returns"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Order</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SLO Target</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((returnItem) => (
                      <TableRow
                        key={returnItem.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {returnItem.order.orderNumber}
                            </div>
                            <div className="text-muted-foreground">
                              {returnItem.order.currency} {returnItem.order.totalAmount.toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {returnItem.buyer.firstName} {returnItem.buyer.lastName}
                            </div>
                            <div className="text-muted-foreground">{returnItem.buyer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {returnItem.seller.businessName}
                            </div>
                            <div className="text-muted-foreground">{returnItem.seller.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={requestTypeColors[returnItem.requestType] || "bg-muted text-muted-foreground"}>
                            {returnItem.requestType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {returnItem.returnReason.replace(/_/g, ' ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[returnItem.status] || "bg-muted text-muted-foreground"}>
                            {returnItem.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {returnItem.sloTargetDate ? (
                              <>
                                <div className="text-foreground">
                                  {format(new Date(returnItem.sloTargetDate), "MMM dd, yyyy")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(returnItem.sloTargetDate)}
                                </div>
                              </>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(returnItem.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedReturn(returnItem)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing page {page} of {totalPages} ({total} total returns)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Return Detail Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={(open) => !open && setSelectedReturn(null)}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] max-h-[90vh] overflow-y-auto">
          {selectedReturn && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Return Request Details</DialogTitle>
                <DialogDescription>
                  Complete information for return #{selectedReturn.id.slice(0, 8)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Return Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Request Type</div>
                        <Badge variant="outline" className={requestTypeColors[selectedReturn.requestType] || "bg-muted text-muted-foreground"}>
                          {selectedReturn.requestType}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant="outline" className={statusColors[selectedReturn.status] || "bg-muted text-muted-foreground"}>
                          {selectedReturn.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Return Reason</div>
                        <div className="font-medium">{selectedReturn.returnReason.replace(/_/g, ' ')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Fault Based</div>
                        <Badge variant="outline">
                          {selectedReturn.isFaultBased ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {selectedReturn.faultClassification && (
                        <div>
                          <div className="text-sm text-muted-foreground">Fault Classification</div>
                          <div className="font-medium">{selectedReturn.faultClassification.replace(/_/g, ' ')}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">SLO Target Date</div>
                        <div className="font-medium">
                          {selectedReturn.sloTargetDate ? format(new Date(selectedReturn.sloTargetDate), "PPpp") : "N/A"}
                        </div>
                      </div>
                      {selectedReturn.sloBreached && (
                        <div>
                          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                            SLO Breached
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Order Number</div>
                        <div className="font-medium">{selectedReturn.order.orderNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="font-medium">
                          {selectedReturn.order.currency} {selectedReturn.order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Order Status</div>
                        <Badge variant="outline">{selectedReturn.order.status}</Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Status</div>
                        <Badge variant="outline">{selectedReturn.order.paymentStatus}</Badge>
                      </div>
                      {selectedReturn.order.poNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground">PO Number</div>
                          <div className="font-medium">{selectedReturn.order.poNumber}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Buyer & Seller Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Buyer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">
                          {selectedReturn.buyer.firstName} {selectedReturn.buyer.lastName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{selectedReturn.buyer.email}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Seller Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Business Name</div>
                        <div className="font-medium">{selectedReturn.seller.businessName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{selectedReturn.seller.email}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description & Responses */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Description & Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Buyer Description</div>
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        {selectedReturn.buyerDescription || "No description provided"}
                      </div>
                    </div>
                    {selectedReturn.sellerResponse && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Seller Response</div>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          {selectedReturn.sellerResponse}
                        </div>
                      </div>
                    )}
                    {selectedReturn.adminNotes && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Admin Notes</div>
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          {selectedReturn.adminNotes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Evidence */}
                {(selectedReturn.buyerEvidenceUrls?.length || selectedReturn.sellerEvidenceUrls?.length) && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Evidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedReturn.buyerEvidenceUrls && selectedReturn.buyerEvidenceUrls.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-2">Buyer Evidence</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedReturn.buyerEvidenceUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={normalizeImageUrl(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={normalizeImageUrl(url)}
                                  alt={`Buyer evidence ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedReturn.sellerEvidenceUrls && selectedReturn.sellerEvidenceUrls.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Seller Evidence</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedReturn.sellerEvidenceUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={normalizeImageUrl(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={normalizeImageUrl(url)}
                                  alt={`Seller evidence ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Order Items */}
                {selectedReturn.order.items && selectedReturn.order.items.length > 0 && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedReturn.order.items.map((item) => (
                          <div key={item.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium">{item.inventory.masterProduct.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  SKU: {item.inventory.sellerSku}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × {item.inventory.currency} {item.unitPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {item.inventory.currency} {(item.displayPrice * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Logistics & Financial */}
                {(selectedReturn.returnLogisticsCost || selectedReturn.logisticsCostChargedTo) && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Logistics & Financial</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedReturn.returnLogisticsCost && (
                        <div>
                          <div className="text-sm text-muted-foreground">Return Logistics Cost</div>
                          <div className="font-medium">USD {selectedReturn.returnLogisticsCost.toFixed(2)}</div>
                        </div>
                      )}
                      {selectedReturn.logisticsCostChargedTo && (
                        <div>
                          <div className="text-sm text-muted-foreground">Cost Charged To</div>
                          <Badge variant="outline">{selectedReturn.logisticsCostChargedTo}</Badge>
                        </div>
                      )}
                      {selectedReturn.returnLabelTrackingNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground">Tracking Number</div>
                          <div className="font-medium">{selectedReturn.returnLabelTrackingNumber}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Timestamps */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="font-medium">
                        {format(new Date(selectedReturn.createdAt), "PPpp")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(selectedReturn.createdAt)}
                      </div>
                    </div>
                    {selectedReturn.resolutionDate && (
                      <div>
                        <div className="text-sm text-muted-foreground">Resolution Date</div>
                        <div className="font-medium">
                          {format(new Date(selectedReturn.resolutionDate), "PPpp")}
                        </div>
                      </div>
                    )}
                    {selectedReturn.sellerReceiptConfirmedAt && (
                      <div>
                        <div className="text-sm text-muted-foreground">Seller Receipt Confirmed</div>
                        <div className="font-medium">
                          {format(new Date(selectedReturn.sellerReceiptConfirmedAt), "PPpp")}
                        </div>
                      </div>
                    )}
                    {selectedReturn.inspectionCompletedAt && (
                      <div>
                        <div className="text-sm text-muted-foreground">Inspection Completed</div>
                        <div className="font-medium">
                          {format(new Date(selectedReturn.inspectionCompletedAt), "PPpp")}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
