"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Award, Truck } from "lucide-react"
import Image from "next/image"

const features = [
  {
    icon: Shield,
    title: "Verified Quality",
    description: "Every part is authenticated and tested",
  },
  {
    icon: Zap,
    title: "Instant Compatibility",
    description: "AI-powered matching for your vehicle",
  },
  {
    icon: Award,
    title: "Premium Warranty",
    description: "Industry-leading coverage included",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Global shipping in 24-48 hours",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] rounded-lg overflow-hidden"
          >
            <Image src="/new/transmission.jpeg" alt="Precision engineering" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </motion.div>

          {/* Features */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-light tracking-tight text-foreground dark:text-white mb-6">
                Engineering
                <br />
                <span className="font-semibold">Excellence</span>
              </h2>
              <p className="text-muted-foreground dark:text-muted font-light leading-relaxed mb-12">
                Experience the future of automotive parts sourcing with our premium platform
              </p>

              <div className="space-y-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-light text-foreground dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground dark:text-muted font-light leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
