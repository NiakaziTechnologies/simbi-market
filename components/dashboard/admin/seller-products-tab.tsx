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
import { Search, ChevronLeft, ChevronRight, Package, Building2, DollarSign, ShoppingBag, Image as ImageIcon } from "lucide-react"
import { getSellerProducts, type SellerProduct } from "@/lib/api/admin-products"
import { formatDistanceToNow, format } from "date-fns"
import Image from "next/image"

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  INACTIVE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

function normalizeImageUrl(url: string): string {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("//")) return `https:${url}`
  if (url.startsWith("http")) return url
  return url
}

export function SellerProductsTab() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(100)
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSellerProducts(page, limit)
      setProducts(data.products)
      setTotalPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load seller products')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.masterProduct.name?.toLowerCase().includes(query) ||
      product.masterProduct.oemPartNumber?.toLowerCase().includes(query) ||
      product.seller.businessName?.toLowerCase().includes(query) ||
      product.sellerSku?.toLowerCase().includes(query) ||
      product.masterProduct.category.name?.toLowerCase().includes(query)
    )
  })

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <>
    <Card className="glass-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-light flex items-center gap-2">
              <Package className="h-5 w-5" />
              Seller Products
            </CardTitle>
            <CardDescription>
              {total > 0 ? `${total} total seller products` : "Products listed by sellers"}
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
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
            <Button onClick={loadProducts} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? "No products found matching your search" : "No seller products found"}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[300px]">Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const imageUrl = product.sellerImages?.[0] || product.masterProduct.imageUrls?.[0]
                    const normalizedImageUrl = imageUrl ? normalizeImageUrl(imageUrl) : "/placeholder.svg"

                    return (
                      <TableRow
                        key={product.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={normalizedImageUrl}
                                alt={product.masterProduct.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground truncate">
                                {product.masterProduct.name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                OEM: {product.masterProduct.oemPartNumber}
                              </div>
                              {product.sellerSku && (
                                <div className="text-xs text-muted-foreground truncate">
                                  SKU: {product.sellerSku}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm text-foreground">
                              {product.seller.businessName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.seller.tradingName}
                            </div>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 w-fit text-xs">
                              <Building2 className="h-3 w-3 mr-1" />
                              Seller
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {formatCurrency(product.sellerPrice, product.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-foreground">
                              {product.quantity}
                            </div>
                            {product.quantity <= product.lowStockThreshold && (
                              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 w-fit text-xs">
                                Low Stock
                              </Badge>
                            )}
                            {product.quantity === 0 && (
                              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 w-fit text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {product.masterProduct.category.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {product._count?.orderItems !== undefined ? (
                              <span className="font-medium text-foreground">{product._count.orderItems}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={product.isActive 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing page {page} of {totalPages} ({total} total products)
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

        {/* Product Detail Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProduct.masterProduct.name}</DialogTitle>
                  <DialogDescription>
                    Complete product information and seller details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Product Images */}
                  {(selectedProduct.sellerImages?.length > 0 || selectedProduct.masterProduct.imageUrls?.length > 0) && (
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Product Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(selectedProduct.sellerImages || selectedProduct.masterProduct.imageUrls || []).slice(0, 8).map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={normalizeImageUrl(img)}
                                alt={`${selectedProduct.masterProduct.name} ${idx + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Information */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Product Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Product Name</div>
                          <div className="font-medium">{selectedProduct.masterProduct.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Description</div>
                          <div className="text-sm">{selectedProduct.masterProduct.description || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">OEM Part Number</div>
                          <div className="font-medium">{selectedProduct.masterProduct.oemPartNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Master Part ID</div>
                          <div className="font-medium">{selectedProduct.masterProduct.masterPartId}</div>
                        </div>
                        {selectedProduct.sellerSku && (
                          <div>
                            <div className="text-sm text-muted-foreground">Seller SKU</div>
                            <div className="font-medium">{selectedProduct.sellerSku}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Manufacturer</div>
                          <div className="font-medium">{selectedProduct.masterProduct.manufacturer}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Category</div>
                          <div className="font-medium">{selectedProduct.masterProduct.category.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Condition</div>
                          <Badge variant="outline">{selectedProduct.condition}</Badge>
                        </div>
                        {selectedProduct.masterProduct.vehicleCompatibility && (
                          <div>
                            <div className="text-sm text-muted-foreground">Vehicle Compatibility</div>
                            <div className="font-medium">
                              {selectedProduct.masterProduct.vehicleCompatibility.make} {selectedProduct.masterProduct.vehicleCompatibility.model} ({selectedProduct.masterProduct.vehicleCompatibility.year})
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Pricing & Inventory */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Seller Price</div>
                          <div className="text-2xl font-light text-foreground">
                            {formatCurrency(selectedProduct.sellerPrice, selectedProduct.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Currency</div>
                          <div className="font-medium">{selectedProduct.currency}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Stock Quantity</div>
                          <div className="text-2xl font-light text-foreground">{selectedProduct.quantity}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Low Stock Threshold</div>
                          <div className="font-medium">{selectedProduct.lowStockThreshold}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Reorder Point</div>
                          <div className="font-medium">{selectedProduct.reorderPoint}</div>
                        </div>
                        {selectedProduct.lastPriceUpdate && (
                          <div>
                            <div className="text-sm text-muted-foreground">Last Price Update</div>
                            <div className="font-medium">
                              {format(new Date(selectedProduct.lastPriceUpdate), "PPpp")}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Price Update Count</div>
                          <div className="font-medium">{selectedProduct.priceUpdateCount}</div>
                        </div>
                        {selectedProduct.averageRating > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground">Average Rating</div>
                            <div className="font-medium">{selectedProduct.averageRating.toFixed(1)} / 5.0</div>
                            <div className="text-xs text-muted-foreground">{selectedProduct.reviewCount} reviews</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Seller Information */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Seller Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Business Name</div>
                          <div className="font-medium">{selectedProduct.seller.businessName}</div>
                        </div>
                        {selectedProduct.seller.tradingName && (
                          <div>
                            <div className="text-sm text-muted-foreground">Trading Name</div>
                            <div className="font-medium">{selectedProduct.seller.tradingName}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="font-medium">{selectedProduct.seller.email}</div>
                        </div>
                        {selectedProduct.seller.contactNumber && (
                          <div>
                            <div className="text-sm text-muted-foreground">Contact Number</div>
                            <div className="font-medium">{selectedProduct.seller.contactNumber}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <Badge variant="outline" className={statusColors[selectedProduct.seller.status] || "bg-muted text-muted-foreground"}>
                            {selectedProduct.seller.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">SRI Score</div>
                          <div className="font-medium">{selectedProduct.seller.sriScore}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Eligible</div>
                          <Badge variant="outline" className={selectedProduct.seller.isEligible ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                            {selectedProduct.seller.isEligible ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Status & Statistics */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Status & Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Product Status</div>
                          <Badge 
                            variant="outline" 
                            className={selectedProduct.isActive 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }
                          >
                            {selectedProduct.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {selectedProduct._count?.orderItems !== undefined && (
                          <div>
                            <div className="text-sm text-muted-foreground">Total Orders</div>
                            <div className="text-2xl font-light text-foreground">{selectedProduct._count.orderItems}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground">Created</div>
                          <div className="font-medium">
                            {format(new Date(selectedProduct.createdAt), "PPpp")}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTime(selectedProduct.createdAt)}
                          </div>
                        </div>
                      </div>
                      {selectedProduct.sellerNotes && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground">Seller Notes</div>
                          <div className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedProduct.sellerNotes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
    </>
  )
}
