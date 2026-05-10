"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { filterByCategory, searchParts, clearFilters, setFilters } from "@/lib/features/parts-slice"
import { useCart } from "@/lib/hooks/use-cart"
import { Search, Filter, Grid3X3, List, Plus, Check, Eye, PackageX, Loader2, Star, Wrench, Hash, Factory, Car, Tag, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { SearchFilters } from "@/components/search-filters"
import { fetchProducts, type ProductFilters } from "@/lib/api/products"
import type { Part } from "@/lib/features/parts-slice"

const categories = ["All", "Brakes", "Engine", "Suspension", "Exhaust", "Wheels"]

export function CatalogContent() {
   const dispatch = useDispatch()
   const { addToCart } = useCart()
   const router = useRouter()
   const searchParams = useSearchParams()
   const { selectedCategory, hasCategoryFilter, filters } = useSelector((state: RootState) => state.parts)
   const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
   const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "")
   const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
   const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set())
   const [products, setProducts] = useState<Part[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams?.get("q") || "")
   const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
   const [currentPage, setCurrentPage] = useState(() => {
     const urlPage = searchParams?.get("page")
     const parsed = urlPage ? parseInt(urlPage, 10) : 1
     return !Number.isNaN(parsed) && parsed > 0 ? parsed : 1
   })
   const [totalPages, setTotalPages] = useState(1)
   const [totalResults, setTotalResults] = useState(0)
   const [pageSize, setPageSize] = useState(60)
   const isFirstRender = useRef(true)

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Initialize Redux filters from URL params (mount only)
  useEffect(() => {
    const urlYear = searchParams?.get("year") || ""
    const urlMake = searchParams?.get("make") || ""
    const urlModel = searchParams?.get("model") || ""
    const urlCategory = searchParams?.get("category") || ""
    const urlVin = searchParams?.get("vin") || ""

    if (urlYear || urlMake || urlModel || urlCategory) {
      const newFilters: any = {}
      if (urlYear) newFilters.year = urlYear
      if (urlMake) newFilters.make = urlMake
      if (urlModel) newFilters.model = urlModel
      if (urlCategory) newFilters.category = urlCategory
      dispatch(setFilters(newFilters))
    }

    if (urlVin && !searchQuery) {
      setSearchQuery(urlVin)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // Reset to page 1 when search or filters change (skip first render to preserve URL page)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setCurrentPage(1)
  }, [debouncedSearchQuery, filters.year, filters.make, filters.model, filters.category, selectedCategory])

  // Fetch products from API (driven entirely by React state, NOT searchParams)
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const apiFilters: ProductFilters = {
          q: debouncedSearchQuery || undefined,
          category: filters.category || selectedCategory || undefined,
          make: filters.make || undefined,
          year: filters.year || undefined,
          model: filters.model || undefined,
          page: currentPage,
          limit: 60,
        }

        const response = await fetchProducts(apiFilters)
        const fetchedProducts = response.products || []
        setProducts(fetchedProducts)
        setTotalResults(response.total || fetchedProducts.length)
        setTotalPages(response.totalPages || 1)
        setPageSize(response.limit || 60)

        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('catalogProducts', JSON.stringify(fetchedProducts))
          } catch (err) {
            console.warn('Failed to store products in sessionStorage:', err)
          }
        }
      } catch (err) {
        console.error('Error loading products:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [debouncedSearchQuery, filters.category, filters.make, filters.year, filters.model, selectedCategory, currentPage])

  // Sync state → URL (one-way, debounced). URL is never read back after mount.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set("q", searchQuery.trim())
      if (filters.year) params.set("year", filters.year)
      if (filters.make) params.set("make", filters.make)
      if (filters.model) params.set("model", filters.model)
      if (filters.category) params.set("category", filters.category)
      if (currentPage > 1) params.set("page", String(currentPage))

      const queryString = params.toString()
      router.replace(queryString ? `/catalog?${queryString}` : "/catalog", { scroll: false })
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, filters.year, filters.make, filters.model, filters.category, currentPage, router])

  // Keep Redux in sync for category selection
  useEffect(() => {
    if (selectedCategory) {
      dispatch(filterByCategory(selectedCategory))
    }
  }, [selectedCategory, dispatch])

  const hasActiveFilters = !!(filters.year || filters.make || filters.model || filters.category || hasCategoryFilter || searchQuery)
  const displayItems = products
  const hasNoResults = !isLoading && !error && displayItems.length === 0
  const startIndex = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = totalResults === 0 ? 0 : Math.min(startIndex + displayItems.length - 1, totalResults)

  const handleCategoryClick = (category: string) => {
    setSearchQuery("")
    dispatch(filterByCategory(category === "All" ? null : category))
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="pb-16 px-6" style={{ background: "transparent" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="pb-16 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="search-card rounded-xl p-12 max-w-md mx-auto border border-destructive/50 text-center mt-8">
            <PackageX className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h3 className="text-2xl font-light text-foreground mb-4">Error Loading Products</h3>
            <p className="text-muted-foreground font-light mb-8 leading-relaxed">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const handleAddToCart = async (item: Part) => {
    if (item.inStock === false) {
      alert('This item is out of stock and cannot be added to cart.')
      return
    }
    
    if (addingToCart.has(item.id)) return
    
    setAddingToCart((prev) => new Set(prev).add(item.id))
    try {
      const success = await addToCart(item, 1)
      if (success) {
        setAddedItems((prev) => new Set(prev).add(item.id))
        setTimeout(() => {
          setAddedItems((prev) => {
            const next = new Set(prev)
            next.delete(item.id)
            return next
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearAllFilters = () => {
    dispatch(clearFilters())
    setSearchQuery("")
  }

  const getCategoryClass = (category: string) => {
    const map: Record<string, string> = {
      'Brakes': 'cat-brakes',
      'Engine': 'cat-engine',
      'Suspension': 'cat-suspension',
      'Exhaust': 'cat-exhaust',
      'Wheels': 'cat-wheels',
      'Electrical': 'cat-electrical',
      'Transmission': 'cat-transmission',
      'Body': 'cat-body',
    }
    return map[category] || 'text-accent'
  }

  return (
    <div>
      {/* ── Results section ── */}
      <section className="pb-16 px-6 bg-background pt-8">
        <div className="max-w-7xl mx-auto">

        {/* Results Count & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground text-sm"
          >
            {totalResults > 0
              ? `Showing ${startIndex}–${endIndex} of ${totalResults} ${totalResults === 1 ? "part" : "parts"}`
              : "Showing 0 parts"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center gap-1 bg-white/50 dark:bg-white/5 p-1 rounded-lg border border-border/50 dark:border-white/10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === "grid"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === "list"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                }`}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>

        {/* No Results State */}
        {hasNoResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="glass-card rounded-xl p-12 max-w-md mx-auto border border-border">
              <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-light text-foreground mb-4">No Results Found</h3>
              <p className="text-muted font-light mb-8 leading-relaxed">
                We couldn't find any parts matching your current filters. Try adjusting your search criteria or clearing the filters.
              </p>
              <Button
                onClick={handleClearAllFilters}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Clear All Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {!hasNoResults && viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
               {displayItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="card-glow group relative glass-card rounded-xl overflow-hidden border border-border dark:border-white/10 hover:border-transparent transition-all duration-300 hover:shadow-[0_24px_80px_-20px_rgba(0,122,255,0.2)]">
                    <div className="card-glow-inner">
                    {/* OEM/Genuine corner ribbon */}
                    {item.partType && (item.partType === 'OEM' || item.partType === 'Genuine') && (
                      <div className={`corner-ribbon ${item.partType === 'OEM' ? 'corner-ribbon-oem' : 'corner-ribbon-genuine'}`}>
                        {item.partType}
                      </div>
                    )}

                    {/* Image */}
                    <Link href={`/parts/${item.id}`} className="block" prefetch={false}>
                      <div className="card-shimmer relative h-56 overflow-hidden bg-muted/20">
                        {!item.image || imageErrors.has(item.id) ? (
                          <div className="placeholder-orbs absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10">
                            <div className="flex flex-col items-center gap-2">
                              <Wrench className="h-14 w-14 text-muted-foreground/30" />
                              <span className="text-[10px] text-muted-foreground/40 font-medium tracking-wider uppercase">No Image</span>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={() => setImageErrors(prev => new Set(prev).add(item.id))}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Quick action overlay */}
                        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 z-10">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              router.push(`/parts/${item.id}`)
                            }}
                            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/95 text-gray-800 shadow-xl hover:bg-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddToCart(item)
                            }}
                            disabled={item.inStock === false || addingToCart.has(item.id)}
                            className="flex items-center justify-center w-11 h-11 rounded-full bg-accent text-white shadow-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingToCart.has(item.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : addedItems.has(item.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <ShoppingCart className="h-4 w-4" />
                            )}
                          </motion.button>
                        </div>

                        {/* Stock badge */}
                        <div className="absolute top-3 left-3 z-10">
                          {item.inStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full tracking-wider shadow-lg shadow-emerald-500/20">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              IN STOCK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full tracking-wider shadow-lg shadow-red-500/20">
                              <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                              SOLD OUT
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/parts/${item.id}`} className="block" prefetch={false}>
                        <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md ${getCategoryClass(item.category || '')}`}>
                          {item.category}
                        </span>
                        <h3 className="text-[14px] font-semibold text-foreground mt-2 mb-1.5 leading-snug group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5em]">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground font-light text-[12px] leading-relaxed mb-3 line-clamp-2 min-h-[2.4em]">
                          {item.description || 'No description available'}
                        </p>
                      </Link>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.brand && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                            <Factory className="h-2.5 w-2.5" />
                            {item.brand}
                          </span>
                        )}
                        {item.oemPartNumber && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                            <Hash className="h-2.5 w-2.5" />
                            {item.oemPartNumber}
                          </span>
                        )}
                        {item.sku && !item.oemPartNumber && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                            <Hash className="h-2.5 w-2.5" />
                            {item.sku}
                          </span>
                        )}
                        {item.vehicleModels && item.vehicleModels.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                            <Car className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[70px]">{item.vehicleModels[0]}</span>
                            {item.vehicleModels.length > 1 && <span>+{item.vehicleModels.length - 1}</span>}
                          </span>
                        )}
                        {item.vehicleYears && item.vehicleYears.length > 0 && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                            {Math.min(...item.vehicleYears)}-{Math.max(...item.vehicleYears)}
                          </span>
                        )}
                      </div>

                      {/* Ratings */}
                      {(item.averageRating !== undefined && item.averageRating > 0) || (item.reviewCount !== undefined && item.reviewCount > 0) ? (
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= Math.round(item.averageRating || 0)
                                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                    : "fill-muted/20 text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            {item.averageRating?.toFixed(1)}
                            {item.reviewCount !== undefined && item.reviewCount > 0 && (
                              <span className="text-muted-foreground/50 font-normal ml-0.5">({item.reviewCount})</span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-3 w-3 fill-muted/15 text-muted-foreground/25" />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground/40 font-medium">No reviews</span>
                        </div>
                      )}

                      {/* Price & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/40 dark:border-white/5">
                        <div>
                          <div className="price-highlight text-lg font-extrabold text-foreground tracking-tight">
                            ${(item.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg border-border/50 hover:border-accent/50 hover:bg-accent/5 hover:text-accent transition-all"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              router.push(`/parts/${item.id}`)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className={`h-8 rounded-lg bg-accent hover:bg-accent/90 text-white shadow-sm hover:shadow-lg hover:shadow-accent/20 transition-all ${addedItems.has(item.id) ? 'cart-success bg-emerald-500 hover:bg-emerald-500' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddToCart(item)
                            }}
                            disabled={item.inStock === false || addingToCart.has(item.id)}
                          >
                            {addingToCart.has(item.id) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : addedItems.has(item.id) ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Plus className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : !hasNoResults && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
               {displayItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                >
                  <div className="card-glow group relative glass-card rounded-xl overflow-hidden border border-border dark:border-white/10 hover:border-transparent transition-all duration-300 hover:shadow-[0_24px_80px_-20px_rgba(0,122,255,0.15)]">
                    <div className="card-glow-inner">
                    {/* OEM/Genuine corner ribbon */}
                    {item.partType && (item.partType === 'OEM' || item.partType === 'Genuine') && (
                      <div className={`corner-ribbon ${item.partType === 'OEM' ? 'corner-ribbon-oem' : 'corner-ribbon-genuine'}`} style={{ top: '18px', right: '-32px' }}>
                        {item.partType}
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <Link href={`/parts/${item.id}`} className="block md:w-72 lg:w-80 flex-shrink-0" prefetch={false}>
                        <div className="card-shimmer relative w-full h-48 md:h-full md:min-h-[260px] overflow-hidden bg-muted/20">
                          {!item.image || imageErrors.has(item.id) ? (
                            <div className="placeholder-orbs absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10">
                              <div className="flex flex-col items-center gap-2">
                                <Wrench className="h-14 w-14 text-muted-foreground/30" />
                                <span className="text-[10px] text-muted-foreground/40 font-medium tracking-wider uppercase">No Image</span>
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={() => setImageErrors(prev => new Set(prev).add(item.id))}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 hidden md:block" />

                          {/* Stock badge */}
                          <div className="absolute top-3 left-3 z-10">
                            {item.inStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full tracking-wider shadow-lg shadow-emerald-500/20">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                IN STOCK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full tracking-wider shadow-lg shadow-red-500/20">
                                <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                SOLD OUT
                              </span>
                            )}
                          </div>

                          {/* Part type badge */}
                          {item.partType && item.partType !== 'OEM' && item.partType !== 'Genuine' && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-full tracking-wider">
                                {item.partType.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md ${getCategoryClass(item.category || '')}`}>
                              {item.category}
                            </span>
                          </div>
                          <Link href={`/parts/${item.id}`} className="block" prefetch={false}>
                            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors leading-snug">
                              {item.name}
                            </h3>
                          </Link>

                          {/* Ratings */}
                          {(item.averageRating !== undefined && item.averageRating > 0) || (item.reviewCount !== undefined && item.reviewCount > 0) ? (
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= Math.round(item.averageRating || 0)
                                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                        : "fill-muted/20 text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground font-semibold">
                                {item.averageRating?.toFixed(1)}
                                {item.reviewCount !== undefined && item.reviewCount > 0 && (
                                  <span className="text-muted-foreground/50 font-normal ml-1">({item.reviewCount} reviews)</span>
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="h-3.5 w-3.5 fill-muted/15 text-muted-foreground/25" />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground/40 font-medium">No reviews</span>
                            </div>
                          )}

                          <p className="text-muted-foreground font-light text-sm leading-relaxed mb-3 line-clamp-2">
                            {item.description || 'No description available'}
                          </p>

                          {/* Metadata badges */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {item.brand && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                <Factory className="h-2.5 w-2.5" />
                                {item.brand}
                              </span>
                            )}
                            {item.oemPartNumber && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                <Hash className="h-2.5 w-2.5" />
                                OEM: {item.oemPartNumber}
                              </span>
                            )}
                            {item.sku && !item.oemPartNumber && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                <Hash className="h-2.5 w-2.5" />
                                SKU: {item.sku}
                              </span>
                            )}
                            {item.vehicleModels && item.vehicleModels.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                <Car className="h-2.5 w-2.5" />
                                {item.vehicleModels.slice(0, 2).join(", ")}
                                {item.vehicleModels.length > 2 && ` +${item.vehicleModels.length - 2}`}
                              </span>
                            )}
                            {item.vehicleYears && item.vehicleYears.length > 0 && (
                              <span className="inline-flex items-center text-[10px] font-semibold text-foreground/70 bg-foreground/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                {Math.min(...item.vehicleYears)}-{Math.max(...item.vehicleYears)}
                              </span>
                            )}
                          </div>

                          {item.compatibility && item.compatibility.length > 0 && (
                            <p className="text-xs text-muted-foreground/60 font-light">
                              <span className="font-semibold text-foreground/70">Compatible:</span> {item.compatibility.slice(0, 3).join(", ")}
                              {item.compatibility.length > 3 && ` +${item.compatibility.length - 3} more`}
                            </p>
                          )}
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/40 dark:border-white/5 gap-4">
                          <div>
                            <div className="price-highlight text-2xl font-extrabold text-foreground tracking-tight">
                              ${(item.price || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="h-10 rounded-lg border-border/50 hover:border-accent/50 hover:bg-accent/5 hover:text-accent transition-all"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/parts/${item.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              className={`h-10 rounded-lg bg-accent hover:bg-accent/90 text-white shadow-sm hover:shadow-lg hover:shadow-accent/20 transition-all ${addedItems.has(item.id) ? 'cart-success bg-emerald-500 hover:bg-emerald-500' : ''}`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleAddToCart(item)
                              }}
                              disabled={item.inStock === false || addingToCart.has(item.id)}
                            >
                              {addingToCart.has(item.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Adding...
                                </>
                              ) : addedItems.has(item.id) ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!hasNoResults && totalPages > 1 && (
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border"
                disabled={currentPage === 1}
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
                  const windowSize = 2

                  const numbered = new Set<number>()
                  numbered.add(1)
                  numbered.add(totalPages)
                  for (let offset = -windowSize; offset <= windowSize; offset++) {
                    const p = currentPage + offset
                    if (p >= 1 && p <= totalPages) numbered.add(p)
                  }

                  const sorted = Array.from(numbered).sort((a, b) => a - b)

                  sorted.forEach((page, idx) => {
                    if (idx > 0 && page - sorted[idx - 1] > 1) {
                      pages.push(idx === 1 ? 'ellipsis-start' : 'ellipsis-end')
                    }
                    pages.push(page)
                  })

                  return pages.map((entry) => {
                    if (typeof entry === 'string') {
                      return (
                        <span key={entry} className="px-1 text-muted-foreground select-none">
                          ...
                        </span>
                      )
                    }
                    return (
                      <Button
                        key={entry}
                        variant={entry === currentPage ? "default" : "outline"}
                        size="sm"
                        className={entry === currentPage ? "bg-accent text-white" : "border-border"}
                        onClick={() => goToPage(entry)}
                      >
                        {entry}
                      </Button>
                    )
                  })
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-border"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      </section>
    </div>
  )
}

