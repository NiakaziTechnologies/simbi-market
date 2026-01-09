"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const brands = [
  {
    name: "Range Rover",
    logo: "/home/range-rover-logo-png_seeklogo-230449.png",
    image: "/home/range_car.jpg",
    partsCount: "50k+",
    href: "/catalog?brand=rangerover",
  },
  {
    name: "Honda",
    logo: "/home/honda-1596081_960_720.webp",
    image: "/home/honda_car.avif",
    partsCount: "50k+",
    href: "/catalog?brand=honda",
  },
  {
    name: "Audi",
    logo: "/home/Audi-Logo-Banner.avif",
    image: "/home/audi_car.jpg",
    partsCount: "50k+",
    href: "/catalog?brand=audi",
  },
  {
    name: "BMW",
    logo: "/home/images.png",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&q=80",
    partsCount: "50k+",
    href: "/catalog?brand=bmw",
  },
  {
    name: "Toyota",
    logo: "/home/toyota.png",
    image: "/home/toyota_car.jpg",
    partsCount: "600k+",
    href: "/catalog?brand=toyota",
  },
  {
    name: "Tesla",
    logo: "/home/tesla_logo.png",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&q=80",
    partsCount: 28,
    href: "/catalog?brand=tesla",
  },
]

export function BrandsSection() {
  return (
    <section className="py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16"
        >
          <div>
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Shop By Brand</p>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white">
              Premium <span className="font-semibold">Brands</span>
            </h2>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-2 text-white/80 hover:text-accent transition-colors font-light group"
          >
            View All Brands
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={brand.href}>
                <div className="group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer">
                  {/* Background Image */}
                  <Image
                    src={brand.image || "/placeholder.svg"}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-xl lg:text-2xl font-light text-white mb-1 group-hover:text-accent transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-white/60 font-light">{brand.partsCount} Parts Available</p>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
