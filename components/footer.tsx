"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, ArrowRight, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  quickLinks: [
    { name: "Shop Parts", href: "/catalog" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  categories: [
    { name: "Engine Parts", href: "/catalog?category=Engine" },
    { name: "Brake Systems", href: "/catalog?category=Brakes" },
    { name: "Suspension", href: "/catalog?category=Suspension" },
    { name: "Wheels & Tires", href: "/catalog?category=Wheels" },
  ],
  support: [
    { name: "FAQ", href: "/contact" },
    { name: "Shipping Info", href: "/contact" },
    { name: "Returns", href: "/contact" },
    { name: "Warranty", href: "/contact" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-background dark:bg-black border-t border-border dark:border-white/10">
      {/* Newsletter Section */}
      <div className="border-b border-border dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-light text-foreground dark:text-white mb-2">
                Stay <span className="font-semibold">Updated</span>
              </h3>
              <p className="text-muted-foreground dark:text-muted font-light">
                Subscribe to our newsletter for the latest parts and exclusive offers.
              </p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-muted/50 dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40 lg:w-80"
              />
              <Button className="bg-accent hover:bg-accent/90 text-white px-6">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground dark:text-white inline-block mb-6">
              SIMBI<span className="text-accent">.</span>
            </Link>
            <p className="text-muted-foreground dark:text-muted font-light leading-relaxed mb-6">
              Your premier destination for high-quality automotive parts and accessories. Serving car enthusiasts and
              professionals with excellence since 2010.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted/50 dark:bg-white/5 flex items-center justify-center hover:bg-accent/20 hover:text-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground dark:text-muted hover:text-foreground dark:hover:text-white transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground dark:text-white mb-4">Categories</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground dark:text-muted hover:text-foreground dark:hover:text-white transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground dark:text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground dark:text-muted hover:text-foreground dark:hover:text-white transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground dark:text-white mb-4">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-accent mt-1" />
                <span className="text-muted-foreground dark:text-muted font-light">077 822 4653</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-accent mt-1" />
                <span className="text-muted-foreground dark:text-muted font-light">info@simbimarket.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-muted-foreground dark:text-muted font-light">
                  ZB Centre 4th floor, Corner First Street and Union Ave, Harare, Zimbabwe
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground dark:text-muted font-light">© 2026 Simbi Market. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground dark:text-muted font-light">
              <Link href="/privacy" className="hover:text-foreground dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="hidden md:inline">
                Website by{" "}
                <a href="#" className="text-accent hover:underline">
                  Niakazi Technology Solutions
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
