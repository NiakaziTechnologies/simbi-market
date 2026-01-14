"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, User, ChevronDown, Menu, X, ArrowRight, Search, Plus } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { SearchFilters } from "@/components/search-filters"

const navItems = [
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
  {
    label: "Home",
    href: "/",
    megaMenu: null,
  },
  {
    label: "About Us",
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
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSellerOpen, setIsSellerOpen] = useState(false)
  const [isBuyerOpen, setIsBuyerOpen] = useState(false)
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || activeMenu ? "bg-background/95 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
          }`}
        onMouseLeave={() => {
          setActiveMenu(null)
          setIsSellerOpen(false)
          setIsBuyerOpen(false)
        }}
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
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded-full ${item.highlighted
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
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === item.label ? "rotate-180" : ""
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
              {/* Seller Account Button & Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsSellerOpen(!isSellerOpen)
                    setIsBuyerOpen(false)
                    setIsSearchOpen(false)
                  }}
                  className={`hidden lg:flex items-center gap-2 px-6 h-10 rounded-full transition-all duration-300 border-2 ${isSellerOpen
                    ? "bg-accent text-white border-accent scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    : "text-white border-white/40 hover:bg-white/10 hover:border-white/60"
                    }`}
                >
                  <span className="text-sm font-medium">Seller Account</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSellerOpen ? "rotate-180" : ""}`} />
                </Button>
                <AnimatePresence>
                  {isSellerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl"
                    >
                      <div className="p-1">
                        <Link href="/auth/seller/login">
                          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/seller/register">
                          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
                            Create Account
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buyer Account Button & Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsBuyerOpen(!isBuyerOpen)
                    setIsSellerOpen(false)
                    setIsSearchOpen(false)
                  }}
                  className={`hidden lg:flex items-center gap-2 px-6 h-10 rounded-full transition-all duration-300 border-2 ${isBuyerOpen
                    ? "bg-accent text-white border-accent scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    : "text-white border-white/40 hover:bg-white/10 hover:border-white/60"
                    }`}
                >
                  <span className="text-sm font-medium">Buyer Account</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isBuyerOpen ? "rotate-180" : ""}`} />
                </Button>
                <AnimatePresence>
                  {isBuyerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl"
                    >
                      <div className="p-1">
                        <Link href="/auth/buyer/login">
                          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/buyer/register">
                          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
                            Create Account
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen)
                  setIsSellerOpen(false)
                  setIsBuyerOpen(false)
                }}
                className={`hidden lg:flex items-center gap-2 px-6 h-10 rounded-full transition-all duration-300 border-2 ${isSearchOpen
                  ? "bg-accent text-white border-accent scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  : "text-white border-white/40 hover:bg-white/10 hover:border-white/60"
                  }`}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">Search</span>
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
                    item.megaMenu ? (
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
                    ) : null
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Search Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
            >
              <div className="max-w-[1000px] mx-auto px-6 py-12">
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-light text-white">Find Your <span className="font-semibold text-accent">Parts</span></h3>
                    <p className="text-sm text-muted font-light">Search over 3 million premium automotive components</p>
                  </div>

                  <div className="flex flex-col gap-0 max-w-4xl mx-auto">
                    <SearchFilters />
                  </div>

                  <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search by part name, number, or VIN..."
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-xl pl-12 pr-32 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-lg"
                    />
                    <Button className="absolute right-2 top-2 bottom-2 px-8 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg">
                      Search
                    </Button>
                  </div>

                  <div className="flex justify-center gap-8 text-xs text-white/40 font-light">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Free Expert Shipping</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Genuine OEM Parts</span>
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> 24/7 Support</span>
                  </div>
                </div>
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
                {/* Mobile Account Links */}
                <div className="flex flex-col gap-2 mb-4 p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-semibold mb-2">Seller Account</h4>
                  <Link href="/auth/seller/login" className="text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/auth/seller/register" className="text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>Create Account</Link>
                </div>
                <div className="flex flex-col gap-2 mb-4 p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-semibold mb-2">Buyer Account</h4>
                  <Link href="/auth/buyer/login" className="text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/auth/buyer/register" className="text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>Create Account</Link>
                </div>

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
