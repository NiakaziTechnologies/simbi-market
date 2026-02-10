"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Search, ChevronRight, CheckCircle2, Wrench } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface LiveSearchResultsProps {
    isVisible: boolean
    filters: {
        year: string
        make: string
        model: string
        category: string
    }
}

export function LiveSearchResults({ isVisible, filters }: LiveSearchResultsProps) {
    const { filteredItems } = useSelector((state: RootState) => state.parts)
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

    // Use the filtered items from Redux (already filtered by the slice)
    const displayItems = filteredItems.slice(0, 4) // Show top 4 results

    return (
        <AnimatePresence>
            {isVisible && displayItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-4 z-50"
                >
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/20 bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-accent uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                Matching Results
                            </span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wide">
                                Showing {displayItems.length} of {displayItems.length} items
                            </span>
                        </div>

                        <div className="divide-y divide-white/10">
                            {displayItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/parts/${item.id}`}
                                    className="group flex items-center gap-4 p-4 hover:bg-white/5 transition-all duration-300"
                                >
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-muted/30">
                                        {!item.image || imageErrors.has(item.id) ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                                                <Wrench className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                        ) : (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={() => setImageErrors(prev => new Set(prev).add(item.id))}
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-white font-medium text-sm truncate group-hover:text-accent transition-colors">
                                                {item.name}
                                            </h4>
                                            {item.inStock && (
                                                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                                            <span>{item.brand || "Brembo"}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span>{item.category}</span>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className="text-white font-semibold text-sm">
                                            ${item.price.toLocaleString()}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link href="/catalog" className="block p-4 bg-white/5 hover:bg-white/10 text-center transition-colors">
                            <span className="text-xs font-medium text-white/60 hover:text-white transition-colors">
                                View all results in Catalogue
                            </span>
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
