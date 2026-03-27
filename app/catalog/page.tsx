import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { CatalogContent } from "@/components/catalog-content"

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent />
      </Suspense>
    </main>
  )
}

function CatalogSkeleton() {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-16 w-64 bg-white/5 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
        <div className="glass-card rounded-lg p-6 mb-12 animate-pulse">
          <div className="h-12 bg-white/5 rounded mb-6" />
          <div className="flex gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-white/5 rounded" />
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-lg overflow-hidden">
              <div className="h-64 bg-white/5 animate-pulse" />
              <div className="p-6">
                <div className="h-4 w-16 bg-white/5 rounded mb-2 animate-pulse" />
                <div className="h-6 w-48 bg-white/5 rounded mb-4 animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

