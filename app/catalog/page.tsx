import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { CatalogContent } from "@/components/catalog-content"
import { CatalogSearchCard } from "@/components/catalog-search-card"

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero — image background with title + search card on top */}
      <div
        style={{
          backgroundImage: "url('/home/hero.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%)", zIndex: 0 }} />

        {/* Title + search card — all on top of the image */}
        <div style={{ position: "relative", zIndex: 1, paddingTop: "180px", paddingBottom: "100px", paddingLeft: "24px", paddingRight: "24px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "32px", height: "3px", borderRadius: "9999px", background: "#007aff" }} />
                <span style={{ color: "#007aff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>Premium Auto Parts</span>
                <div style={{ width: "32px", height: "3px", borderRadius: "9999px", background: "#007aff" }} />
              </div>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "12px" }}>
                Explore Parts <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>Catalogue</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
                Premium Autoparts delivered straight to your doorstep
              </p>
            </div>

            {/* Search card — sits on the image */}
            <CatalogSearchCard />
          </div>
        </div>
      </div>

      {/* Results grid below the hero */}
      <Suspense fallback={null}>
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

