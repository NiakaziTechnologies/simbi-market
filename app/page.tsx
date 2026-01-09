import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { BrandsSection } from "@/components/brands-section"
import { SegmentSection } from "@/components/segment-section"
import { AccessPointSection } from "@/components/access-point-section"
import { EngineeringExcellenceSection } from "@/components/engineering-excellence-section"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <BrandsSection />
      <SegmentSection />
      <AccessPointSection />
      <EngineeringExcellenceSection />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
