"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { motion } from "framer-motion"
import { Search, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchFilters } from "@/components/search-filters"

export function SearchSection() {
  const router = useRouter()
  const { filters } = useSelector((state: RootState) => state.parts)
  const [searchType, setSearchType] = useState<"part" | "vin">("part")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="relative py-12 px-6 -mt-32 z-30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-2xl p-8 md:p-10 border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] bg-black/60 backdrop-blur-3xl"
        >
          {/* Search Type Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-white/5 rounded-xl border border-white/10">
              <Button
                variant={searchType === "part" ? "default" : "ghost"}
                onClick={() => setSearchType("part")}
                className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 ${searchType === "part" ? "bg-accent text-white shadow-lg" : "text-white/60 hover:text-white"
                  }`}
              >
                <Search className="mr-2 h-4 w-4" />
                Part Search
              </Button>
              <Button
                variant={searchType === "vin" ? "default" : "ghost"}
                onClick={() => setSearchType("vin")}
                className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 ${searchType === "vin" ? "bg-accent text-white shadow-lg" : "text-white/60 hover:text-white"
                  }`}
              >
                <Scan className="mr-2 h-4 w-4" />
                VIN Search
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {searchType === "part" && (
              <div className="flex flex-col gap-0 overflow-hidden">
                <SearchFilters />
              </div>
            )}

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Build catalog URL with search parameters
                const params = new URLSearchParams()
                
                if (searchType === "part") {
                  // Part search - include filters and query
                  if (searchQuery.trim()) {
                    params.set("q", searchQuery.trim())
                  }
                  if (filters.year) params.set("year", filters.year)
                  if (filters.make) params.set("make", filters.make)
                  if (filters.model) params.set("model", filters.model)
                  if (filters.category) params.set("category", filters.category)
                } else {
                  // VIN search - just the VIN query
                  if (searchQuery.trim()) {
                    params.set("vin", searchQuery.trim())
                  }
                }
                
                router.push(`/catalog?${params.toString()}`)
              }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchType === "vin" ? "Enter your 17-digit VIN" : "Enter part name or number"}
                  className={`h-16 pl-12 pr-36 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg transition-all focus:ring-accent focus:border-accent rounded-xl ${searchType === "vin" ? "font-mono tracking-widest uppercase" : ""
                    }`}
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-8 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg shadow-lg hover:shadow-accent/20 transition-all"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            <p className="text-xs text-white/40 font-light flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
              Secure Encrypted Search
            </p>
            <p className="text-xs text-white/40 font-light flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
              3M+ Parts Indexed
            </p>
            <p className="text-xs text-white/40 font-light flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
              Instant Results
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
