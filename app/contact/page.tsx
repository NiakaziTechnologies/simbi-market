"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Headphones, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    content: "077 822 4653",
    description: "Mon-Fri 8am to 5pm",
  },
  {
    icon: Mail,
    title: "Email",
    content: "info@simbimarket.com",
    description: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Location",
    content: "ZB Centre 4th floor",
    description: "Corner First Street and Union Ave, Harare",
  },
  {
    icon: Clock,
    title: "Business Hours",
    content: "Mon - Fri: 8:00 - 17:00",
    description: "Sat: 9:00 - 13:00",
  },
]

const inquiryTypes = [
  { icon: MessageSquare, title: "General Inquiry", description: "Questions about our products and services" },
  { icon: Headphones, title: "Technical Support", description: "Help with parts compatibility and installation" },
  { icon: Building2, title: "Business Partnership", description: "Trade accounts and bulk ordering" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "general",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Contact Us</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground dark:text-white mb-6">
              Get In <span className="font-semibold">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground dark:text-muted font-light max-w-2xl mx-auto">
            We deliver premium automotive components right to your door step
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-6 pb-16 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card dark:glass-card rounded-xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <info.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-medium text-foreground dark:text-white mb-1">{info.title}</h3>
                <p className="text-foreground dark:text-white font-light mb-1">{info.content}</p>
                <p className="text-sm text-muted-foreground dark:text-muted">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="px-6 py-16 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Inquiry Types */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <h2 className="text-2xl font-light text-foreground dark:text-white mb-8">
                How can we <span className="font-semibold">help?</span>
              </h2>
              <div className="space-y-4">
                {inquiryTypes.map((type, index) => (
                  <motion.button
                    key={type.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => setFormData({ ...formData, type: type.title.toLowerCase().replace(" ", "-") })}
                    className={`w-full text-left p-6 rounded-xl border transition-all ${
                      formData.type === type.title.toLowerCase().replace(" ", "-")
                        ? "border-accent bg-accent/10"
                        : "border-border dark:border-white/10 bg-secondary dark:bg-white/[0.02] hover:border-accent dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          formData.type === type.title.toLowerCase().replace(" ", "-") ? "bg-accent/20" : "bg-accent/5 dark:bg-white/5"
                        }`}
                      >
                        <type.icon
                          className={`h-5 w-5 ${
                            formData.type === type.title.toLowerCase().replace(" ", "-")
                              ? "text-accent"
                              : "text-muted-foreground dark:text-white/70"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-foreground dark:text-white font-medium mb-1">{type.title}</h3>
                        <p className="text-sm text-muted-foreground dark:text-muted">{type.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Map Preview */}
              <div className="mt-8 rounded-xl overflow-hidden h-48 bg-secondary dark:bg-white/5 flex items-center justify-center border border-border dark:border-white/10">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-foreground dark:text-white font-light">ZB Centre, Harare</p>
                  <p className="text-sm text-muted-foreground dark:text-muted">View on Google Maps</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3"
            >
              <div className="glass-card dark:glass-card rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-light text-foreground dark:text-white mb-2">
                  Send us a <span className="font-semibold">message</span>
                </h2>
                <p className="text-muted-foreground dark:text-muted font-light mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-foreground dark:text-white mb-2">Full Name *</label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground dark:text-white mb-2">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-foreground dark:text-white mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+263 77 822 4653"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground dark:text-white mb-2">Subject *</label>
                      <Input
                        type="text"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-foreground dark:text-white mb-2">Message *</label>
                    <Textarea
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40 min-h-[150px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white py-6 text-lg">
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-32 bg-secondary dark:bg-black/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground dark:text-white">
              Common <span className="font-semibold">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and mobile money payments including EcoCash and OneMoney.",
              },
              {
                q: "How long does shipping take?",
                a: "Local deliveries within Harare take 1-2 business days. Nationwide shipping takes 3-5 business days depending on your location.",
              },
              {
                q: "Do you offer warranty on parts?",
                a: "Yes, all our parts come with a minimum 12-month warranty. Some OEM parts include extended manufacturer warranties.",
              },
              {
                q: "Can I return a part if it's not compatible?",
                a: "Yes, we offer a 30-day return policy for unused parts in original packaging. Our team can help verify compatibility before purchase.",
              },
            ].map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card dark:glass-card rounded-xl p-6"
              >
                <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">{faq.q}</h3>
                <p className="text-muted-foreground dark:text-muted font-light">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
