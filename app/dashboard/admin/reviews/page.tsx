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
import { Search, ChevronLeft, ChevronRight, Star, User, Package, ShoppingBag, Calendar, MessageSquare } from "lucide-react"
import { getAdminReviews, type AdminReview } from "@/lib/api/admin-reviews"
import { formatDistanceToNow, format } from "date-fns"

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  FLAGGED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(20)
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null)

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAdminReviews(page, limit)
      setReviews(data.reviews)
      setTotalPages(data.pagination.totalPages || 1)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      review.buyer.firstName?.toLowerCase().includes(query) ||
      review.buyer.lastName?.toLowerCase().includes(query) ||
      review.buyer.email?.toLowerCase().includes(query) ||
      review.inventory.masterProduct.name?.toLowerCase().includes(query) ||
      review.title?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query)
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Reviews</h1>
            <p className="text-muted-foreground font-light">
              Manage product reviews and ratings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Reviews Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-light flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Product Reviews
                </CardTitle>
                <CardDescription>
                  {total > 0 ? `${total} total reviews` : "View and manage all product reviews"}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
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
                <Button onClick={loadReviews} className="mt-4" variant="outline">
                  Retry
                </Button>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No reviews found matching your search" : "No reviews found"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Product</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review, index) => (
                        <TableRow
                          key={review.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-foreground">
                                {review.inventory.masterProduct.name}
                              </div>
                              <div className="text-muted-foreground">
                                Seller: {review.inventory.seller.businessName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {review.inventory.sellerSku}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-foreground">
                                {review.buyer.firstName} {review.buyer.lastName}
                              </div>
                              <div className="text-muted-foreground">{review.buyer.email}</div>
                              {review.buyer.companyName && (
                                <div className="text-xs text-muted-foreground">{review.buyer.companyName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderStars(review.rating)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs">
                              <div className="font-medium text-foreground">{review.title}</div>
                              <div className="text-muted-foreground line-clamp-2">{review.comment}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[review.status] || "bg-muted text-muted-foreground"}>
                              {review.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(review.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
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
                      Showing page {page} of {totalPages} ({total} total reviews)
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
      </motion.div>

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="!max-w-[85vw] !w-[85vw] max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Review Details</DialogTitle>
                <DialogDescription>
                  Complete information for review #{selectedReview.id.slice(0, 8)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Review Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Review Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="mt-1">{renderStars(selectedReview.rating)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Title</div>
                        <div className="font-medium">{selectedReview.title}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Comment</div>
                        <div className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedReview.comment}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant="outline" className={statusColors[selectedReview.status] || "bg-muted text-muted-foreground"}>
                          {selectedReview.status}
                        </Badge>
                      </div>
                      {selectedReview.flaggedReason && (
                        <div>
                          <div className="text-sm text-muted-foreground">Flagged Reason</div>
                          <div className="text-sm text-red-400 mt-1 p-3 bg-red-500/10 rounded-lg">{selectedReview.flaggedReason}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Product Name</div>
                        <div className="font-medium">{selectedReview.inventory.masterProduct.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Seller</div>
                        <div className="font-medium">{selectedReview.inventory.seller.businessName}</div>
                        <div className="text-xs text-muted-foreground">{selectedReview.inventory.seller.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">SKU</div>
                        <div className="font-medium">{selectedReview.inventory.sellerSku}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-medium">
                          {selectedReview.inventory.currency} {selectedReview.inventory.sellerPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Condition</div>
                        <Badge variant="outline">{selectedReview.inventory.condition}</Badge>
                      </div>
                      {selectedReview.inventory.sellerNotes && (
                        <div>
                          <div className="text-sm text-muted-foreground">Seller Notes</div>
                          <div className="text-sm">{selectedReview.inventory.sellerNotes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Buyer Information */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Buyer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{selectedReview.buyer.firstName} {selectedReview.buyer.lastName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{selectedReview.buyer.email}</div>
                      </div>
                      {selectedReview.buyer.companyName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Company</div>
                          <div className="font-medium">{selectedReview.buyer.companyName}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Information */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Order ID</div>
                        <div className="font-medium">{selectedReview.orderId}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Order Item ID</div>
                        <div className="font-medium">{selectedReview.orderItemId}</div>
                      </div>
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
                        {format(new Date(selectedReview.createdAt), "PPpp")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(selectedReview.createdAt)}
                      </div>
                    </div>
                    {selectedReview.moderatedAt && (
                      <div>
                        <div className="text-sm text-muted-foreground">Moderated</div>
                        <div className="font-medium">
                          {format(new Date(selectedReview.moderatedAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedReview.moderatedAt)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="font-medium">
                        {format(new Date(selectedReview.updatedAt), "PPpp")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(selectedReview.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seller Response */}
                {selectedReview.response && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Seller Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        {selectedReview.response.comment || selectedReview.response}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Moderations */}
                {selectedReview.moderations && selectedReview.moderations.length > 0 && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Moderation History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedReview.moderations.map((moderation: any, idx: number) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                            <div className="font-medium">{moderation.action || moderation.status}</div>
                            {moderation.reason && (
                              <div className="text-muted-foreground mt-1">{moderation.reason}</div>
                            )}
                            {moderation.moderatedAt && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(moderation.moderatedAt), "PPpp")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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
