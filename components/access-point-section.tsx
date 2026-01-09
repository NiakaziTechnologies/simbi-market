"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check, Users, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    icon: Users,
    title: "Individual Enthusiasts",
    stat: "3M+",
    statLabel: "Parts Available",
    subtitle: "For passionate car owners",
    description:
      "Access premium OEM and aftermarket parts with expert guidance. Perfect for DIY enthusiasts who demand quality and precision.",
    features: [
      "Verified OEM & Aftermarket Parts",
      "Expert Product Reviews",
      "30-Day Money-Back Guarantee",
      "Detailed Installation Guides",
    ],
    cta: "Start Shopping",
    href: "/catalog",
    gradient: "from-blue-600/10 to-purple-600/10",
  },
  {
    icon: Building2,
    title: "Business & Professional",
    stat: "500+",
    statLabel: "Active Partners",
    subtitle: "Enterprise & Trade solutions",
    description:
      "Strategic solutions for dealerships, workshops, and fleet operators. Benefit from bulk pricing, API integration, and dedicated priority support.",
    features: [
      "Volume Discounts up to 30%",
      "API & System Integration",
      "Inventory Management Tools",
      "Dedicated Account Manager",
    ],
    cta: "Partner With Us",
    href: "/contact",
    gradient: "from-accent/10 to-blue-600/10",
    featured: true,
  },
]

export function AccessPointSection() {
  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Your Access Point</p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-6">
            Choose <span className="font-semibold">Your Experience</span>
          </h2>
          <p className="text-lg text-muted font-light max-w-2xl mx-auto">
            Specialized services tailored for individual hobbyists and large-scale automotive enterprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group h-full"
            >
              <div
                className={`glass-card rounded-3xl p-10 h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:border-white/30 ${tier.featured ? "border-accent/50 bg-accent/5" : "border-white/10"
                  }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-50`} />

                {/* Featured Badge */}
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-bl-xl uppercase">
                    Recommended
                  </div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${tier.featured ? "bg-accent/20" : "bg-white/5"}`}>
                    <tier.icon className={`h-8 w-8 ${tier.featured ? "text-accent" : "text-white/70"}`} />
                  </div>

                  {/* Stats */}
                  <div className="mb-8">
                    <div className="text-5xl font-light text-white mb-1">{tier.stat}</div>
                    <div className="text-xs text-muted uppercase tracking-[0.2em] font-medium">{tier.statLabel}</div>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <h3 className="text-3xl font-light text-white mb-2">{tier.title}</h3>
                    <p className="text-sm text-accent font-medium">{tier.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-white/60 font-light mb-8 leading-relaxed text-lg">{tier.description}</p>

                  <div className="mt-auto">
                    {/* Features */}
                    <div className="space-y-4 mb-10">
                      {tier.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-accent" />
                          </div>
                          <span className="text-sm text-white/80 font-light">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link href={tier.href}>
                      <Button
                        size="lg"
                        className={`w-full h-14 rounded-xl text-base font-medium transition-all duration-300 ${tier.featured
                            ? "bg-accent hover:bg-accent/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          }`}
                      >
                        {tier.cta}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
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
