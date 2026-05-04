"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Star,
  Loader2,
  Plus,
  FileDown,
  FileUp,
  FileSpreadsheet,
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
import {
  createInventoryListing,
  downloadBulkTemplate,
  downloadInventoryCsv,
  getBulkUploadStatus,
  getInventoryValueByCategory,
  getLowStockAlerts,
  getMasterCatalog,
  getSellerInventoryListings,
  quickUpdateListing,
  uploadBulkCsv,
  type CreateInventoryListingRequest,
  type InventoryListing,
  type CategoryValue,
  type MasterCatalogProduct,
  type LowStockAlertItem,
} from "@/lib/api/seller-inventory"
import { format } from "date-fns"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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

const COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#84cc16", // Lime
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [selectedItem, setSelectedItem] = useState<InventoryListing | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [categoryValueData, setCategoryValueData] = useState<{ categories: CategoryValue[], totalValue: number } | null>(null)
  const [isLoadingCategoryValue, setIsLoadingCategoryValue] = useState(true)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState<MasterCatalogProduct[]>([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<MasterCatalogProduct | null>(null)
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([])
  const [loadingLowStock, setLoadingLowStock] = useState(true)
  const [csvOpen, setCsvOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvUploadId, setCsvUploadId] = useState<string | null>(null)
  const [csvStatus, setCsvStatus] = useState<Record<string, unknown> | null>(null)
  const [csvBusy, setCsvBusy] = useState(false)
  const [rowSaving, setRowSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ id: string; field: "sellerPrice" | "quantity"; value: string } | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<CreateInventoryListingRequest>({
    masterProductId: "",
    sellerPrice: 0,
    currency: "USD",
    quantity: 0,
    lowStockThreshold: 5,
    reorderPoint: 2,
    condition: "NEW",
    sellerNotes: "",
    sellerSku: "",
  })

  const loadInventory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSellerInventoryListings({ page, limit })
      setInventory(data.inventory)
      setTotalPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  const loadLowStock = useCallback(async () => {
    try {
      setLoadingLowStock(true)
      const data = await getLowStockAlerts(5)
      setLowStockAlerts(data)
    } catch (err: any) {
      setLowStockAlerts([])
    } finally {
      setLoadingLowStock(false)
    }
  }, [])

  const loadCategoryValue = useCallback(async () => {
    try {
      setIsLoadingCategoryValue(true)
      const data = await getInventoryValueByCategory()
      setCategoryValueData(data)
    } catch (err: any) {
      console.error('Failed to load category value data:', err)
    } finally {
      setIsLoadingCategoryValue(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
    loadCategoryValue()
    loadLowStock()
  }, [loadInventory, loadCategoryValue])

  const filteredInventory = inventory.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.masterProduct.name?.toLowerCase().includes(query) ||
      item.masterProduct.oemPartNumber?.toLowerCase().includes(query) ||
      item.sellerSku?.toLowerCase().includes(query) ||
      item.masterProduct.category.name?.toLowerCase().includes(query) ||
      item.sellerNotes?.toLowerCase().includes(query)
    )
  })

  const getStockStatus = (quantity: number, lowStockThreshold: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500/20 text-red-400 border-red-500/30" }
    if (quantity <= lowStockThreshold) return { label: "Low Stock", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    return { label: "In Stock", color: "bg-green-500/20 text-green-400 border-green-500/30" }
  }

  const handleViewDetails = (item: InventoryListing) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const onSaveInline = async () => {
    if (!editing) return
    const { id, field, value } = editing
    const num = field === "quantity" ? parseInt(value, 10) : parseFloat(value)
    if (!Number.isFinite(num)) {
      toast({ title: "Enter a valid number", variant: "destructive" })
      return
    }

    setRowSaving(id)
    setEditing(null)
    const prev = inventory
    setInventory((cur) =>
      cur.map((r) => (r.id === id ? { ...r, [field]: num } as InventoryListing : r))
    )

    try {
      const updated = await quickUpdateListing(id, field === "quantity" ? { quantity: num } : { sellerPrice: num })
      setInventory((cur) => cur.map((r) => (r.id === id ? updated : r)))
      void loadLowStock()
    } catch (e: any) {
      setInventory(prev)
      toast({ title: "Update failed", description: e.message, variant: "destructive" })
    } finally {
      setRowSaving(null)
    }
  }

  const startEdit = (item: InventoryListing, field: "sellerPrice" | "quantity") => {
    setEditing({ id: item.id, field, value: String(item[field]) })
  }

  const onCsvDownloadExport = async () => {
    setCsvBusy(true)
    try {
      const blob = await downloadInventoryCsv()
      downloadBlob(blob, "inventory-export.csv")
      toast({ title: "Export downloaded" })
    } catch (e: any) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" })
    } finally {
      setCsvBusy(false)
    }
  }

  const onCsvDownloadTemplate = async () => {
    setCsvBusy(true)
    try {
      const blob = await downloadBulkTemplate()
      downloadBlob(blob, "inventory-bulk-template.csv")
      toast({ title: "Template downloaded" })
    } catch (e: any) {
      toast({ title: "Template download failed", description: e.message, variant: "destructive" })
    } finally {
      setCsvBusy(false)
    }
  }

  const onCsvUpload = async () => {
    if (!csvFile) {
      toast({ title: "Choose a CSV file first", variant: "destructive" })
      return
    }
    setCsvBusy(true)
    setCsvStatus(null)
    try {
      const uploadId = await uploadBulkCsv(csvFile)
      setCsvUploadId(uploadId)
      toast({ title: "Upload accepted", description: "Processing started" })
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" })
    } finally {
      setCsvBusy(false)
    }
  }

  useEffect(() => {
    if (!csvUploadId) return
    let cancelled = false
    const tick = async () => {
      try {
        const status = await getBulkUploadStatus(csvUploadId)
        if (cancelled) return
        setCsvStatus(status)
      } catch {
        // ignore polling errors; user can retry by reopening
      }
    }
    void tick()
    const t = window.setInterval(() => void tick(), 2000)
    return () => {
      cancelled = true
      window.clearInterval(t)
    }
  }, [csvUploadId])

  const loadCatalogProducts = useCallback(async (search?: string) => {
    try {
      setIsLoadingCatalog(true)
      const data = await getMasterCatalog(search)
      setCatalogProducts(data.products)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load catalog products",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCatalog(false)
    }
  }, [toast])

  useEffect(() => {
    if (isAddProductOpen && !productSearchQuery) {
      loadCatalogProducts()
    }
  }, [isAddProductOpen, loadCatalogProducts, productSearchQuery])

  // Debounced search
  useEffect(() => {
    if (!isAddProductOpen) return

    const timer = setTimeout(() => {
      if (productSearchQuery) {
        loadCatalogProducts(productSearchQuery)
      } else {
        loadCatalogProducts()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [productSearchQuery, isAddProductOpen, loadCatalogProducts])

  const handleProductSelect = (product: MasterCatalogProduct) => {
    setSelectedProduct(product)
    setFormData(prev => ({
      ...prev,
      masterProductId: product.id,
      sellerSku: product.oemPartNumber || "",
    }))
    setIsProductSelectOpen(false)
  }

  const handleAddProduct = async () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      })
      return
    }

    if (!formData.sellerPrice || formData.sellerPrice <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    if (!formData.quantity || formData.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await createInventoryListing(formData)
      toast({
        title: "Success",
        description: "Product added to inventory successfully",
      })
      setIsAddProductOpen(false)
      setSelectedProduct(null)
      setFormData({
        masterProductId: "",
        sellerPrice: 0,
        currency: "USD",
        quantity: 0,
        lowStockThreshold: 5,
        reorderPoint: 2,
        condition: "NEW",
        sellerNotes: "",
        sellerSku: "",
      })
      loadInventory()
      loadCategoryValue()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add product",
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-2">
              Inventory
            </h1>
            <p className="text-muted-foreground font-light text-sm">
              Manage your product listings and stock levels
            </p>
          </div>
          <Button 
            className="bg-accent hover:bg-accent/90 whitespace-nowrap"
            onClick={() => setIsAddProductOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Top 5 Low Stock Alerts */}
      <Card className="glass-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-light flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Top 5 Low Stock Alerts
              </CardTitle>
              <CardDescription>Items where quantity is below your threshold</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadLowStock()}
              disabled={loadingLowStock}
            >
              {loadingLowStock ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLowStock ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : lowStockAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No low stock alerts right now.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockAlerts.map((a) => (
                <div key={a.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <div className="font-medium text-foreground truncate">{a.product.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    OEM: {a.product.oemPartNumber} · {a.product.masterPartId}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <div className="text-muted-foreground">Qty</div>
                    <div className="font-medium text-destructive tabular-nums">
                      {a.quantity} / {a.lowStockThreshold}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Value by Category Widget */}
      {categoryValueData && categoryValueData.categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-lg p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-light text-foreground mb-1">
              Inventory Value by Category
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              Capital allocation and risk assessment
            </p>
          </div>
          {isLoadingCategoryValue ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Donut Chart */}
              <div className="relative flex items-center justify-center">
                <ChartContainer
                  config={{
                    value: {
                      label: "Value",
                    },
                  }}
                  className="h-48 sm:h-64 w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryValueData.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {categoryValueData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CategoryValue
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: payload[0].color }}
                                    />
                                    <span className="text-sm font-medium">{data.name}</span>
                                  </div>
                                  <div className="text-xs">
                                    <div>Value: {formatCurrency(data.value)}</div>
                                    <div>Percentage: {data.percentage.toFixed(1)}%</div>
                                    <div>Items: {data.count}</div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
                  <div className="text-lg sm:text-3xl font-bold text-foreground text-center">
                    {formatCurrency(categoryValueData.totalValue)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-light">
                    Total Value
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3 sm:space-y-4">
                {categoryValueData.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div
                        className="h-3 w-3 sm:h-4 sm:w-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate text-sm sm:text-base">
                          {category.name}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {category.count} item{category.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-foreground text-sm sm:text-base">
                        {formatCurrency(category.value)}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Inventory Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-light flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Listings
              </CardTitle>
              <CardDescription>
                {total > 0 ? `${total} total inventory item${total !== 1 ? 's' : ''}` : "No inventory items"}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-9 bg-muted/50 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" className="gap-2" onClick={() => setCsvOpen(true)}>
                <FileSpreadsheet className="h-4 w-4" />
                CSV tools
              </Button>
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
              <Button onClick={loadInventory} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No inventory items found matching your search" : "No inventory items found"}
              </p>
              {!searchQuery && (
                <Button className="bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[300px]">Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Low stock threshold</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item, index) => {
                      const imageUrl = item.sellerImages?.[0] || item.masterProduct.imageUrls?.[0]
                      const normalizedImageUrl = imageUrl ? normalizeImageUrl(imageUrl) : "/placeholder.svg"

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={normalizedImageUrl}
                                  alt={item.masterProduct.name}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-foreground truncate">
                                  {item.masterProduct.name}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  OEM: {item.masterProduct.oemPartNumber}
                                </div>
                                {item.masterProduct.masterPartId && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    Master: {item.masterProduct.masterPartId}
                                  </div>
                                )}
                                {item.sellerSku && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    SKU: {item.sellerSku}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.masterProduct.category.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {editing?.id === item.id && editing.field === "sellerPrice" ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  className="h-8 w-28 bg-muted/40"
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") void onSaveInline()
                                    if (e.key === "Escape") setEditing(null)
                                  }}
                                  onBlur={() => void onSaveInline()}
                                  autoFocus
                                />
                                {rowSaving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="text-left"
                                onClick={() => startEdit(item, "sellerPrice")}
                                disabled={rowSaving === item.id}
                              >
                                <div className="font-medium text-foreground">
                                  {formatCurrency(item.sellerPrice, item.currency)}
                                </div>
                                <div className="text-xs text-muted-foreground">Click to edit</div>
                              </button>
                            )}
                          </TableCell>
                          <TableCell>
                            {editing?.id === item.id && editing.field === "quantity" ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  className="h-8 w-24 bg-muted/40"
                                  value={editing.value}
                                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") void onSaveInline()
                                    if (e.key === "Escape") setEditing(null)
                                  }}
                                  onBlur={() => void onSaveInline()}
                                  autoFocus
                                />
                                {rowSaving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="text-left"
                                onClick={() => startEdit(item, "quantity")}
                                disabled={rowSaving === item.id}
                              >
                                <div
                                  className={cn(
                                    "font-medium tabular-nums",
                                    item.quantity === 0
                                      ? "text-destructive"
                                      : item.quantity <= item.lowStockThreshold
                                        ? "text-amber-300"
                                        : "text-foreground"
                                  )}
                                >
                                  {item.quantity}
                                </div>
                                <div className="text-xs text-muted-foreground">Click to edit</div>
                              </button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground tabular-nums">{item.lowStockThreshold}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border">
                              {item.condition}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={item.isActive
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                                className="h-8"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-border gap-3">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({total} items)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
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

      {/* Inventory Item Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="!max-w-4xl !w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Inventory Item Details</DialogTitle>
            <DialogDescription>
              {selectedItem?.masterProduct.name}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 mt-4">
              {/* Product Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Product Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Product Name</p>
                      <p className="text-foreground font-medium">{selectedItem.masterProduct.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">OEM Part Number</p>
                      <p className="text-foreground font-medium">{selectedItem.masterProduct.oemPartNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                      <p className="text-foreground font-medium">{selectedItem.masterProduct.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="text-foreground font-medium">{selectedItem.masterProduct.category.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Seller SKU</p>
                      <p className="text-foreground font-medium">{selectedItem.sellerSku}</p>
                    </div>
                    {selectedItem.sellerNotes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Seller Notes</p>
                        <p className="text-foreground font-medium">{selectedItem.sellerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Pricing & Stock</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-foreground font-medium text-xl">
                        {formatCurrency(selectedItem.sellerPrice, selectedItem.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                      <p className="text-foreground font-medium text-xl">{selectedItem.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Low Stock Threshold</p>
                      <p className="text-foreground font-medium">{selectedItem.lowStockThreshold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reorder Point</p>
                      <p className="text-foreground font-medium">{selectedItem.reorderPoint}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Condition</p>
                      <Badge variant="outline" className="border-border">
                        {selectedItem.condition}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge
                        variant="outline"
                        className={selectedItem.isActive
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        {selectedItem.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ratings & Reviews */}
              {selectedItem.reviewCount > 0 && (
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Ratings & Reviews</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-light text-foreground">
                        {selectedItem.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {selectedItem.reviewCount} review{selectedItem.reviewCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {(selectedItem.sellerImages.length > 0 || selectedItem.masterProduct.imageUrls.length > 0) && (
                <div>
                  <h3 className="text-lg font-light text-foreground mb-4">Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedItem.sellerImages.map((img, index) => {
                      const normalizedImg = normalizeImageUrl(img)
                      return (
                        <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={normalizedImg}
                            alt={`${selectedItem.masterProduct.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )
                    })}
                    {selectedItem.sellerImages.length === 0 && selectedItem.masterProduct.imageUrls.map((img, index) => {
                      const normalizedImg = normalizeImageUrl(img)
                      return (
                        <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={normalizedImg}
                            alt={`${selectedItem.masterProduct.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-foreground">
                    {format(new Date(selectedItem.createdAt), "PPpp")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-foreground">
                    {format(new Date(selectedItem.updatedAt), "PPpp")}
                  </p>
                </div>
                {selectedItem.lastPriceUpdate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Price Update</p>
                    <p className="text-foreground">
                      {format(new Date(selectedItem.lastPriceUpdate), "PPpp")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price Update Count</p>
                  <p className="text-foreground">{selectedItem.priceUpdateCount}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSV Tools Wizard */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[96vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>CSV tools</DialogTitle>
            <DialogDescription>
              Export your inventory or bulk update with a CSV upload.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="text-sm font-medium text-foreground">Step 1 — Get a CSV</div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => void onCsvDownloadTemplate()}
                  disabled={csvBusy}
                >
                  <FileDown className="h-4 w-4" />
                  Download template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => void onCsvDownloadExport()}
                  disabled={csvBusy}
                >
                  <FileDown className="h-4 w-4" />
                  Export current inventory
                </Button>
                {csvBusy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Columns: masterProductId,sellerPrice,currency,quantity,condition,lowStockThreshold,reorderPoint,sellerSku,sellerNotes
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
              <div className="text-sm font-medium text-foreground">Step 2 — Upload CSV</div>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="gap-2"
                  onClick={() => void onCsvUpload()}
                  disabled={csvBusy || !csvFile}
                >
                  <FileUp className="h-4 w-4" />
                  Upload and start processing
                </Button>
                {csvBusy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
              </div>
              {csvUploadId && (
                <p className="text-xs text-muted-foreground">
                  Upload ID: <span className="font-mono">{csvUploadId}</span>
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="text-sm font-medium text-foreground">Step 3 — Processing status</div>
              {csvUploadId ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Polling status… (updates every 2s)</p>
                  <pre className="max-h-56 overflow-y-auto rounded-md bg-background/40 border border-border p-3 text-xs">
{JSON.stringify(csvStatus ?? { status: "waiting" }, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Upload a CSV to start.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="!max-w-3xl !w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Add New Product</DialogTitle>
            <DialogDescription>
              Select a product from the catalog and add it to your inventory
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product-select">Select Product *</Label>
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
                        {selectedProduct.imageUrls?.[0] && (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={normalizeImageUrl(selectedProduct.imageUrls[0])}
                              alt={selectedProduct.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{selectedProduct.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            OEM: {selectedProduct.oemPartNumber} • {selectedProduct.category.name}
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
                      placeholder="Search products by name, OEM, or category..."
                      value={productSearchQuery}
                      onValueChange={setProductSearchQuery}
                    />
                    <CommandList>
                      {isLoadingCatalog ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : catalogProducts.length === 0 ? (
                        <CommandEmpty>No products found.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {catalogProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.name} ${product.oemPartNumber} ${product.category.name}`}
                              onSelect={() => handleProductSelect(product)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3 w-full">
                                {product.imageUrls?.[0] && (
                                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    <Image
                                      src={normalizeImageUrl(product.imageUrls[0])}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{product.name}</div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    OEM: {product.oemPartNumber} • {product.category.name}
                                  </div>
                                  {product.manufacturer && (
                                    <div className="text-xs text-muted-foreground">
                                      {product.manufacturer}
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
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Form Fields */}
            {selectedProduct && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerPrice">Price *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sellerPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.sellerPrice || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, sellerPrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ZWL">ZWL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reorderPoint">Reorder Point</Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      min="0"
                      value={formData.reorderPoint || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="USED">Used</SelectItem>
                        <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellerSku">Seller SKU</Label>
                    <Input
                      id="sellerSku"
                      value={formData.sellerSku || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellerSku: e.target.value }))}
                      placeholder="Auto-generated from OEM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerNotes">Seller Notes</Label>
                  <Textarea
                    id="sellerNotes"
                    value={formData.sellerNotes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellerNotes: e.target.value }))}
                    placeholder="Additional notes about this product..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddProductOpen(false)
                      setSelectedProduct(null)
                      setFormData({
                        masterProductId: "",
                        sellerPrice: 0,
                        currency: "USD",
                        quantity: 0,
                        lowStockThreshold: 5,
                        reorderPoint: 2,
                        condition: "NEW",
                        sellerNotes: "",
                        sellerSku: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
