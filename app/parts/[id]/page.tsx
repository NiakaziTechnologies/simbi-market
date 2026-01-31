"use client"

import { use, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuth } from "@/lib/auth/auth-context"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Part } from "@/lib/features/parts-slice"
import { getProductRating, getProductReviews, type ProductRating, type ProductReview } from "@/lib/api/product-reviews"
import { getOrders, type OrderResponse } from "@/lib/api/orders"
import { createReview } from "@/lib/api/buyer-reviews"
import { format } from "date-fns"
import {
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Truck,
  Shield,
  Clock,
  Star,
  Play,
  ChevronRight,
  ArrowLeft,
  Package,
  FileText,
  X,
  Download,
  Minus,
  Plus,
  HelpCircle,
  Loader2,
  ChevronLeft,
  Edit,
} from "lucide-react"

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addToCart } = useCart()
  const [part, setPart] = useState<Part | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "reviews" | "faq">("specs")
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; url: string } | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [ratingData, setRatingData] = useState<ProductRating | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsSortBy, setReviewsSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [isLoadingRating, setIsLoadingRating] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  
  // Review form state
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [purchasedOrderItem, setPurchasedOrderItem] = useState<{ orderId: string; orderItemId: string } | null>(null)
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  })

  // Load products from sessionStorage (set by catalog page) or fetch from API
  useEffect(() => {
    const loadProduct = async () => {
      if (typeof window !== 'undefined') {
        try {
          const storedProducts = sessionStorage.getItem('catalogProducts')
          if (storedProducts) {
            const parsedProducts: Part[] = JSON.parse(storedProducts)
            setParts(parsedProducts)
            const foundPart = parsedProducts.find((p) => p.id === id)
            if (foundPart) {
              setPart(foundPart)
              setIsLoading(false)
              return
            }
          }

          // If not found in sessionStorage, try to fetch from API
          try {
            const { fetchProductById } = await import('@/lib/api/products')
            const product = await fetchProductById(id)
            if (product) {
              setPart(product)
              setParts([product]) // Set parts array with just this product for related parts logic
            } else {
              setPart(null)
            }
          } catch (apiErr) {
            console.error('Failed to fetch product from API:', apiErr)
            setPart(null)
          }
        } catch (err) {
          console.error('Failed to load products:', err)
          setPart(null)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadProduct()
  }, [id])

  // Fetch rating and reviews when part is loaded and has inventoryId
  useEffect(() => {
    if (part?.inventoryId) {
      const loadRating = async () => {
        try {
          setIsLoadingRating(true)
          const rating = await getProductRating(part.inventoryId!)
          setRatingData(rating)
        } catch (err) {
          console.error('Failed to load rating:', err)
        } finally {
          setIsLoadingRating(false)
        }
      }
      loadRating()
    }
  }, [part?.inventoryId])

  useEffect(() => {
    if (part?.inventoryId) {
      const loadReviews = async () => {
        try {
          setIsLoadingReviews(true)
          const data = await getProductReviews(part.inventoryId!, reviewsPage, 10, reviewsSortBy)
          setReviews(data.reviews)
          setReviewsTotalPages(data.pagination.totalPages)
          setReviewsTotal(data.pagination.total)
        } catch (err) {
          console.error('Failed to load reviews:', err)
        } finally {
          setIsLoadingReviews(false)
        }
      }
      loadReviews()
    }
  }, [part?.inventoryId, reviewsPage, reviewsSortBy])

  // Check if buyer has purchased this product
  useEffect(() => {
    const checkPurchase = async () => {
      if (!isAuthenticated || !part?.inventoryId) {
        setPurchasedOrderItem(null)
        return
      }

      setIsCheckingPurchase(true)
      try {
        // Fetch all orders to check if buyer has purchased this product
        const response = await getOrders(1, 100) // Get first 100 orders
        const orders = response.data

        // Find order item that matches this inventoryId
        for (const order of orders) {
          const matchingItem = order.items.find(item => item.inventoryId === part.inventoryId)
          if (matchingItem) {
            setPurchasedOrderItem({
              orderId: order.id,
              orderItemId: matchingItem.id,
            })
            return
          }
        }
        setPurchasedOrderItem(null)
      } catch (err) {
        console.error('Failed to check purchase:', err)
        setPurchasedOrderItem(null)
      } finally {
        setIsCheckingPurchase(false)
      }
    }

    checkPurchase()
  }, [isAuthenticated, part?.inventoryId])

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!part) return
    
    // Prevent adding out-of-stock items
    if (!part.inStock) {
      toast({
        title: "Out of Stock",
        description: "This item is out of stock and cannot be added to cart.",
        variant: "destructive",
      })
      return
    }
    
    setIsAddingToCart(true)
    try {
      await addToCart({
        id: part.id,
        name: part.name,
        price: part.price,
        image: part.image || "/placeholder.svg",
        quantity,
        inventoryId: part.inventoryId,
      })
      setAddedToCart(true)
      toast({
        title: "Added to cart",
        description: `${part.name} has been added to your cart.`,
      })
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Not found state
  if (!part) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-16 px-6 text-center">
          <h1 className="text-4xl font-light text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/catalog">
            <Button className="bg-accent hover:bg-accent/90">Browse Catalog</Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  // Product images
  const images = part.images && part.images.length > 0 
    ? part.images 
    : [part.image || "/placeholder.svg"]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/catalog" className="hover:text-foreground transition-colors">Catalog</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{part.name}</span>
          </div>
        </div>

        {/* Product Content */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <Image
                  src={images[selectedImage]}
                  alt={part.name}
                  fill
                  className="object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        selectedImage === idx ? "border-accent" : "border-transparent"
                      }`}
                    >
                      <Image src={img} alt={`${part.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="text-sm text-accent font-medium uppercase tracking-wider">
                  {part.category}
                </span>
                <h1 className="text-3xl font-light text-foreground mt-2">{part.name}</h1>
                
                {/* Rating */}
                {ratingData && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(ratingData.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {ratingData.averageRating.toFixed(1)} ({ratingData.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {part.description || "No description available."}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-light text-foreground">
                  ${part.price?.toLocaleString() || "0"}
                </span>
                {part.inStock ? (
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="h-4 w-4" /> In Stock
                  </span>
                ) : (
                  <span className="text-sm text-destructive">Out of Stock</span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!part.inStock || isAddingToCart}
                  className="flex-1 h-12"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                    </>
                  )}
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto text-accent mb-2" />
                  <span className="text-sm text-muted-foreground">Free Shipping</span>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto text-accent mb-2" />
                  <span className="text-sm text-muted-foreground">Warranty</span>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto text-accent mb-2" />
                  <span className="text-sm text-muted-foreground">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-light text-foreground mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-muted text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-foreground">{review.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      By {review.buyer?.firstName || "Anonymous"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
