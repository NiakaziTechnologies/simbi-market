"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Calendar, Clock, ArrowRight, User, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"

interface Blog {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  date: string
  readTime: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'simbi_blogs'

const defaultBlogs: Blog[] = [
  {
    id: "1",
    title: "The Ultimate Guide to Performance Brake Upgrades",
    excerpt: "Discover everything you need to know about upgrading your vehicle's braking system. From ceramic pads to big brake kits, we cover all the options.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=800&fit=crop&q=80",
    category: "Performance",
    author: "James Moyo",
    date: "Dec 15, 2025",
    readTime: "8 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-12-15T10:00:00Z",
    updatedAt: "2025-12-15T10:00:00Z",
  },
  {
    id: "2",
    title: "How to Choose the Right Suspension Setup for Your Driving Style",
    excerpt: "Whether you're after comfort, performance, or off-road capability, we break down the best suspension options for every need.",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&q=80",
    category: "Guides",
    author: "Sarah Ndlovu",
    date: "Dec 10, 2025",
    readTime: "6 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-12-10T10:00:00Z",
    updatedAt: "2025-12-10T10:00:00Z",
  },
  {
    id: "3",
    title: "Top 10 Must-Have Accessories for Range Rover Owners",
    excerpt: "Elevate your Range Rover experience with these essential accessories that combine luxury with functionality.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop&q=80",
    category: "Accessories",
    author: "David Zimba",
    date: "Dec 5, 2025",
    readTime: "5 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-12-05T10:00:00Z",
    updatedAt: "2025-12-05T10:00:00Z",
  },
  {
    id: "4",
    title: "Understanding Turbocharger Technology: A Complete Overview",
    excerpt: "From single turbos to twin-scroll setups, learn how forced induction can transform your vehicle's performance.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80",
    category: "Tech",
    author: "James Moyo",
    date: "Nov 28, 2025",
    readTime: "10 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-11-28T10:00:00Z",
    updatedAt: "2025-11-28T10:00:00Z",
  },
  {
    id: "5",
    title: "DIY: Installing a Cold Air Intake System",
    excerpt: "Step-by-step instructions for installing a cold air intake and improving your engine's breathing and performance.",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop&q=80",
    category: "DIY",
    author: "Sarah Ndlovu",
    date: "Nov 20, 2025",
    readTime: "7 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-11-20T10:00:00Z",
    updatedAt: "2025-11-20T10:00:00Z",
  },
  {
    id: "6",
    title: "Electric Vehicle Parts: What You Need to Know",
    excerpt: "As EVs become more popular, understanding their unique parts and maintenance requirements is essential.",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop&q=80",
    category: "Electric",
    author: "David Zimba",
    date: "Nov 15, 2025",
    readTime: "6 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "7",
    title: "Maintaining Your Vehicle's Exhaust System",
    excerpt: "Learn the signs of exhaust problems and how to keep your exhaust system performing at its best.",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop&q=80",
    category: "Maintenance",
    author: "James Moyo",
    date: "Nov 10, 2025",
    readTime: "5 min read",
    isPublished: true,
    content: "Full article content here...",
    createdAt: "2025-11-10T10:00:00Z",
    updatedAt: "2025-11-10T10:00:00Z",
  },
]

function loadBlogs(): Blog[] {
  if (typeof window === 'undefined') return defaultBlogs
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultBlogs
    }
  }
  return defaultBlogs
}

export default function BlogPage() {
  const router = useRouter()
  const { user, role } = useAuth()
  const isAdmin = role === 'admin'
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load blogs from localStorage
    setBlogs(loadBlogs())
    
    // Listen for updates from admin page
    const handleUpdate = () => {
      setBlogs(loadBlogs())
    }
    window.addEventListener('blogs-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('blogs-updated', handleUpdate)
    }
  }, [])

  // Get only published blogs
  const publishedBlogs = blogs.filter(b => b.isPublished)
  
  // Get featured post (first published blog)
  const featuredPost = publishedBlogs.length > 0 ? publishedBlogs[0] : null
  
  // Get other posts (excluding featured)
  const blogPosts = publishedBlogs.length > 1 ? publishedBlogs.slice(1) : []
  
  // Filter by category
  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(p => p.category === selectedCategory)
  
  // Get unique categories
  const categories = ["All", ...new Set(publishedBlogs.map(p => p.category))]

  const showAdminButton = isAdmin || !user

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Admin Widget */}
      {showAdminButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => router.push('/dashboard/admin/blogs')}
              className="flex items-center gap-2 shadow-lg bg-accent hover:bg-accent/90 text-white px-4 py-3 rounded-full"
            >
              <Settings className="h-4 w-4" />
              <span>Blog Admin</span>
            </Button>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">Our Blog</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground dark:text-white mb-6">
              Automotive <span className="font-semibold">Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground dark:text-muted font-light max-w-2xl mx-auto">
              Expert guides, industry news, and tips to help you get the most out of your vehicle.
            </p>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category ? "bg-accent text-white" : "bg-secondary dark:bg-white/5 text-foreground dark:text-white/70 hover:bg-accent/10 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-6 pb-16 bg-background dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Link href={`/blog/${featuredPost.id}`}>
                <div className="group relative overflow-hidden rounded-2xl">
                  <div className="relative h-[500px]">
                    {featuredPost.image?.startsWith("blob:") ? (
                      <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" />
                    ) : (
                      <Image
                        src={featuredPost.image || "/placeholder.svg"}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-medium rounded-full mb-4">
                      {featuredPost.category}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-light text-white mb-4 group-hover:text-accent transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-white/70 font-light mb-6 max-w-2xl">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-6 text-sm text-white/50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {featuredPost.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      {filteredPosts.length > 0 ? (
        <section className="px-6 pb-32 bg-background dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.id}`}>
                    <article className="group">
                      <div className="relative h-56 rounded-xl overflow-hidden mb-4">
                        {post.image?.startsWith("blob:") ? (
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-medium text-foreground dark:text-white mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground dark:text-muted font-light mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-muted">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 pb-32 bg-background dark:bg-black">
          <div className="max-w-7xl mx-auto text-center py-16">
            <p className="text-muted-foreground">No blog posts found in this category.</p>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

