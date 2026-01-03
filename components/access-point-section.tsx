"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Check, Users, Wrench, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    icon: Users,
    title: "Individual Enthusiasts",
    stat: "3M+",
    statLabel: "Parts Available",
    subtitle: "For passionate car owners",
    description:
      "Access premium OEM and aftermarket parts with expert guidance. Perfect for DIY enthusiasts and car lovers who demand quality.",
    features: [
      "Verified OEM & Aftermarket Parts",
      "Expert Product Reviews & Ratings",
      "30-Day Money-Back Guarantee",
      "Detailed Installation Guides",
    ],
    cta: "Start Shopping",
    href: "/catalog",
    gradient: "from-blue-600/20 to-purple-600/20",
    image: "/new/wheel_alignin.jpeg",
  },
  {
    icon: Wrench,
    title: "Professional Mechanics",
    stat: "500+",
    statLabel: "Active Pros",
    subtitle: "Trade accounts & bulk pricing",
    description:
      "Streamline your workshop operations with bulk ordering, priority support, and dedicated account management for faster turnaround.",
    features: [
      "Same-Day Express Shipping",
      "Volume Discounts up to 30%",
      "24/7 Priority Technical Support",
      "Dedicated Account Manager",
    ],
    cta: "Apply for Trade",
    href: "/contact",
    gradient: "from-accent/20 to-orange-600/20",
    featured: true,
    image: "/new/work.jpeg",
  },
  {
    icon: Building2,
    title: "Enterprise Solutions",
    stat: "50+",
    statLabel: "Business Partners",
    subtitle: "Custom fleet & business solutions",
    description:
      "Tailored solutions for dealerships, fleet operators, and automotive businesses. API integration, custom pricing, and dedicated support.",
    features: [
      "Custom Contract Pricing",
      "API & System Integration",
      "Inventory Management Tools",
      "White-Label Solutions",
    ],
    cta: "Contact Sales",
    href: "/contact",
    gradient: "from-green-600/20 to-teal-600/20",
    image: "/new/",
  },
]

export function AccessPointSection() {
  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
          <p className="text-lg text-muted font-light max-w-3xl mx-auto">
            From individual enthusiasts to enterprise solutions, we have you covered with specialized services and
            support.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative group ${tier.featured ? "lg:-mt-8" : ""}`}
            >
              <div
                className={`glass-card rounded-2xl p-8 h-full flex flex-col relative overflow-hidden ${
                  tier.featured ? "border-2 border-accent" : ""
                }`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 opacity-10">
                  <Image
                    src={tier.image}
                    alt={tier.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-50`} />

                {/* Featured Badge */}
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-xs font-medium px-4 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <tier.icon className="h-7 w-7 text-accent" />
                  </div>

                  {/* Stats */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-1">{tier.stat}</div>
                    <div className="text-sm text-muted uppercase tracking-wide">{tier.statLabel}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-medium text-white mb-2">{tier.title}</h3>
                  <p className="text-sm text-accent mb-4">{tier.subtitle}</p>

                  {/* Description */}
                  <p className="text-white/70 font-light mb-6 leading-relaxed">{tier.description}</p>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-accent" />
                        </div>
                        <span className="text-sm text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={tier.href}>
                    <Button
                      className={`w-full ${
                        tier.featured
                          ? "bg-accent hover:bg-accent/90"
                          : "bg-white/10 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
