"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Shield, Zap, Award, Truck } from "lucide-react"

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

export function EngineeringExcellenceSection() {
  return (
    <section className="py-32 px-6 bg-foreground dark:bg-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/new/transmission.jpeg"
          alt="Engineering Excellence"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Precision Engineering</p>
          <h2 className="text-5xl md:text-7xl font-light tracking-tight text-foreground dark:text-white mb-6">
            Engineering
            <br />
            <span className="font-semibold">Excellence</span>
          </h2>
          <p className="text-lg text-muted-foreground dark:text-muted font-light max-w-2xl mx-auto">
            Experience the future of automotive parts sourcing with our premium platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="glass-card dark:glass-card rounded-xl p-8 text-center group hover:bg-white/10 dark:hover:bg-white/10 transition-all">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-medium text-foreground dark:text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground dark:text-muted font-light">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
