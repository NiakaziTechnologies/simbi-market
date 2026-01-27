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
import { Search, ChevronLeft, ChevronRight, Package, Image as ImageIcon, Ruler, Weight, FileText, CheckCircle } from "lucide-react"
import { getMasterProducts, type MasterProduct } from "@/lib/api/admin-products"
import { formatDistanceToNow, format } from "date-fns"
import Image from "next/image"

function normalizeImageUrl(url: string): string {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("//")) return `https:${url}`
  if (url.startsWith("http")) return url
  return url
}

export function MasterProductsTab() {
  const [products, setProducts] = useState<MasterProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [selectedProduct, setSelectedProduct] = useState<MasterProduct | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getMasterProducts(page, limit)
      setProducts(data.products)
      setTotalPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load master products')
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
      product.name?.toLowerCase().includes(query) ||
      product.oemPartNumber?.toLowerCase().includes(query) ||
      product.masterPartId?.toLowerCase().includes(query) ||
      product.category.name?.toLowerCase().includes(query) ||
      product.manufacturer?.toLowerCase().includes(query)
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
              Master Products
            </CardTitle>
            <CardDescription>
              {total > 0 ? `${total} total master products` : "Base product catalog"}
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
              {searchQuery ? "No products found matching your search" : "No master products found"}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[300px]">Product</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const imageUrl = product.imageUrls?.[0]
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
                                alt={product.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground truncate">
                                {product.name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate line-clamp-2">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-foreground">
                              {product.oemPartNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Master: {product.masterPartId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {product.manufacturer}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {product.category.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {product.vehicleCompatibility?.make && (
                              <div>
                                {product.vehicleCompatibility.make} {product.vehicleCompatibility.year}
                              </div>
                            )}
                            {product.vehicleCompatibility?.model && (
                              <div className="text-xs">
                                {product.vehicleCompatibility.model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant="outline" 
                              className={product.isActive 
                                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {product.isCustom && (
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(product.createdAt)}
                          </div>
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
                  <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                  <DialogDescription>
                    Complete master product information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Product Images */}
                  {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 && (
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Product Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedProduct.imageUrls.slice(0, 8).map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={normalizeImageUrl(img)}
                                alt={`${selectedProduct.name} ${idx + 1}`}
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
                    {/* Basic Information */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Product Name</div>
                          <div className="font-medium">{selectedProduct.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Description</div>
                          <div className="text-sm">{selectedProduct.description || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">OEM Part Number</div>
                          <div className="font-medium">{selectedProduct.oemPartNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Master Part ID</div>
                          <div className="font-medium">{selectedProduct.masterPartId}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Manufacturer</div>
                          <div className="font-medium">{selectedProduct.manufacturer}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Category</div>
                          <div className="font-medium">{selectedProduct.category.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Unit</div>
                          <div className="font-medium">{selectedProduct.unit}</div>
                        </div>
                        {selectedProduct.vehicleCompatibility && (
                          <div>
                            <div className="text-sm text-muted-foreground">Vehicle Compatibility</div>
                            <div className="font-medium">
                              {selectedProduct.vehicleCompatibility.make} {selectedProduct.vehicleCompatibility.model} ({selectedProduct.vehicleCompatibility.year})
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Physical Specifications */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Physical Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedProduct.length !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              Length
                            </div>
                            <div className="font-medium">{selectedProduct.length} {selectedProduct.unit}</div>
                          </div>
                        )}
                        {selectedProduct.width !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              Width
                            </div>
                            <div className="font-medium">{selectedProduct.width} {selectedProduct.unit}</div>
                          </div>
                        )}
                        {selectedProduct.height !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              Height
                            </div>
                            <div className="font-medium">{selectedProduct.height} {selectedProduct.unit}</div>
                          </div>
                        )}
                        {selectedProduct.weight !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Weight className="h-4 w-4" />
                              Weight
                            </div>
                            <div className="font-medium">{selectedProduct.weight} {selectedProduct.unit}</div>
                          </div>
                        )}
                        {!selectedProduct.length && !selectedProduct.width && !selectedProduct.height && !selectedProduct.weight && (
                          <div className="text-sm text-muted-foreground">No specifications available</div>
                        )}
                        {selectedProduct.specSheetUrl && (
                          <div className="pt-2">
                            <a 
                              href={selectedProduct.specSheetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              View Spec Sheet
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status & Approval */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Status & Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
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
                        <div>
                          <div className="text-sm text-muted-foreground">Type</div>
                          <Badge variant="outline" className={selectedProduct.isCustom ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-muted text-muted-foreground"}>
                            {selectedProduct.isCustom ? "Custom" : "Standard"}
                          </Badge>
                        </div>
                        {selectedProduct.approvedAt && (
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Approved
                            </div>
                            <div className="font-medium">
                              {format(new Date(selectedProduct.approvedAt), "PPpp")}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Timestamps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="font-medium">
                          {format(new Date(selectedProduct.createdAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedProduct.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">
                          {format(new Date(selectedProduct.updatedAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedProduct.updatedAt)}
                        </div>
                      </div>
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
