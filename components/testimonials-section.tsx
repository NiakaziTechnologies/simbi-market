"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Mike Rukudzo",
    role: "Auto Mechanic",
    rating: 5,
    text: "Simbi Market has been my go-to supplier for a year. The quality is consistently excellent and delivery is always on time. Highly recommended!",
  },
  {
    name: "Sarah Sibanda",
    role: "Car Enthusiast",
    rating: 5,
    text: "Amazing selection and expert support. The customer support team helped me find exactly what I needed for my project car. Outstanding service!",
  },
  {
    name: "David Moyo",
    role: "Performance Shop Owner",
    rating: 5,
    text: "Professional grade parts at great prices. Simbi Market understands what performance enthusiasts need. They've never let me down!",
  },
]

function getInitials(name: string) {
  const parts = name.split(" ")
  return parts.map((part) => part[0]).join("")
}

export function TestimonialsSection() {
  return (
    <section className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-foreground dark:text-white">
            What Our <span className="font-semibold">Customers Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass-card dark:glass-card rounded-xl p-8 relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-muted-foreground/20" />

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>

              <p className="text-muted-foreground font-light leading-relaxed mb-8">"{testimonial.text}"</p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{getInitials(testimonial.name)}</span>
                </div>
                <div>
                  <p className="text-foreground dark:text-white font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground dark:text-muted">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
