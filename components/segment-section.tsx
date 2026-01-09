"use client"

import { motion } from "framer-motion"
import { User, Wrench, Building2, ArrowRight, Check, Star, Shield, Clock, Zap, HeadphonesIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const segments = [
  {
    icon: User,
    title: "Individual Enthusiasts",
    subtitle: "For passionate car owners",
    description:
      "Access premium OEM and aftermarket parts with expert guidance. Perfect for DIY enthusiasts and car lovers who demand quality.",
    features: [
      { icon: Check, text: "Verified OEM & Aftermarket Parts" },
      { icon: Star, text: "Expert Product Reviews & Ratings" },
      { icon: Shield, text: "30-Day Money-Back Guarantee" },
      { icon: Clock, text: "Detailed Installation Guides" },
    ],
    cta: "Start Shopping",
    href: "/catalog",
    image: "/new/oil_change.jpeg",
    stats: { label: "Parts Available", value: "3M+" },
    accent: "from-accent/20 to-transparent",
  },
  {
    icon: Wrench,
    title: "Professional Mechanics",
    subtitle: "Trade accounts & bulk pricing",
    description:
      "Streamline your workshop operations with bulk ordering, priority support, and dedicated account management for faster turnaround.",
    features: [
      { icon: Zap, text: "Same-Day Express Shipping" },
      { icon: Check, text: "Volume Discounts up to 30%" },
      { icon: HeadphonesIcon, text: "24/7 Priority Technical Support" },
      { icon: Star, text: "Dedicated Account Manager" },
    ],
    cta: "Apply for Trade",
    href: "/contact",
    image: "/new/work.jpeg",
    stats: { label: "", value: "" },
    accent: "from-blue-500/20 to-transparent",
  },
  // {
  //   icon: Building2,
  //   title: "Enterprise Solutions",
  //   subtitle: "Custom fleet & business solutions",
  //   description:
  //     "Tailored solutions for dealerships, fleet operators, and automotive businesses. API integration, custom pricing, and dedicated support.",
  //   features: [
  //     { icon: Shield, text: "Custom Contract Pricing" },
  //     { icon: Zap, text: "API & System Integration" },
  //     { icon: Check, text: "Inventory Management Tools" },
  //     { icon: Star, text: "White-Label Solutions" },
  //   ],
  //   cta: "Contact Sales",
  //   href: "/contact",
  //   image: "/car-dealership-showroom-luxury.jpg",
  //   stats: { label: "Business Partners", value: "50+" },
  //   accent: "from-emerald-500/20 to-transparent",
  // },
]

export function SegmentSection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background via-background to-black/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Tailored Solutions</p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-6">
            Your <span className="font-semibold">Access Point</span>
          </h2>
          <p className="text-muted font-light leading-relaxed max-w-2xl mx-auto text-lg">
            Choose the experience that fits your needs. From individual enthusiasts to enterprise solutions, we have you
            covered with specialized services and support.
          </p>
        </motion.div>

        <div className="space-y-8">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all duration-500 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  {/* Image Section */}
                  <div className="relative w-full lg:w-2/5 h-64 lg:h-auto min-h-[400px]">
                    <Image
                      src={segment.image || "/placeholder.svg"}
                      alt={segment.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${segment.accent}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />

                    {/* Stats Badge */}
                    <div className="absolute bottom-6 left-6 glass-card rounded-lg px-4 py-3">
                      <p className="text-3xl font-bold text-white">{segment.stats.value}</p>
                      <p className="text-xs text-muted uppercase tracking-wider">{segment.stats.label}</p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 group-hover:bg-accent/10 transition-colors">
                        <segment.icon className="h-7 w-7 text-white group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-accent font-medium">{segment.subtitle}</p>
                        <h3 className="text-2xl lg:text-3xl font-light tracking-tight text-white">{segment.title}</h3>
                      </div>
                    </div>

                    <p className="text-muted font-light mb-8 leading-relaxed text-lg">{segment.description}</p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                      {segment.features.map((feature) => (
                        <div key={feature.text} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <feature.icon className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm text-white/80 font-light">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={segment.href} className="inline-flex">
                      <button className="group/btn flex items-center gap-2 px-6 py-3 bg-white text-black font-medium tracking-wide rounded-full hover:bg-accent hover:text-white transition-all">
                        {segment.cta}
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
