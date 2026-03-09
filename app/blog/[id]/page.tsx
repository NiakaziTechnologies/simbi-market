"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"
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
    excerpt: "Discover everything you need to know about upgrading your vehicle's braking system.",
    content: "Full article content here...",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=800&fit=crop&q=80",
    category: "Performance",
    author: "James Moyo",
    date: "Dec 15, 2025",
    readTime: "8 min read",
    isPublished: true,
    createdAt: "2025-12-15T10:00:00Z",
    updatedAt: "2025-12-15T10:00:00Z",
  },
]

function loadBlogs(): Blog[] {
  if (typeof window === 'undefined') return defaultBlogs
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      // Fall through to default
    }
  }
  return defaultBlogs
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load blog on mount or when params.id changes
    setMounted(true)
    const blogs = loadBlogs()
    const blogId = params.id ? String(params.id) : null
    if (blogId) {
      const foundBlog = blogs.find(b => String(b.id) === blogId && b.isPublished)
      setBlog(foundBlog || null)
    } else {
      setBlog(null)
    }
    setLoading(false)
  }, [params.id])

  if (!mounted) return null

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-96 bg-muted rounded-xl mb-8"></div>
              <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 px-6 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Back Button */}
      <div className="pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Blog Content */}
      <article className="px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8">
            {blog.image?.startsWith("blob:") ? (
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
              <Image
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-accent text-white text-sm font-medium rounded-full">
                {blog.category}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{blog.readTime}</span>
            </div>
          </div>

          {/* Excerpt */}
          <div className="text-xl text-muted-foreground font-light mb-8 italic">
            {blog.excerpt}
          </div>

          {/* Full Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap text-lg leading-relaxed">
              {blog.content}
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}

