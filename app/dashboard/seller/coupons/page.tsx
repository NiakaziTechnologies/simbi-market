"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Ticket,
  Search,
  Plus,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  DollarSign,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  getSellerCoupons,
  createSellerCoupon,
  type SellerCoupon,
  type CreateCouponRequest,
} from "@/lib/api/seller-coupons"
import { getSellerInventory, type InventoryListing } from "@/lib/api/seller-inventory"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<SellerCoupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [inventoryProducts, setInventoryProducts] = useState<InventoryListing[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<InventoryListing | null>(null)
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<CreateCouponRequest>({
    name: "",
    description: "",
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscount: 0,
    productId: "",
    isActive: true,
    usageLimit: undefined,
    userUsageLimit: undefined,
    validFrom: "",
    validUntil: "",
  })

  const loadCoupons = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSellerCoupons(page, limit)
      setCoupons(data.coupons)
      setTotalPages(data.pagination.totalPages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  const loadInventoryProducts = useCallback(async () => {
    try {
      setIsLoadingInventory(true)
      const data = await getSellerInventory(1, 100) // Load first 100 products
      setInventoryProducts(data.inventory)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load inventory products",
        variant: "destructive",
      })
    } finally {
      setIsLoadingInventory(false)
    }
  }, [toast])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  useEffect(() => {
    if (isCreateModalOpen) {
      loadInventoryProducts()
    }
  }, [isCreateModalOpen, loadInventoryProducts])

  const filteredCoupons = coupons.filter((coupon) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      coupon.code?.toLowerCase().includes(query) ||
      coupon.name?.toLowerCase().includes(query) ||
      coupon.description?.toLowerCase().includes(query)
    )
  })

  const filteredProducts = inventoryProducts.filter((product) => {
    if (!productSearchQuery) return true
    const query = productSearchQuery.toLowerCase()
    return (
      product.masterProduct.name?.toLowerCase().includes(query) ||
      product.masterProduct.oemPartNumber?.toLowerCase().includes(query) ||
      product.sellerSku?.toLowerCase().includes(query)
    )
  })

  const handleProductSelect = (product: InventoryListing) => {
    setSelectedProduct(product)
    setFormData(prev => ({
      ...prev,
      productId: product.id,
    }))
    setIsProductSelectOpen(false)
  }

  const handleCreateCoupon = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon name",
        variant: "destructive",
      })
      return
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid discount value",
        variant: "destructive",
      })
      return
    }

    if (!formData.minimumOrderAmount || formData.minimumOrderAmount < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid minimum order amount",
        variant: "destructive",
      })
      return
    }

    if (!formData.validFrom || !formData.validUntil) {
      toast({
        title: "Error",
        description: "Please select valid from and until dates",
        variant: "destructive",
      })
      return
    }

    // Convert datetime-local to ISO string
    const validFromISO = new Date(formData.validFrom).toISOString()
    const validUntilISO = new Date(formData.validUntil).toISOString()

    if (new Date(validFromISO) >= new Date(validUntilISO)) {
      toast({
        title: "Error",
        description: "Valid until date must be after valid from date",
        variant: "destructive",
      })
      return
    }

    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const requestData: CreateCouponRequest = {
        ...formData,
        validFrom: validFromISO,
        validUntil: validUntilISO,
        maximumDiscount: formData.maximumDiscount && formData.maximumDiscount > 0 ? formData.maximumDiscount : undefined,
      }
      await createSellerCoupon(requestData)
      toast({
        title: "Success",
        description: "Coupon created successfully",
      })
      setIsCreateModalOpen(false)
      setSelectedProduct(null)
      setFormData({
        name: "",
        description: "",
        discountValue: 0,
        minimumOrderAmount: 0,
        maximumDiscount: 0,
        productId: "",
        isActive: true,
        usageLimit: undefined,
        userUsageLimit: undefined,
        validFrom: "",
        validUntil: "",
      })
      loadCoupons()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create coupon",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
              Coupons
            </h1>
            <p className="text-muted-foreground font-light">
              Create and manage discount coupons
            </p>
          </div>
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </motion.div>

      {/* Coupons Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Coupons
              </CardTitle>
              <CardDescription>
                {total > 0 ? `${total} total coupon${total !== 1 ? 's' : ''}` : "No coupons"}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search coupons..."
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
              <Button onClick={loadCoupons} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No coupons found matching your search" : "No coupons found"}
              </p>
              {!searchQuery && (
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Coupon
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min. Order</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon, index) => {
                    const isExpired = new Date(coupon.validUntil) < new Date()
                    const isValid = !isExpired && coupon.isActive

                    return (
                      <motion.tr
                        key={coupon.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium text-foreground font-mono">
                            {coupon.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{coupon.name}</div>
                            {coupon.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {coupon.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {coupon.discountType === "PERCENTAGE" ? (
                              <>
                                <Percent className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">{coupon.discountValue}%</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">{coupon.discountValue}</span>
                              </>
                            )}
                            {coupon.maximumDiscount && (
                              <span className="text-xs text-muted-foreground">
                                (max {formatCurrency(coupon.maximumDiscount)})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-foreground">
                            {formatCurrency(coupon.minimumOrderAmount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {coupon.usageCount} / {coupon.usageLimit || "∞"}
                          </div>
                          {coupon.userUsageLimit && (
                            <div className="text-xs text-muted-foreground">
                              {coupon.userUsageLimit} per user
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-foreground">
                              {format(new Date(coupon.validFrom), "MMM dd, yyyy")}
                            </div>
                            <div className="text-muted-foreground">
                              to {format(new Date(coupon.validUntil), "MMM dd, yyyy")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isValid
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : isExpired
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }
                          >
                            {isValid ? "Active" : isExpired ? "Expired" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(coupon.createdAt), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-3xl !w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a discount coupon for your products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this coupon"
                  rows={2}
                />
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Select Product *</Label>
              <Popover open={isProductSelectOpen} onOpenChange={setIsProductSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isProductSelectOpen}
                    className="w-full justify-between h-auto min-h-[3rem]"
                  >
                    {selectedProduct ? (
                      <div className="flex items-center gap-3 flex-1 text-left">
                        {selectedProduct.sellerImages?.[0] || selectedProduct.masterProduct.imageUrls?.[0] && (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={normalizeImageUrl(selectedProduct.sellerImages?.[0] || selectedProduct.masterProduct.imageUrls?.[0])}
                              alt={selectedProduct.masterProduct.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{selectedProduct.masterProduct.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            OEM: {selectedProduct.masterProduct.oemPartNumber}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Search and select a product...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search products by name, OEM, or SKU..."
                      value={productSearchQuery}
                      onValueChange={setProductSearchQuery}
                    />
                    <CommandList>
                      {isLoadingInventory ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <CommandEmpty>No products found.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredProducts.map((product) => {
                            const imageUrl = product.sellerImages?.[0] || product.masterProduct.imageUrls?.[0]
                            return (
                              <CommandItem
                                key={product.id}
                                value={`${product.masterProduct.name} ${product.masterProduct.oemPartNumber} ${product.sellerSku}`}
                                onSelect={() => handleProductSelect(product)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  {imageUrl && (
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                      <Image
                                        src={normalizeImageUrl(imageUrl)}
                                        alt={product.masterProduct.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{product.masterProduct.name}</div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      OEM: {product.masterProduct.oemPartNumber}
                                    </div>
                                    {product.sellerSku && (
                                      <div className="text-xs text-muted-foreground">
                                        SKU: {product.sellerSku}
                                      </div>
                                    )}
                                  </div>
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Discount Settings */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value (%) *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountValue || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumDiscount">Maximum Discount (USD)</Label>
                <Input
                  id="maximumDiscount"
                  type="number"
                  min="0"
                  value={formData.maximumDiscount || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, maximumDiscount: parseFloat(e.target.value) || 0 }))}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">Minimum Order Amount (USD) *</Label>
                <Input
                  id="minimumOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderAmount || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="10.00"
                />
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userUsageLimit">Usage Limit Per User</Label>
                <Input
                  id="userUsageLimit"
                  type="number"
                  min="0"
                  value={formData.userUsageLimit || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, userUsageLimit: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Validity Period */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formData.validFrom ? new Date(formData.validFrom).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value)
                      setFormData(prev => ({ ...prev, validFrom: date.toISOString() }))
                    } else {
                      setFormData(prev => ({ ...prev, validFrom: "" }))
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={formData.validUntil ? new Date(formData.validUntil).toISOString().slice(0, 16) : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value)
                      setFormData(prev => ({ ...prev, validUntil: date.toISOString() }))
                    } else {
                      setFormData(prev => ({ ...prev, validUntil: "" }))
                    }
                  }}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this coupon
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setSelectedProduct(null)
                  setFormData({
                    name: "",
                    description: "",
                    discountValue: 0,
                    minimumOrderAmount: 0,
                    maximumDiscount: 0,
                    productId: "",
                    isActive: true,
                    usageLimit: undefined,
                    userUsageLimit: undefined,
                    validFrom: "",
                    validUntil: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCoupon}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
