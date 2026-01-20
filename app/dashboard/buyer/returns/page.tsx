"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  RotateCcw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  FileText,
  BadgeCheck,
  BadgeX,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getReturns, createReturnJson, createReturnMultipart, type BuyerReturn } from "@/lib/api/returns"
import { getOrders, type OrderResponse } from "@/lib/api/orders"
import { format } from "date-fns"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  // Common lifecycle statuses (backend may send many more)
  PENDING: { icon: Clock, label: "Pending", color: "text-yellow-400" },
  APPROVED: { icon: CheckCircle2, label: "Approved", color: "text-green-400" },
  REJECTED: { icon: XCircle, label: "Rejected", color: "text-red-400" },
  PROCESSING: { icon: Package, label: "Processing", color: "text-blue-400" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", color: "text-green-400" },
  RESOLVED_BUYER_FAVOR: { icon: BadgeCheck, label: "Resolved (Buyer Favor)", color: "text-green-400" },
  RESOLVED_SELLER_FAVOR: { icon: BadgeX, label: "Resolved (Seller Favor)", color: "text-red-400" },
}

export default function ReturnsPage() {
  const { toast } = useToast()
  const [returns, setReturns] = useState<BuyerReturn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [selectedReturn, setSelectedReturn] = useState<BuyerReturn | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Create return dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    orderId: "",
    requestType: "RETURN" as "RETURN" | "EXCHANGE" | "DISPUTE",
    returnReason: "" as "" | "WRONG_PART" | "DEFECTIVE" | "CHANGE_OF_MIND" | "COUNTERFEIT",
    description: "",
    evidenceUrls: [] as string[],
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [evidenceUrlInput, setEvidenceUrlInput] = useState("")

  const loadReturns = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getReturns(page, 20)
      setReturns(data.returns)
      setPagination(data.pagination)
    } catch (error: any) {
      console.error("Error loading returns:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load returns",
      })
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadReturns()
  }, [loadReturns])

  // Load orders when create dialog opens
  useEffect(() => {
    if (isCreateDialogOpen) {
      loadOrders()
    }
  }, [isCreateDialogOpen])

  const loadOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const data = await getOrders(1, 100) // Load more orders for selection
      // Only allow return requests for delivered orders
      const deliveredOrders = (data.data || []).filter((o) => o.status === "DELIVERED")
      setOrders(deliveredOrders)
    } catch (error: any) {
      console.error("Error loading orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load orders",
      })
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addEvidenceUrl = () => {
    if (evidenceUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        evidenceUrls: [...prev.evidenceUrls, evidenceUrlInput.trim()],
      }))
      setEvidenceUrlInput("")
    }
  }

  const removeEvidenceUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.orderId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select an order",
      })
      return
    }
    if (!formData.description || formData.description.length < 10 || formData.description.length > 1000) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Description must be between 10 and 1000 characters",
      })
      return
    }
    if (uploadedFiles.length === 0 && formData.evidenceUrls.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide at least one evidence item (upload files or add URLs)",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (uploadedFiles.length > 0) {
        // Use multipart/form-data
        await createReturnMultipart({
          orderId: formData.orderId,
          requestType: formData.requestType,
          returnReason: formData.returnReason || undefined,
          description: formData.description,
          files: uploadedFiles,
          evidenceUrls: formData.evidenceUrls.length > 0 ? formData.evidenceUrls : undefined,
        })
      } else {
        // Use JSON
        await createReturnJson({
          orderId: formData.orderId,
          requestType: formData.requestType,
          returnReason: formData.returnReason || undefined,
          description: formData.description,
          evidenceUrls: formData.evidenceUrls,
        })
      }

      // Reset form
      setFormData({
        orderId: "",
        requestType: "RETURN",
        returnReason: "",
        description: "",
        evidenceUrls: [],
      })
      setUploadedFiles([])
      setEvidenceUrlInput("")
      setIsCreateDialogOpen(false)

      // Reload returns
      await loadReturns()
      toast({
        title: "Success",
        description: "Return request submitted successfully!",
      })
    } catch (error: any) {
      console.error("Error creating return:", error)
      
      // Handle specific error cases
      let errorMessage = "Failed to submit return request"
      
      // Extract error message from various possible error structures
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Check for duplicate return request error (case-insensitive)
      const lowerMessage = errorMessage.toLowerCase()
      if (lowerMessage.includes("already exists") || 
          lowerMessage.includes("return/dispute request already exists") ||
          lowerMessage.includes("return request already exists")) {
        errorMessage = "A return/dispute request already exists for this order. Please check your returns list."
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false)
    setFormData({
      orderId: "",
      requestType: "RETURN",
      returnReason: "",
      description: "",
      evidenceUrls: [],
    })
    setUploadedFiles([])
    setEvidenceUrlInput("")
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || { icon: AlertCircle, label: status, color: "text-muted-foreground" }
  }

  const openDetails = (r: BuyerReturn) => {
    setSelectedReturn(r)
    setIsDialogOpen(true)
  }

  const primaryItem = useMemo(() => {
    const item = selectedReturn?.order?.items?.[0]
    if (!item) return null
    const raw = item.inventory?.sellerImages?.[0] || ""
    const src = raw?.startsWith("//") ? `https:${raw}` : raw
    return {
      name: item.inventory?.masterProduct?.name || "Item",
      image: src || "/placeholder.svg",
      qty: item.quantity,
      price: item.unitPrice,
    }
  }, [selectedReturn])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
              Returns & Exchanges
            </h1>
            <p className="text-muted-foreground font-light">
              Manage your return and exchange requests
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Return
          </Button>
        </div>
      </motion.div>

      {/* Returns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : returns.length === 0 ? (
        <div className="glass-card rounded-lg p-12 text-center">
          <RotateCcw className="h-16 w-16 text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-light text-foreground mb-2">No returns yet</h2>
          <p className="text-muted-foreground font-light mb-6">
            You haven't requested any returns or exchanges
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Return
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem, index) => {
            const status = getStatusConfig(returnItem.status)
            const StatusIcon = status.icon

            return (
              <motion.div
                key={returnItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-card rounded-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-light text-foreground">
                        Return #{returnItem.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className={`flex items-center gap-2 ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-light">{status.label}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground font-light text-sm mb-2">
                      Order: {returnItem.order?.orderNumber || "N/A"}
                    </p>
                    <p className="text-muted-foreground font-light text-sm">
                      Requested: {formatDate(returnItem.createdAt)}
                    </p>
                    {returnItem.returnReason && (
                      <p className="text-muted-foreground font-light text-sm mt-2">
                        Reason: {returnItem.returnReason}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded">
                        <FileText className="h-3 w-3" />
                        {returnItem.requestType}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded">
                        <AlertCircle className="h-3 w-3" />
                        {returnItem.disputeType}
                      </span>
                      {typeof returnItem.returnLogisticsCost === "number" && (
                        <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded">
                          Logistics: {returnItem.returnLogisticsCost}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDetails(returnItem)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-muted-foreground font-light">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Dialog (uses list data; no extra API call) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-5xl !w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Return Details</DialogTitle>
            <DialogDescription>
              {selectedReturn?.order?.orderNumber ? `Order ${selectedReturn.order.orderNumber}` : "Return request"}
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const s = getStatusConfig(selectedReturn.status)
                    const Icon = s.icon
                    return (
                      <>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                        <span className={`font-light ${s.color}`}>{s.label}</span>
                      </>
                    )
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Created: {formatDate(selectedReturn.createdAt)} • Updated: {formatDate(selectedReturn.updatedAt)}
                </div>
              </div>

              {primaryItem && (
                <div className="glass-card rounded-lg p-4 flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    <Image src={primaryItem.image} alt={primaryItem.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-light text-lg">{primaryItem.name}</p>
                    <p className="text-muted-foreground text-sm font-light mt-1">
                      Qty: {primaryItem.qty} • Unit: {selectedReturn.order?.currency || "USD"}{" "}
                      {typeof primaryItem.price === "number" ? primaryItem.price.toFixed(2) : primaryItem.price}
                    </p>
                    {selectedReturn.order?.items?.length && selectedReturn.order.items.length > 1 && (
                      <p className="text-muted-foreground text-sm font-light mt-1">
                        + {selectedReturn.order.items.length - 1} more item(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-light mb-2">Request</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground font-light">{selectedReturn.requestType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Dispute</span>
                      <span className="text-foreground font-light">{selectedReturn.disputeType}</span>
                    </div>
                    {selectedReturn.returnReason && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reason</span>
                        <span className="text-foreground font-light">{selectedReturn.returnReason}</span>
                      </div>
                    )}
                    {selectedReturn.faultClassification && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fault</span>
                        <span className="text-foreground font-light">{selectedReturn.faultClassification}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-light mb-2">Resolution</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Resolved At</span>
                      <span className="text-foreground font-light">{formatDate(selectedReturn.resolutionDate)}</span>
                    </div>
                    {typeof selectedReturn.returnLogisticsCost === "number" && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Logistics Cost</span>
                        <span className="text-foreground font-light">{selectedReturn.returnLogisticsCost}</span>
                      </div>
                    )}
                    {selectedReturn.logisticsCostChargedTo && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Charged To</span>
                        <span className="text-foreground font-light">{selectedReturn.logisticsCostChargedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-light mb-2">Buyer Description</p>
                <p className="text-foreground font-light text-sm whitespace-pre-wrap">
                  {selectedReturn.buyerDescription || "—"}
                </p>
              </div>

              {(selectedReturn.sellerResponse || selectedReturn.adminNotes) && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground font-light mb-2">Seller Response</p>
                    <p className="text-foreground font-light text-sm whitespace-pre-wrap">
                      {selectedReturn.sellerResponse || "—"}
                    </p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-sm text-muted-foreground font-light mb-2">Admin Notes</p>
                    <p className="text-foreground font-light text-sm whitespace-pre-wrap">
                      {selectedReturn.adminNotes || "—"}
                    </p>
                  </div>
                </div>
              )}

              {!!selectedReturn.buyerEvidenceUrls?.length && (
                <div className="glass-card rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-light mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Buyer Evidence
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedReturn.buyerEvidenceUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-accent hover:underline break-all"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Return Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="!max-w-2xl !w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Create Return/Exchange Request</DialogTitle>
            <DialogDescription>
              Submit a return or exchange request for an order. You must provide evidence (photos/videos) showing the issue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Select Order */}
            <div className="space-y-2">
              <Label htmlFor="orderId">
                Select Order <span className="text-destructive">*</span>
              </Label>
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                </div>
              ) : (
                <Select
                  value={formData.orderId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, orderId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No orders available
                      </div>
                    ) : (
                      orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} - {order.currency} {order.totalAmount.toFixed(2)} ({order.status})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Request Type */}
            <div className="space-y-2">
              <Label htmlFor="requestType">
                Request Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.requestType}
                onValueChange={(value: "RETURN" | "EXCHANGE" | "DISPUTE") =>
                  setFormData((prev) => ({ ...prev, requestType: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETURN">Return</SelectItem>
                  <SelectItem value="EXCHANGE">Exchange</SelectItem>
                  <SelectItem value="DISPUTE">Dispute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Return Reason */}
            <div className="space-y-2">
              <Label htmlFor="returnReason">Return Reason</Label>
              <Select
                value={formData.returnReason || "NONE"}
                onValueChange={(value: "NONE" | "WRONG_PART" | "DEFECTIVE" | "CHANGE_OF_MIND" | "COUNTERFEIT") =>
                  setFormData((prev) => ({ ...prev, returnReason: value === "NONE" ? "" : value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="WRONG_PART">Wrong Part</SelectItem>
                  <SelectItem value="DEFECTIVE">Defective</SelectItem>
                  <SelectItem value="CHANGE_OF_MIND">Change of Mind</SelectItem>
                  <SelectItem value="COUNTERFEIT">Counterfeit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span> (10-1000 characters)
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-24"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length} / 1000 characters
              </p>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-2">
              <Label>
                Evidence (Photos/Videos) <span className="text-destructive">*</span>
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mb-4">Photos or videos showing the issue</p>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Select Files
                </Button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 rounded p-2">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence URLs */}
            <div className="space-y-2">
              <Label>Evidence URLs (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter evidence URL"
                  value={evidenceUrlInput}
                  onChange={(e) => setEvidenceUrlInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addEvidenceUrl()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addEvidenceUrl}>
                  Add
                </Button>
              </div>
              {formData.evidenceUrls.length > 0 && (
                <div className="space-y-2 mt-2">
                  {formData.evidenceUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 rounded p-2">
                      <span className="text-sm truncate flex-1">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvidenceUrl(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseCreateDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
