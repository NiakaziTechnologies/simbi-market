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
}
