"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { filterByCategory, searchParts, clearFilters, setFilters } from "@/lib/features/parts-slice"
import { useCart } from "@/lib/hooks/use-cart"
import { Search, Filter, Grid3X3, List, Plus, Check, Eye, PackageX, Loader2, Star, Wrench } from "lucide-react"
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

  // Debounce search query - wait for user to finish typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Fetch products from API when filters/search change (using debounced query)
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Get filters from URL params or Redux state
        const urlYear = searchParams?.get("year")
        const urlMake = searchParams?.get("make")
        const urlModel = searchParams?.get("model")
        const urlCategory = searchParams?.get("category")
        
        const apiFilters: ProductFilters = {
          q: debouncedSearchQuery || undefined,
          category: urlCategory || selectedCategory || filters.category || undefined,
          make: urlMake || filters.make || undefined,
          year: urlYear || filters.year || undefined,
          model: urlModel || filters.model || undefined,
          page: 1,
          limit: 60, // 60 products per page
        }
        
        const response = await fetchProducts(apiFilters)
        const fetchedProducts = response.products || []
        setProducts(fetchedProducts)
        
        // Store products in sessionStorage so detail page can access them
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
  }, [debouncedSearchQuery, selectedCategory, filters.category, filters.make, filters.year, filters.model, searchParams])

  // Initialize search query and filters from URL params
  useEffect(() => {
    const urlQuery = searchParams?.get("q") || ""
    const urlYear = searchParams?.get("year") || ""
    const urlMake = searchParams?.get("make") || ""
    const urlModel = searchParams?.get("model") || ""
    const urlCategory = searchParams?.get("category") || ""
    const urlVin = searchParams?.get("vin") || ""
    
    // Update search query
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery)
    }
    
    // Update filters from URL if they exist
    if (urlYear || urlMake || urlModel || urlCategory) {
      const newFilters: any = {}
      if (urlYear) newFilters.year = urlYear
      if (urlMake) newFilters.make = urlMake
      if (urlModel) newFilters.model = urlModel
      if (urlCategory) newFilters.category = urlCategory
      dispatch(setFilters(newFilters))
    }
    
    // Handle VIN search
    if (urlVin && !urlQuery) {
      setSearchQuery(urlVin)
    }
  }, [searchParams, dispatch])

  // Update URL when search query changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQuery = searchParams?.get("q") || ""
      if (searchQuery !== currentQuery) {
        const params = new URLSearchParams(searchParams?.toString() || "")
        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim())
        } else {
          params.delete("q")
        }
        router.replace(`/catalog?${params.toString()}`, { scroll: false })
      }
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, router, searchParams])

  // Keep Redux in sync for category selection (if needed elsewhere)
  useEffect(() => {
    if (selectedCategory) {
      dispatch(filterByCategory(selectedCategory))
    }
  }, [selectedCategory, dispatch])

  const hasActiveFilters = !!(filters.year || filters.make || filters.model || filters.category || hasCategoryFilter || searchQuery)
  const displayItems = products
  const hasNoResults = !isLoading && !error && displayItems.length === 0

  const handleCategoryClick = (category: string) => {
    setSearchQuery("")
    dispatch(filterByCategory(category === "All" ? null : category))
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground mb-4">
              Explore Parts <span className="font-semibold">Catalogue</span>
            </h1>
            <p className="text-muted font-light leading-relaxed max-w-2xl mx-auto">
              Premium automotive components engineered for excellence
            </p>
          </div>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground mb-4">
              Explore Parts <span className="font-semibold">Catalogue</span>
            </h1>
            <p className="text-muted font-light leading-relaxed max-w-2xl mx-auto">
              Premium automotive components engineered for excellence
            </p>
          </div>
          <div className="glass-card rounded-xl p-12 max-w-md mx-auto border border-destructive/50 text-center">
            <PackageX className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h3 className="text-2xl font-light text-foreground mb-4">Error Loading Products</h3>
            <p className="text-muted font-light mb-8 leading-relaxed">{error}</p>
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
    // Prevent adding out-of-stock items
    if (!item.inStock) {
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

  const handleClearAllFilters = () => {
    dispatch(clearFilters())
    setSearchQuery("")
  }

  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground mb-4">
            Explore Parts <span className="font-semibold">Catalogue</span>
          </h1>
          <p className="text-muted font-light leading-relaxed max-w-2xl mx-auto">
            Premium automotive components engineered for excellence
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card rounded-xl p-8 mb-12 border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="space-y-8">
            <div className="flex flex-col gap-0 overflow-hidden">
              <SearchFilters />
            </div>

            <div className="relative group max-w-3xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input
                type="text"
                placeholder="Search by part name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground text-lg transition-all focus:ring-accent focus:border-accent rounded-xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {/* Results Count & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted font-light"
          >
            Showing {displayItems.length} {displayItems.length === 1 ? "result" : "results"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-9 w-9 p-0 transition-all ${viewMode === "grid"
                  ? "bg-accent/20 text-accent shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-9 w-9 p-0 transition-all ${viewMode === "list"
                  ? "bg-accent/20 text-accent shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <List className="h-4 w-4" />
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
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div 
                    className="group glass-card rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300"
                  >
                    {/* Image */}
                    <Link href={`/parts/${item.id}`} className="block" prefetch={false}>
                      <div className="relative h-64 overflow-hidden bg-muted/30">
                        {!item.image || imageErrors.has(item.id) ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                            <Wrench className="h-20 w-20 text-muted-foreground/50" />
                          </div>
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => setImageErrors(prev => new Set(prev).add(item.id))}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {item.inStock ? (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/90 text-white text-xs font-medium rounded">
                            In Stock
                          </div>
                        ) : (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-destructive/90 text-white text-xs font-medium rounded">
                            Out of Stock
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6">
                      <Link href={`/parts/${item.id}`} className="block" prefetch={false}>
                        <span className="text-xs text-accent font-medium tracking-wider uppercase">{item.category}</span>
                        <h3 className="text-xl font-light text-foreground mt-2 mb-2 group-hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-muted font-light text-sm leading-relaxed mb-3">{item.description || 'No description available'}</p>
                      </Link>

                      {/* Ratings */}
                      {(item.averageRating !== undefined && item.averageRating > 0) || (item.reviewCount !== undefined && item.reviewCount > 0) ? (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= Math.round(item.averageRating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.averageRating?.toFixed(1) || "0.0"}
                            {item.reviewCount !== undefined && item.reviewCount > 0 && (
                              <span className="ml-1">({item.reviewCount})</span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-muted text-muted-foreground" />
                          <span>No reviews yet</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl font-light text-foreground">${(item.price || 0).toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border hover:bg-muted"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              router.push(`/parts/${item.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddToCart(item)
                            }} 
                            disabled={!item.inStock || addingToCart.has(item.id)} 
                            size="sm"
                          >
                            {addingToCart.has(item.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : addedItems.has(item.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
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
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div 
                    className="group glass-card rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <Link href={`/parts/${item.id}`} className="block md:w-64 flex-shrink-0" prefetch={false}>
                        <div className="relative w-full h-48 md:h-64 overflow-hidden bg-muted/30">
                          {!item.image || imageErrors.has(item.id) ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                              <Wrench className="h-20 w-20 text-muted-foreground/50" />
                            </div>
                          ) : (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={() => setImageErrors(prev => new Set(prev).add(item.id))}
                            />
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-accent font-medium tracking-wider uppercase">
                              {item.category}
                            </span>
                            {item.inStock ? (
                              <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-medium rounded">
                                In Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-destructive/90 text-white text-xs font-medium rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <Link href={`/parts/${item.id}`} className="block" prefetch={false}>
                            <h3 className="text-2xl font-light text-foreground mb-2 group-hover:text-accent transition-colors">
                              {item.name}
                            </h3>
                            {/* Ratings */}
                            {(item.averageRating !== undefined && item.averageRating > 0) || (item.reviewCount !== undefined && item.reviewCount > 0) ? (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= Math.round(item.averageRating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-muted text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {item.averageRating?.toFixed(1) || "0.0"}
                                  {item.reviewCount !== undefined && item.reviewCount > 0 && (
                                    <span className="ml-1">({item.reviewCount} reviews)</span>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                                <span>No reviews yet</span>
                              </div>
                            )}
                          </Link>
                          <p className="text-muted font-light leading-relaxed mb-4">{item.description || 'No description available'}</p>
                          {item.compatibility && item.compatibility.length > 0 && (
                            <p className="text-sm text-muted font-light">
                              Compatible with: {item.compatibility.join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-6 gap-4">
                          <span className="text-3xl font-light text-foreground">${(item.price || 0).toLocaleString()}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="border-border hover:bg-muted"
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
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleAddToCart(item)
                              }} 
                              disabled={!item.inStock || addingToCart.has(item.id)} 
                              size="lg"
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
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </>
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
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
