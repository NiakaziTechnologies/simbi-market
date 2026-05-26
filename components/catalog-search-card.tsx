"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchFilters } from "@/components/search-filters"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

export function CatalogSearchCard() {
  const router = useRouter()
  const { filters } = useSelector((state: RootState) => state.parts)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (filters.year) params.set("year", filters.year)
    if (filters.make) params.set("make", filters.make)
    if (filters.model) params.set("model", filters.model)
    if (filters.category) params.set("category", filters.category)
    router.push(`/catalog?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="search-card glass-card rounded-2xl p-6 md:p-8 border border-accent/10 dark:border-white/10 shadow-[0_24px_80px_-20px_rgba(0,122,255,0.12)]"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-0 overflow-hidden">
          <SearchFilters />
        </div>
        <form onSubmit={handleSearch}>
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search by part name, OEM number, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-32 text-[15px] transition-all rounded-xl shadow-sm"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff" }}
            />
            <Button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
