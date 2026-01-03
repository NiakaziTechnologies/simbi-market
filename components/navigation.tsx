"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, User, ChevronDown, Menu, X, ArrowRight, Search } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const navItems = [
  {
    label: "Home",
    href: "/",
    megaMenu: null,
  },
  {
    label: "Services",
    href: "/catalog",
    megaMenu: {
      categories: [
        {
          title: "For Individuals",
          items: [
            { name: "Part Finder", href: "/catalog" },
            { name: "VIN Lookup", href: "/catalog" },
            { name: "Installation Guides", href: "/blog" },
            { name: "Warranty Claims", href: "/contact" },
          ],
        },
        {
          title: "For Professionals",
          items: [
            { name: "Bulk Ordering", href: "/contact" },
            { name: "Trade Accounts", href: "/contact" },
            { name: "API Access", href: "/contact" },
            { name: "Priority Support", href: "/contact" },
          ],
        },
      ],
      featured: {
        title: "Expert Services",
        name: "Professional Installation",
        price: "Book Now",
        image: "/new/shocks.jpeg",
        href: "/contact",
      },
    },
  },
  {
    label: "Company",
    href: "/about",
    megaMenu: {
      categories: [
        {
          title: "About Us",
          items: [
            { name: "Our Story", href: "/about" },
            { name: "Mission & Values", href: "/about" },
            { name: "Quality Assurance", href: "/about" },
          ],
        },
        {
          title: "Resources",
          items: [
            { name: "Blog", href: "/blog" },
            { name: "Contact", href: "/contact" },
            { name: "Support", href: "/contact" },
          ],
        },
      ],
      featured: {
        title: "Quality You Can Trust",
        name: "Premium Parts Supplier",
        price: "Learn More",
        image: "/new/engineworks.jpeg",
        href: "/about",
      },
    },
  },
  {
    label: "Shop Online",
    href: "/catalog",
    highlighted: true,
    megaMenu: {
      categories: [
        {
          title: "Parts",
          items: [
            { name: "Engine Components", href: "/catalog?category=Engine" },
            { name: "Brakes & Suspension", href: "/catalog?category=Brakes" },
            { name: "Exhaust Systems", href: "/catalog?category=Exhaust" },
            { name: "Wheels & Tires", href: "/catalog?category=Wheels" },
            { name: "Suspension Kits", href: "/catalog?category=Suspension" },
            { name: "Turbochargers", href: "/catalog?category=Engine" },
          ],
        },
        {
          title: "Brands",
          items: [
            { name: "Range Rover", href: "/catalog?brand=rangerover" },
            { name: "Land Rover", href: "/catalog?brand=landrover" },
            { name: "Mercedes-Benz", href: "/catalog?brand=mercedes" },
            { name: "BMW", href: "/catalog?brand=bmw" },
            { name: "Audi", href: "/catalog?brand=audi" },
            { name: "Toyota", href: "/catalog?brand=toyota" },
          ],
        },
        {
          title: "Popular Categories",
          items: [
            { name: "Performance Chips", href: "/catalog?category=Engine" },
            { name: "Brake Pads", href: "/catalog?category=Brakes" },
            { name: "Alloy Wheels", href: "/catalog?category=Wheels" },
            { name: "Coilovers", href: "/catalog?category=Suspension" },
            { name: "Intake Systems", href: "/catalog?category=Engine" },
            { name: "Performance Tires", href: "/catalog?category=Wheels" },
          ],
        },
      ],
      featured: {
        title: "3+ Million Parts Available",
        name: "Premium Auto Parts",
        price: "50,000+ parts per brand",
        image: "/carbon-fiber-engine-component-macro-photography.jpg",
        href: "/catalog",
      },
    },
  },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || activeMenu ? "bg-background/95 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
        }`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-semibold tracking-tight text-white">
              SIMBI<span className="text-accent">.</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} onMouseEnter={() => item.megaMenu && setActiveMenu(item.label)} className="relative">
                  {item.megaMenu ? (
                    <button
                      onClick={() => router.push(item.href)}
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded-full ${
                        item.highlighted
                          ? activeMenu === item.label
                            ? "text-white bg-blue-600"
                            : "text-white bg-blue-500 hover:bg-blue-600"
                          : activeMenu === item.label
                          ? "text-white bg-white/10"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          activeMenu === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded-full text-white/80 hover:text-white hover:bg-white/5"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-white/80 hover:text-white hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link href="/checkout">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white/80 hover:text-white hover:bg-white/10"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center text-white font-medium">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-white/10"
            >
              <div className="max-w-[1400px] mx-auto px-6 py-10">
                {navItems
                  .filter((item) => item.label === activeMenu)
                  .map((item) => (
                    <div key={item.label} className="flex gap-12">
                      {/* Categories */}
                      <div className="flex-1 grid grid-cols-3 gap-10">
                        {item.megaMenu.categories.map((category) => (
                          <div key={category.title}>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
                              {category.title}
                            </h4>
                            <ul className="space-y-3">
                              {category.items.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    href={subItem.href}
                                    className="text-white/80 hover:text-white transition-colors font-light flex items-center group"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    {subItem.name}
                                    <ArrowRight className="h-3.5 w-3.5 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Featured Card */}
                      {item.megaMenu.featured && (
                        <Link
                          href={item.megaMenu.featured.href}
                          className="w-72 group"
                          onClick={() => setActiveMenu(null)}
                        >
                          <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                            <Image
                              src={item.megaMenu.featured.image || "/placeholder.svg"}
                              alt={item.megaMenu.featured.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">
                            {item.megaMenu.featured.title}
                          </p>
                          <h4 className="text-white font-medium mb-1 group-hover:text-accent transition-colors">
                            {item.megaMenu.featured.name}
                          </h4>
                          <p className="text-accent font-semibold">{item.megaMenu.featured.price}</p>
                        </Link>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
              <Link href="/" className="text-xl font-semibold tracking-tight text-white">
                SIMBI<span className="text-accent">.</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {navItems.map((item) => (
                item.megaMenu ? (
                  <div key={item.label} className="border-b border-white/10 pb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{item.label}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {item.megaMenu.categories.map((category) => (
                        <div key={category.title}>
                          <p className="text-xs text-muted uppercase tracking-wider mb-2">{category.title}</p>
                          <ul className="space-y-2">
                            {category.items.slice(0, 3).map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className="text-sm text-white/70 hover:text-white"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key={item.label} className="border-b border-white/10 pb-6">
                    <Link
                      href={item.href}
                      className="text-lg font-semibold text-white hover:text-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </div>
                )
              ))}
              <div className="pt-6 space-y-3">
                <Link href="/catalog" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white">Shop All Parts</Button>
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
