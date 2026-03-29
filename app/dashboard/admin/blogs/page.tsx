"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, FileText, Calendar, User, Clock, Image as ImageIcon, X, ExternalLink } from "lucide-react"
import Image from "next/image"

export interface Blog {
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

const initialBlogs: Blog[] = [
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
  {
    id: "2",
    title: "How to Choose the Right Suspension Setup",
    excerpt: "Whether you're after comfort, performance, or off-road capability.",
    content: "Full article content here...",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&q=80",
    category: "Guides",
    author: "Sarah Ndlovu",
    date: "Dec 10, 2025",
    readTime: "6 min read",
    isPublished: true,
    createdAt: "2025-12-10T10:00:00Z",
    updatedAt: "2025-12-10T10:00:00Z",
  },
  {
    id: "3",
    title: "Top 10 Must-Have Accessories for Range Rover Owners",
    excerpt: "Elevate your Range Rover experience with these essential accessories.",
    content: "Full article content here...",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop&q=80",
    category: "Accessories",
    author: "David Zimba",
    date: "Dec 5, 2025",
    readTime: "5 min read",
    isPublished: true,
    createdAt: "2025-12-05T10:00:00Z",
    updatedAt: "2025-12-05T10:00:00Z",
  },
  {
    id: "4",
    title: "Understanding Turbocharger Technology",
    excerpt: "From single turbos to twin-scroll setups, learn how forced induction works.",
    content: "Full article content here...",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80",
    category: "Tech",
    author: "James Moyo",
    date: "Nov 28, 2025",
    readTime: "10 min read",
    isPublished: false,
    createdAt: "2025-11-28T10:00:00Z",
    updatedAt: "2025-11-28T10:00:00Z",
  },
]

function loadBlogs(): Blog[] {
  if (typeof window === 'undefined') return initialBlogs
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    } catch {}
  }
  return initialBlogs
}

function saveBlogs(blogs: Blog[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs))
  window.dispatchEvent(new Event('blogs-updated'))
}

const categories = ["Performance", "Guides", "Accessories", "Tech", "DIY", "Electric", "Maintenance"]

function BlogDialog({ open, onOpenChange, blog, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; blog: Blog | null; onSave: (blog: Blog) => void }) {
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: "", excerpt: "", content: "", image: "", category: "Performance", author: "Admin", readTime: "5 min read", isPublished: true,
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageError, setImageError] = useState<string>("")

  useEffect(() => {
    if (open) {
      if (blog) {
        setFormData({ title: blog.title, excerpt: blog.excerpt, content: blog.content, image: blog.image, category: blog.category, author: blog.author, readTime: blog.readTime, isPublished: blog.isPublished })
        setImagePreview(blog.image)
      } else {
        setFormData({ title: "", excerpt: "", content: "", image: "", category: "Performance", author: "Admin", readTime: "5 min read", isPublished: true })
        setImagePreview("")
      }
      setImageError("")
    }
  }, [open, blog])

  // Convert file to base64
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image too large. Please use images under 2MB or use an image URL instead.")
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setFormData({ ...formData, image: base64 })
        setImageError("")
      }
      reader.onerror = () => {
        setImageError("Failed to read image. Please try using an image URL.")
      }
      reader.readAsDataURL(file)
    } catch {
      setImageError("Failed to process image. Please use an image URL.")
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, image: url })
    setImagePreview(url)
    setImageError("")
  }

  const clearImage = () => {
    setImagePreview("")
    setFormData({ ...formData, image: "" })
    setImageError("")
  }

  const handleSubmit = () => {
    const now = new Date().toISOString()
    const newBlog: Blog = {
      id: blog?.id || Date.now().toString(),
      title: formData.title || "",
      excerpt: formData.excerpt || "",
      content: formData.content || "",
      image: formData.image || "",
      category: formData.category || "Performance",
      author: formData.author || "Admin",
      date: blog?.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: formData.readTime || "5 min read",
      isPublished: formData.isPublished ?? true,
      createdAt: blog?.createdAt || now,
      updatedAt: now,
    }
    onSave(newBlog)
    onOpenChange(false)
  }

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{blog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
          <DialogDescription>{blog ? "Update the blog post details below." : "Fill in the details to create a new blog post."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Enter blog title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea id="excerpt" placeholder="Enter a brief excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" placeholder="Enter the full blog content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} />
          </div>
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-muted/50">
                  <ImageIcon className="h-4 w-4" /><span className="text-sm">Upload</span>
                </div>
              </label>
              <Input 
                placeholder="Or enter image URL" 
                value={formData.image && !imagePreview.startsWith('data:') ? formData.image : ""} 
                onChange={(e) => handleUrlChange(e.target.value)} 
                className="flex-1" 
              />
            </div>
            {imageError && <p className="text-sm text-red-500">{imageError}</p>}
            {imagePreview && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted mt-2">
                {imagePreview.startsWith('data:') || isValidUrl(imagePreview) ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" onError={() => setImageError("Failed to load image. Please check the URL.")} />
                ) : (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                )}
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" placeholder="Author name" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="readTime">Read Time</Label>
              <Input id="readTime" placeholder="e.g., 5 min read" value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 h-10">
                <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="isPublished" className="text-sm font-normal">Published</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.excerpt}>{blog ? "Update" : "Create"} Blog Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({ open, onOpenChange, onConfirm, blogTitle }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; blogTitle: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Delete Blog Post</DialogTitle><DialogDescription>Are you sure you want to delete "{blogTitle}"? This action cannot be undone.</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PreviewDialog({ open, onOpenChange, blog }: { open: boolean; onOpenChange: (open: boolean) => void; blog: Blog | null }) {
  if (!blog) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-xl">Preview: {blog.title}</DialogTitle><DialogDescription>This is how your blog post will appear to visitors</DialogDescription></DialogHeader>
        <div className="space-y-6 py-4">
          <div className="relative h-64 w-full rounded-xl overflow-hidden">
            {blog.image ? (
              <img src={blog.image} alt={blog.title} className="w-full h-full object-contain" />
            ) : (
              <Image src="/placeholder.svg" alt={blog.title} fill className="object-cover" />
            )}
            <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">{blog.category}</span></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-foreground">{blog.title}</h2>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><User className="h-4 w-4" />{blog.author}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{blog.date}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{blog.readTime}</div>
          </div>
          <p className="text-lg text-muted-foreground font-light">{blog.excerpt}</p>
          <div className="prose dark:prose-invert max-w-none"><p className="text-foreground whitespace-pre-wrap">{blog.content}</p></div>
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant="outline" className={blog.isPublished ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}>{blog.isPublished ? "Published" : "Draft"}</Badge>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Close Preview</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(loadBlogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  useEffect(() => {
    saveBlogs(blogs)
  }, [blogs])

  const filteredBlogs = blogs.filter((blog) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return blog.title?.toLowerCase().includes(query) || blog.category?.toLowerCase().includes(query) || blog.author?.toLowerCase().includes(query)
  })

  const handleCreateBlog = useCallback((newBlog: Blog) => { setBlogs((prev) => [newBlog, ...prev]) }, [])
  const handleUpdateBlog = useCallback((updatedBlog: Blog) => { setBlogs((prev) => prev.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))) }, [])
  const handleDeleteBlog = useCallback(() => { if (selectedBlog) { setBlogs((prev) => prev.filter((blog) => blog.id !== selectedBlog.id)); setSelectedBlog(null) } }, [selectedBlog])
  const togglePublishStatus = useCallback((blog: Blog) => { const updatedBlog = { ...blog, isPublished: !blog.isPublished, updatedAt: new Date().toISOString() }; setBlogs((prev) => prev.map((b) => (b.id === blog.id ? updatedBlog : b))) }, [])
  const formatDate = (dateString: string) => { try { return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } catch { return dateString } }

  const isValidUrl = (str: string) => {
    try { new URL(str); return true } catch { return false }
  }

  const totalBlogs = blogs.length
  const publishedBlogs = blogs.filter((b) => b.isPublished).length
  const draftBlogs = totalBlogs - publishedBlogs

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-light text-foreground mb-2">Blog Management</h1>
        <p className="text-muted-foreground font-light">Create, edit and manage blog posts on your platform</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalBlogs}</div></CardContent></Card>
        <Card className="border-border"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{publishedBlogs}</div></CardContent></Card>
        <Card className="border-border"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-500">{draftBlogs}</div></CardContent></Card>
      </div>
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-light flex items-center gap-2"><FileText className="h-5 w-5" />Blog Posts</CardTitle>
              <CardDescription>{totalBlogs > 0 ? `${totalBlogs} total blog posts` : "No blog posts yet"}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search posts..." className="pl-9 bg-muted/50 border-border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button onClick={() => { setSelectedBlog(null); setIsCreateDialogOpen(true); }} className="whitespace-nowrap"><Plus className="h-4 w-4 mr-2" />Create Post</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">{searchQuery ? "No blog posts found matching your search" : "No blog posts yet. Create your first post!"}</p>
              {!searchQuery && <Button onClick={() => { setSelectedBlog(null); setIsCreateDialogOpen(true); }} className="mt-4"><Plus className="h-4 w-4 mr-2" />Create Post</Button>}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/30">
                  <div className="flex gap-3">
                    <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {blog.image ? (
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <Image src="/placeholder.svg" alt={blog.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm sm:text-base mb-1 line-clamp-2">{blog.title}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${blog.isPublished ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>{blog.isPublished ? "Pub" : "Draft"}</Badge>
                        <Badge variant="outline" className="bg-muted/50 text-[10px] px-1.5 py-0">{blog.category}</Badge>
                        <span>{blog.author}</span>
                        <span className="hidden sm:inline">{formatDate(blog.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-0.5 mt-2 pt-2 border-t border-border/50 sm:border-0 sm:mt-0 sm:pt-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedBlog(blog); setIsPreviewDialogOpen(true); }} title="Preview"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => togglePublishStatus(blog)} title={blog.isPublished ? "Unpublish" : "Publish"}>{blog.isPublished ? <EyeOff className="h-3.5 w-3.5 text-amber-500" /> : <Eye className="h-3.5 w-3.5 text-green-500" />}</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedBlog(blog); setIsEditDialogOpen(true); }} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => { setSelectedBlog(blog); setIsDeleteDialogOpen(true); }} title="Delete"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <BlogDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} blog={null} onSave={handleCreateBlog} />
      <BlogDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} blog={selectedBlog} onSave={handleUpdateBlog} />
      <DeleteConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={handleDeleteBlog} blogTitle={selectedBlog?.title || ""} />
      <PreviewDialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen} blog={selectedBlog} />
    </div>
  )
}

