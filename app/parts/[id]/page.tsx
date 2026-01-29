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
  // COMMENTED OUT FOR NOW - DEBUGGING SESSION STORAGE ISSUES
  useEffect(() => {
    // const loadProduct = async () => {
    //   if (typeof window !== 'undefined') {
    //     try {
    //       const storedProducts = sessionStorage.getItem('catalogProducts')
    //       if (storedProducts) {
    //         const parsedProducts: Part[] = JSON.parse(storedProducts)
    //         setParts(parsedProducts)
    //         const foundPart = parsedProducts.find((p) => p.id === id)
    //         if (foundPart) {
    //           setPart(foundPart)
    //           setIsLoading(false)
    //           return
    //         }
    //       }

    //       // If not found in sessionStorage, try to fetch from API
    //       try {
    //         const { fetchProductById } = await import('@/lib/api/products')
    //         const product = await fetchProductById(id)
    //         if (product) {
    //           setPart(product)
    //           setParts([product]) // Set parts array with just this product for related parts logic
    //         } else {
    //           setPart(null)
    //         }
    //       } catch (apiErr) {
    //         console.error('Failed to fetch product from API:', apiErr)
    //         setPart(null)
    //       }
    //     } catch (err) {
    //       console.error('Failed to load products:', err)
    //       setPart(null)
    //     } finally {
    //       setIsLoading(false)
    //     }
    //   }
    // }

    // loadProduct()
    
    // For now, just set loading to false
    setIsLoading(false)
  }, [id])

  // Fetch rating and reviews when part is loaded and has inventoryId
  // COMMENTED OUT FOR NOW
  // useEffect(() => {
  //   if (part?.inventoryId) {
  //     const loadRating = async () => {
  //       try {
  //         setIsLoadingRating(true)
  //         const rating = await getProductRating(part.inventoryId!)
  //         setRatingData(rating)
  //       } catch (err) {
  //         console.error('Failed to load rating:', err)
  //       } finally {
  //         setIsLoadingRating(false)
  //       }
  //     }
  //     loadRating()
  //   }
  // }, [part?.inventoryId])

  // COMMENTED OUT FOR NOW
  // useEffect(() => {
  //   if (part?.inventoryId) {
  //     const loadReviews = async () => {
  //       try {
  //         setIsLoadingReviews(true)
  //         const data = await getProductReviews(part.inventoryId!, reviewsPage, 10, reviewsSortBy)
  //         setReviews(data.reviews)
  //         setReviewsTotalPages(data.pagination.totalPages)
  //         setReviewsTotal(data.pagination.total)
  //       } catch (err) {
  //         console.error('Failed to load reviews:', err)
  //       } finally {
  //         setIsLoadingReviews(false)
  //       }
  //     }
  //     loadReviews()
  //   }
  // }, [part?.inventoryId, reviewsPage, reviewsSortBy])

  // Check if buyer has purchased this product
  // COMMENTED OUT FOR NOW
  // useEffect(() => {
  //   const checkPurchase = async () => {
  //     if (!isAuthenticated || !part?.inventoryId) {
  //       setPurchasedOrderItem(null)
  //       return
  //     }

  //     setIsCheckingPurchase(true)
  //     try {
  //       // Fetch all orders to check if buyer has purchased this product
  //       const response = await getOrders(1, 100) // Get first 100 orders
  //       const orders = response.data

  //       // Find order item that matches this inventoryId
  //       for (const order of orders) {
  //         const matchingItem = order.items.find(item => item.inventoryId === part.inventoryId)
  //         if (matchingItem) {
  //           setPurchasedOrderItem({
  //             orderId: order.id,
  //             orderItemId: matchingItem.id,
  //           })
  //           return
  //         }
  //       }
  //       setPurchasedOrderItem(null)
  //     } catch (err) {
  //       console.error('Failed to check purchase:', err)
  //       setPurchasedOrderItem(null)
  //     } finally {
  //       setIsCheckingPurchase(false)
  //     }
  //   }

  //   checkPurchase()
  // }, [isAuthenticated, part?.inventoryId])

  // Show loading state while checking sessionStorage
  // COMMENTED OUT - SHOWING EMPTY PAGE FOR NOW
  // if (isLoading) {
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <Navigation />
  //       <div className="pt-32 pb-16 px-6 text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
  //         <p className="text-muted">Loading product details...</p>
  //       </div>
  //       <Footer />
  //     </main>
  //   )
  // }

  // if (!part) {
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <Navigation />
  //       <div className="pt-32 pb-16 px-6 text-center">
  //         <h1 className="text-4xl font-light text-white mb-4">Part Not Found</h1>
  //         <p className="text-muted mb-8">
  //           The part you're looking for doesn't exist or has been removed. Please navigate to this page from the catalog.
  //         </p>
  //         <Link href="/catalog">
  //           <Button className="bg-accent hover:bg-accent/90">Back to Catalog</Button>
  //         </Link>
  //       </div>
  //       <Footer />
  //     </main>
  //   )
  // }

  // const relatedParts = parts.filter((p) => part.relatedParts?.includes(p.id))
  // const images = part.images || [part.image]

  // const averageRating = ratingData?.averageRating || part.averageRating || 0
  // const reviewCount = ratingData?.reviewCount || part.reviewCount || 0

  // const handleAddToCart = async () => {
  //   if (!part || isAddingToCart) return
    
  //   setIsAddingToCart(true)
  //   try {
  //     const success = await addToCart(part, quantity)
  //     if (success) {
  //       setAddedToCart(true)
  //       setTimeout(() => setAddedToCart(false), 2000)
  //     }
  //   } catch (error) {
  //     console.error('Error adding to cart:', error)
  //   } finally {
  //     setIsAddingToCart(false)
  //   }
  // }

  // const openVideoModal = (video: { title: string; url: string }) => {
  //   setSelectedVideo(video)
  //   setVideoModalOpen(true)
  // }

  // EMPTY PAGE FOR NOW - DEBUGGING SESSION STORAGE ISSUES
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl font-light text-white mb-4">Product Detail Page</h1>
        <p className="text-muted mb-8">
          Product ID: {id}
        </p>
        <p className="text-muted mb-8">
          Data loading temporarily disabled for debugging
        </p>
        <Link href="/catalog">
          <Button className="bg-accent hover:bg-accent/90">Back to Catalog</Button>
        </Link>
      </div>
      <Footer />
    </main>
  )

  /* COMMENTED OUT - ORIGINAL RENDER WITH DATA
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <section className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted py-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/catalog" className="hover:text-white transition-colors">
              Catalog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/catalog?category=${part.category}`} className="hover:text-white transition-colors">
              {part.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{part.name}</span>
          </nav>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white/5">
                <Image
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={part.name}
                  fill
                  className="object-cover"
                />
                {!part.inStock && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500/90 text-white text-sm font-medium rounded-full">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? "border-accent" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${part.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-4">
                {part.brand && (
                  <span className="px-3 py-1 bg-white/10 text-white text-sm font-medium rounded-full">
                    {part.brand}
                  </span>
                )}
                <span className="px-3 py-1 bg-accent/20 text-accent text-sm font-medium rounded-full">
                  {part.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-white mb-4">{part.name}</h1>

              {/* Rating */}
              {isLoadingRating ? (
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (averageRating > 0 || reviewCount > 0) ? (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-muted">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : null}

              <p className="text-muted font-light leading-relaxed mb-6">{part.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-bold text-white">${part.price.toLocaleString()}</span>
                {part.inStock && (
                  <span className="text-sm text-green-400 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    In Stock
                  </span>
                )}
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {part.sku && (
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">SKU</p>
                    <p className="text-white font-medium">{part.sku}</p>
                  </div>
                )}
                {part.warranty && (
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Warranty</p>
                    <p className="text-white font-medium">{part.warranty}</p>
                  </div>
                )}
                {part.installationDifficulty && (
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Install Difficulty</p>
                    <p
                      className={`font-medium ${
                        part.installationDifficulty === "Easy"
                          ? "text-green-400"
                          : part.installationDifficulty === "Medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {part.installationDifficulty}
                    </p>
                  </div>
                )}
                {part.installationTime && (
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Install Time</p>
                    <p className="text-white font-medium">{part.installationTime}</p>
                  </div>
                )}
              </div>

              {/* Compatibility */}
              <div className="mb-8">
                <p className="text-sm text-muted uppercase tracking-wider mb-3">Compatible With</p>
                <div className="flex flex-wrap gap-2">
                  {part.compatibility.map((vehicle) => (
                    <span
                      key={vehicle}
                      className="px-3 py-1 bg-white/5 text-white/80 text-sm rounded-full border border-white/10"
                    >
                      {vehicle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 border-white/20 text-white hover:bg-white/10 bg-transparent"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!part.inStock}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-16 h-10 flex items-center justify-center bg-white/5 border border-white/20 rounded-md">
                      <span className="text-white font-medium">{quantity}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 border-white/20 text-white hover:bg-white/10 bg-transparent"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={!part.inStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-accent hover:bg-accent/90 text-white py-6 text-lg relative"
                    onClick={handleAddToCart}
                    disabled={!part.inStock || isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : addedToCart ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {part.inStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent h-[52px] w-[52px]"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent h-[52px] w-[52px]"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Download PDF Documentation */}
                {part.inStock && (
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Installation Guide (PDF)
                  </Button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Truck className="h-5 w-5 text-accent" />
                  <span className="text-xs text-muted">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-xs text-muted">Warranty Included</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="text-xs text-muted">Fast Delivery</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 space-y-2 text-sm text-muted">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  30-day return policy for unused parts
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Expert installation support available
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Secure payment processing
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-6 py-16 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-light text-white text-center mb-12">
              Why Choose <span className="font-semibold">Our Parts</span>
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-white font-medium mb-2">Quality Guaranteed</h3>
                <p className="text-sm text-muted">All parts are OEM or better quality with manufacturer warranties</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-white font-medium mb-2">Fast Shipping</h3>
                <p className="text-sm text-muted">Free shipping on all orders with tracking included</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-white font-medium mb-2">Expert Support</h3>
                <p className="text-sm text-muted">Technical support team ready to assist with installation</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-white font-medium mb-2">Easy Returns</h3>
                <p className="text-sm text-muted">30-day hassle-free returns on all unused parts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

  
      {/* Tabs Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Tab Headers */}
          <div className="flex gap-1 mb-8 border-b border-white/10 overflow-x-auto">
            {[
              { id: "specs", label: "Specifications", icon: FileText },
              { id: "features", label: "Features", icon: Package },
              { id: "reviews", label: `Reviews (${reviewCount})`, icon: Star },
              { id: "faq", label: "FAQ", icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "specs" | "features" | "reviews" | "faq")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
                  activeTab === tab.id ? "text-accent border-accent" : "text-muted border-transparent hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "specs" && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-6">Technical Specifications</h3>
                    <div className="space-y-4">
                      {part.specifications?.map((spec, index) => (
                        <div key={index} className="flex justify-between py-3 border-b border-white/10 last:border-0">
                          <span className="text-muted">{spec.label}</span>
                          <span className="text-white font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-6">Physical Details</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Weight", value: part.weight },
                        { label: "Dimensions", value: part.dimensions },
                        { label: "Material", value: part.material },
                        { label: "Brand", value: part.brand },
                      ]
                        .filter((item) => item.value)
                        .map((item, index) => (
                          <div key={index} className="flex justify-between py-3 border-b border-white/10 last:border-0">
                            <span className="text-muted">{item.label}</span>
                            <span className="text-white font-medium">{item.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "features" && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass-card rounded-xl p-8">
                  <h3 className="text-lg font-medium text-white mb-6">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {part.features?.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Rating Summary */}
                {isLoadingRating ? (
                  <div className="glass-card rounded-xl p-6">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : ratingData ? (
                  <div className="glass-card rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Average Rating */}
                      <div className="text-center">
                        <div className="text-5xl font-light text-white mb-2">{ratingData.averageRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= Math.round(ratingData.averageRating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-white/20"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted text-sm">Based on {ratingData.reviewCount} {ratingData.reviewCount === 1 ? 'review' : 'reviews'}</p>
                      </div>
                      
                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = ratingData.distribution[rating as keyof typeof ratingData.distribution] || 0
                          const percentage = ratingData.reviewCount > 0 ? (count / ratingData.reviewCount) * 100 : 0
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-16">
                                <span className="text-sm text-white">{rating}</span>
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              </div>
                              <Progress value={percentage} className="flex-1 h-2" />
                              <span className="text-sm text-muted w-12 text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Write Review Button - Prominent Placement */}
                {isAuthenticated && (
                  <div className="glass-card rounded-xl p-6 mb-6">
                    {isCheckingPurchase ? (
                      <div className="flex items-center justify-center gap-2 text-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Checking if you've purchased this product...</span>
                      </div>
                    ) : purchasedOrderItem ? (
                      <div className="text-center">
                        <p className="text-white mb-4">Share your experience with this product</p>
                        <Button
                          onClick={() => setReviewModalOpen(true)}
                          className="bg-accent hover:bg-accent/90"
                          size="lg"
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          Write a Review
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-muted mb-2">Purchase this product to write a review</p>
                        <Link href="/catalog">
                          <Button variant="outline" size="sm">
                            Browse Products
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews List */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-light text-white">Customer Reviews</h3>
                  {reviews.length > 0 && (
                    <Select value={reviewsSortBy} onValueChange={(value: any) => setReviewsSortBy(value)}>
                      <SelectTrigger className="w-40 bg-muted/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="highest">Highest Rated</SelectItem>
                        <SelectItem value="lowest">Lowest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {isLoadingReviews ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : reviews.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="glass-card rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                <span className="text-accent font-medium">
                                  {review.buyer.firstName.charAt(0)}{review.buyer.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {review.buyer.firstName} {review.buyer.lastName}
                                </p>
                                <p className="text-sm text-muted">
                                  {format(new Date(review.createdAt), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="text-white font-medium mb-2">{review.title}</h4>
                          )}
                          <p className="text-white/80 font-light">{review.comment}</p>
                          {review.response && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="text-sm text-muted-foreground mb-1">Seller Response:</p>
                              <p className="text-white/70 font-light text-sm">{review.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {reviewsTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div className="text-sm text-muted">
                          Showing page {reviewsPage} of {reviewsTotalPages} ({reviewsTotal} total reviews)
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                            disabled={reviewsPage === 1 || isLoadingReviews}
                            className="border-border"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewsPage(p => Math.min(reviewsTotalPages, p + 1))}
                            disabled={reviewsPage === reviewsTotalPages || isLoadingReviews}
                            className="border-border"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 glass-card rounded-xl">
                    <Star className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white mb-2">No reviews yet</p>
                    <p className="text-muted mb-4">Be the first to review this product</p>
                    {isAuthenticated && purchasedOrderItem && (
                      <Button
                        onClick={() => setReviewModalOpen(true)}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "faq" && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  {[
                    {
                      question: "Is this compatible with my vehicle?",
                      answer:
                        "Please check the compatibility list above. This part is specifically designed for the vehicles listed. If your vehicle is not listed, please contact our support team for assistance.",
                    },
                    {
                      question: "What's included in the package?",
                      answer:
                        "The package includes the main part, all necessary mounting hardware, installation instructions, and a warranty card. Additional items like brake fluid or specialized tools may need to be purchased separately.",
                    },
                    {
                      question: "Do I need professional installation?",
                      answer: `Installation difficulty is rated as ${part.installationDifficulty}. While some customers with mechanical experience can install it themselves, we recommend professional installation for optimal performance and warranty validity.`,
                    },
                    {
                      question: "What's the warranty coverage?",
                      answer: `This part comes with ${part.warranty || "manufacturer's warranty"}. The warranty covers manufacturing defects and material failures. Normal wear and tear, improper installation, or misuse are not covered.`,
                    },
                    {
                      question: "How long does shipping take?",
                      answer:
                        "Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for faster delivery. Free shipping is included for all orders.",
                    },
                    {
                      question: "Can I return this if it doesn't fit?",
                      answer:
                        "Yes, we offer a 30-day return policy for unused parts in original packaging. The part must be in resalable condition. Return shipping costs may apply unless the part is defective.",
                    },
                  ].map((faq, index) => (
                    <div key={index} className="glass-card rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <HelpCircle className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-2">{faq.question}</h4>
                          <p className="text-white/70 font-light leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 glass-card rounded-xl p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Still have questions?</h3>
                  <p className="text-muted mb-6">Our support team is here to help you</p>
                  <Link href="/contact">
                    <Button className="bg-accent hover:bg-accent/90">Contact Support</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Related Parts */}
      {relatedParts.length > 0 && (
        <section className="px-6 py-16 bg-black/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light text-white">
                  Related <span className="font-semibold">Parts</span>
                </h2>
                <Link href="/catalog" className="text-accent hover:underline text-sm flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedParts.map((relatedPart, index) => (
                  <motion.div
                    key={relatedPart.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={`/parts/${relatedPart.id}`}>
                      <div className="group glass-card rounded-xl overflow-hidden">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={relatedPart.image || "/placeholder.svg"}
                            alt={relatedPart.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6">
                          <p className="text-sm text-accent mb-2">{relatedPart.category}</p>
                          <h3 className="text-lg font-medium text-white mb-2 group-hover:text-accent transition-colors">
                            {relatedPart.name}
                          </h3>
                          <p className="text-xl font-bold text-white">${relatedPart.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-6"
            onClick={() => setVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 text-accent" />
                  <p className="text-xl font-medium">{selectedVideo.title}</p>
                  <p className="text-muted mt-2">Video player would load here</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted mb-1">Price</p>
            <p className="text-2xl font-bold text-white">${(part.price * quantity).toLocaleString()}</p>
          </div>
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-white py-6 text-base"
            onClick={handleAddToCart}
            disabled={!part.inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : addedToCart ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="!max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Rating */}
            <div>
              <Label className="text-white mb-3 block">Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= reviewForm.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/20 hover:text-yellow-400/50"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-muted text-sm">{reviewForm.rating} out of 5</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="review-title" className="text-white mb-2 block">
                Review Title
              </Label>
              <Input
                id="review-title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your review a title"
                className="bg-muted/50 border-border"
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="review-comment" className="text-white mb-2 block">
                Your Review
              </Label>
              <Textarea
                id="review-comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                className="bg-muted/50 border-border min-h-32"
                maxLength={1000}
              />
              <p className="text-xs text-muted mt-1">
                {reviewForm.comment.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewModalOpen(false)
                  setReviewForm({ rating: 5, title: "", comment: "" })
                }}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!part?.inventoryId || !purchasedOrderItem) return

                  // Validate form
                  if (!reviewForm.title.trim()) {
                    toast({
                      title: "Validation Error",
                      description: "Please enter a review title",
                      variant: "destructive",
                    })
                    return
                  }

                  if (!reviewForm.comment.trim()) {
                    toast({
                      title: "Validation Error",
                      description: "Please enter your review",
                      variant: "destructive",
                    })
                    return
                  }

                  if (reviewForm.comment.trim().length < 10) {
                    toast({
                      title: "Validation Error",
                      description: "Review must be at least 10 characters long",
                      variant: "destructive",
                    })
                    return
                  }

                  setIsSubmittingReview(true)
                  try {
                    await createReview({
                      inventoryId: part.inventoryId,
                      orderId: purchasedOrderItem.orderId,
                      orderItemId: purchasedOrderItem.orderItemId,
                      rating: reviewForm.rating,
                      title: reviewForm.title.trim(),
                      comment: reviewForm.comment.trim(),
                    })

                    toast({
                      title: "Review Submitted",
                      description: "Thank you for your review! It will be visible after moderation.",
                    })

                    // Reset form and close modal
                    setReviewForm({ rating: 5, title: "", comment: "" })
                    setReviewModalOpen(false)

                    // Reload reviews
                    if (part.inventoryId) {
                      const data = await getProductReviews(part.inventoryId, reviewsPage, 10, reviewsSortBy)
                      setReviews(data.reviews)
                      setReviewsTotalPages(data.pagination.totalPages)
                      setReviewsTotal(data.pagination.total)
                    }

                    // Reload rating
                    if (part.inventoryId) {
                      const rating = await getProductRating(part.inventoryId)
                      setRatingData(rating)
                    }
                  } catch (error: any) {
                    const errorMessage = error.message || "Failed to submit review"
                    
                    // Handle specific error for already reviewed
                    if (errorMessage.toLowerCase().includes("already reviewed")) {
                      toast({
                        title: "Already Reviewed",
                        description: "You have already reviewed this product. Each product can only be reviewed once.",
                        variant: "destructive",
                      })
                    } else {
                      toast({
                        title: "Error",
                        description: errorMessage,
                        variant: "destructive",
                      })
                    }
                  } finally {
                    setIsSubmittingReview(false)
                  }
                }}
                disabled={isSubmittingReview || !reviewForm.title.trim() || !reviewForm.comment.trim()}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
  */
}
