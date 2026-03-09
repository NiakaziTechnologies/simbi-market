"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Shield, Award, Target, Heart, Zap, CheckCircle } from "lucide-react"

const stats = [
  { value: "100+", label: "Parts Available" },
  { value: "500+", label: "Happy Customers" },
  { value: "15+", label: "Years Experience" },
  { value: "24/7", label: "Customer Support" },
]

const values = [
  {
    icon: Shield,
    title: "Quality First",
    description: "Every part undergoes rigorous testing and verification. We never compromise on quality.",
  },
  {
    icon: Target,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We go above and beyond to exceed expectations.",
  },
  {
    icon: Heart,
    title: "Passion Driven",
    description: "We're automotive enthusiasts ourselves. We understand and share your passion for vehicles.",
  },
  {
    icon: Zap,
    title: "Speed & Efficiency",
    description: "Fast delivery, quick responses, and streamlined processes to save you time.",
  },
]

const certifications = [
  "ISO 9001:2015 Certified",
  "OEM Authorized Distributor",
  "Certified Automotive Parts Supplier",
  "Environmental Management Certified",
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/new/banner.jpeg"
            alt="About Simbi Market"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 pt-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">About Our Company</p>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6 text-balance">
                Your Trusted
                <br />
                <span className="font-semibold">Automotive Partner</span>
              </h1>
              <p className="text-lg text-white/70 font-light max-w-2xl leading-relaxed">
                Simbi Market is a trusted source for premium automotive parts and accessories. We specialize in
                providing high-quality components for all vehicle makes and models.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</p>
                <p className="text-muted-foreground dark:text-muted font-light uppercase tracking-wider text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 px-6 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Our Mission</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground dark:text-white mb-6">
                Empowering Vehicle Owners
                <br />
                <span className="font-semibold">Worldwide</span>
              </h2>
              <p className="text-muted-foreground dark:text-muted font-light leading-relaxed mb-8 text-lg">
                To empower vehicle owners and automotive professionals with reliable, high-quality parts and exceptional
                service. Our team of certified automotive experts carefully curates every product in our extensive
                catalogue, ensuring you receive only the finest parts for your vehicle.
              </p>
              <p className="text-foreground dark:text-white/80 font-light leading-relaxed">
                We understand that your vehicle is more than just transportation—it's an investment and passion. That's
                why we're committed to providing only the highest quality automotive parts, backed by expert knowledge
                and unmatched customer service.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image src="/new/about.jpeg" alt="Our Mission" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-card dark:glass-card rounded-xl p-6 max-w-xs">
                <Award className="h-8 w-8 text-accent mb-3" />
                <p className="text-foreground dark:text-white font-medium mb-1">Industry Leadership</p>
                <p className="text-sm text-muted-foreground dark:text-muted font-light">
                  Recognized as a leading automotive parts supplier in Zimbabwe.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 bg-secondary dark:bg-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground dark:text-white">
              Our Core <span className="font-semibold">Values</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card dark:glass-card rounded-xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-6">
                  <value.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-medium text-foreground dark:text-white mb-3">{value.title}</h3>
                <p className="text-muted-foreground dark:text-muted font-light leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-32 px-6 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="/new/engine1.jpeg"
                  alt="Quality Assurance"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Quality Assurance</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground dark:text-white mb-6">
                Uncompromising
                <br />
                <span className="font-semibold">Quality</span>
              </h2>
              <p className="text-muted-foreground dark:text-muted font-light leading-relaxed mb-8 text-lg">
                Every part that leaves our facility undergoes rigorous testing and quality control. We partner only with
                trusted manufacturers who share our commitment to excellence.
              </p>

              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-foreground dark:text-white font-light">{cert}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-32 px-6 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Our Team</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-6">
              Meet The <span className="font-semibold">Experts</span>
            </h2>
            <p className="text-muted font-light max-w-2xl mx-auto">
              Our team of certified automotive professionals brings decades of combined experience to ensure you get the
              best advice and products for your vehicle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "James Moyo", role: "Founder & CEO", image: "/team-member-1.jpg" },
              { name: "Sarah Ndlovu", role: "Head of Operations", image: "/team-member-2.jpg" },
              { name: "David Zimba", role: "Technical Director", image: "/team-member-3.jpg" },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-80 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <h3 className="text-xl font-medium text-white mb-1">{member.name}</h3>
                <p className="text-muted font-light">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      <Footer />
    </main>
  )
}
