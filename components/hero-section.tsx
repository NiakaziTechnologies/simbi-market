"use client"

import { motion } from "framer-motion"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Play, Pause, Search, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchFilters } from "@/components/search-filters"

export function HeroSection() {
  const router = useRouter()
  const { filters } = useSelector((state: RootState) => state.parts)
  const [isPlaying, setIsPlaying] = useState(true)
  const [searchType, setSearchType] = useState<"part" | "vin">("part")
  const [searchQuery, setSearchQuery] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/home/video1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
      </div>

      {/* Play/Pause Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={togglePlay}
        className="absolute top-24 right-6 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 text-white" />
        ) : (
          <Play className="h-5 w-5 text-white ml-0.5" />
        )}
      </motion.button>

      {/* Search Form Integration */}
      <div className="relative h-full flex flex-col items-center justify-center pt-28">
        <div className="max-w-5xl mx-auto px-6 w-full mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter"
          >
            PRECISION <span className="text-accent">SEARCH</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/60 font-light tracking-wide max-w-2xl mx-auto"
          >
            Locate high-performance components or VIN details with our advanced indexing system.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="glass-card rounded-2xl p-8 md:p-10 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] bg-white/5 backdrop-blur-2xl"
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
                <div className="flex flex-col gap-0">
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

            <div className="flex flex-wrap items-center justify-center gap-8 mt-10 opacity-60">
              <p className="text-xs text-white font-light flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shrink-0" />
                Secure Encrypted Search
              </p>
              <p className="text-xs text-white font-light flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0" />
                3M+ Parts Indexed
              </p>
              <p className="text-xs text-white font-light flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 shrink-0" />
                Instant Results
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator (Optional, but kept for visual hint) */}

    </section>
  )
}
