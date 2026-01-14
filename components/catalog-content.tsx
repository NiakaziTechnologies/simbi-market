"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { filterByCategory, searchParts } from "@/lib/features/parts-slice"
import { addToCart } from "@/lib/features/cart-slice"
import { Search, Filter, Grid3X3, List, Plus, Check, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { SearchFilters } from "@/components/search-filters"

const categories = ["All", "Brakes", "Engine", "Suspension", "Exhaust", "Wheels"]

export function CatalogContent() {
  const dispatch = useDispatch()
  const { items, filteredItems, selectedCategory } = useSelector((state: RootState) => state.parts)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  const displayItems = filteredItems.length > 0 || selectedCategory || searchQuery ? filteredItems : items

  useEffect(() => {
    if (searchQuery) {
      dispatch(searchParts(searchQuery))
    } else if (selectedCategory) {
      dispatch(filterByCategory(selectedCategory))
    } else {
      dispatch(filterByCategory(null))
    }
  }, [searchQuery, selectedCategory, dispatch])

  const handleCategoryClick = (category: string) => {
    setSearchQuery("")
    if (category === "All") {
      dispatch(filterByCategory(null))
    } else {
      dispatch(filterByCategory(category))
    }
  }

  const handleAddToCart = (item: (typeof items)[0]) => {
    dispatch(addToCart(item))
    setAddedItems((prev) => new Set(prev).add(item.id))
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }, 2000)
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
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-4">
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
              <Input
                type="text"
                placeholder="Search by part name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg transition-all focus:ring-accent focus:border-accent rounded-xl"
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
            className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-9 w-9 p-0 transition-all ${viewMode === "grid"
                  ? "bg-accent/20 text-accent shadow-inner"
                  : "text-muted hover:text-white hover:bg-white/5"
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
                  : "text-muted hover:text-white hover:bg-white/5"
                }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
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
                  <div className="group glass-card rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300">
                    {/* Image */}
                    <Link href={`/parts/${item.id}`} className="block">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {!item.inStock && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-destructive/90 text-white text-xs font-medium rounded">
                            Out of Stock
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6">
                      <Link href={`/parts/${item.id}`}>
                        <span className="text-xs text-accent font-medium tracking-wider uppercase">{item.category}</span>
                        <h3 className="text-xl font-light text-white mt-2 mb-2 group-hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-muted font-light text-sm leading-relaxed mb-4">{item.description}</p>
                      </Link>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl font-light text-white">${item.price.toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Link href={`/parts/${item.id}`}>
                            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button onClick={() => handleAddToCart(item)} disabled={!item.inStock} size="sm">
                            {addedItems.has(item.id) ? (
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
          ) : (
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
                  <div className="group glass-card rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <Link href={`/parts/${item.id}`} className="block md:w-64 flex-shrink-0">
                        <div className="relative w-full h-48 md:h-64 overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-accent font-medium tracking-wider uppercase">
                              {item.category}
                            </span>
                            {!item.inStock && (
                              <span className="px-3 py-1 bg-destructive/90 text-white text-xs font-medium rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <Link href={`/parts/${item.id}`}>
                            <h3 className="text-2xl font-light text-white mb-2 group-hover:text-accent transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-muted font-light leading-relaxed mb-4">{item.description}</p>
                          <p className="text-sm text-muted font-light">
                            Compatible with: {item.compatibility.join(", ")}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-6 gap-4">
                          <span className="text-3xl font-light text-white">${item.price.toLocaleString()}</span>
                          <div className="flex gap-2">
                            <Link href={`/parts/${item.id}`}>
                              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            <Button onClick={() => handleAddToCart(item)} disabled={!item.inStock} size="lg">
                              {addedItems.has(item.id) ? (
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
