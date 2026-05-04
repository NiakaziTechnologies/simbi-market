"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { FileText, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  createCustomProductRequest,
  resubmitCustomProductRequest,
  validateCustomRequestFiles,
  validateCustomRequestText,
  type CustomProductRequestTextBody,
  type CustomProductRequestFiles,
} from "@/lib/api/seller-custom-product-requests"
import { cn } from "@/lib/utils"

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif"
const PDF_ACCEPT = "application/pdf"

const fieldClass =
  "h-9 min-h-9 border-2 border-border bg-muted/50 text-foreground shadow-sm placeholder:text-muted-foreground/80 dark:bg-muted/30 dark:border-zinc-600 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:border-primary/60"

const dropZoneClass = (active: boolean) =>
  cn(
    "group relative flex min-h-[76px] flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed px-2 py-2.5 text-center transition-colors",
    active
      ? "border-primary bg-primary/5"
      : "border-border/90 bg-muted/40 hover:border-primary/50 hover:bg-muted/60 dark:border-zinc-600",
  )

function emptyText(): CustomProductRequestTextBody {
  return {
    productName: "",
    category: "",
    make: "",
    model: "",
    year: null,
    partCode: "",
    description: "",
  }
}

const IMAGE_MIME = new Set(IMAGE_ACCEPT.split(","))

function isImageFile(f: File) {
  return f.type && IMAGE_MIME.has(f.type)
}
function isPdfFile(f: File) {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
}

interface CustomProductRequestFormProps {
  mode: "create" | "resubmit"
  requestId?: string
  initialText?: Partial<CustomProductRequestTextBody>
  onSuccess?: () => void
  className?: string
}

export function CustomProductRequestForm({
  mode,
  requestId,
  initialText,
  onSuccess,
  className,
}: CustomProductRequestFormProps) {
  const { toast } = useToast()
  const [text, setText] = useState<CustomProductRequestTextBody>(() => {
    const e = emptyText()
    if (initialText) {
      return {
        ...e,
        ...initialText,
        year: initialText.year ?? null,
      }
    }
    return e
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [specSheet, setSpecSheet] = useState<File | null>(null)
  const [supplierDocs, setSupplierDocs] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [dragImage, setDragImage] = useState(false)
  const [dragSpec, setDragSpec] = useState(false)
  const [dragSupp, setDragSupp] = useState(false)

  const imagesInputRef = useRef<HTMLInputElement>(null)
  const specInputRef = useRef<HTMLInputElement>(null)
  const suppInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f))
    setImagePreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [images])

  const addImages = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming).filter((f) => isImageFile(f))
      if (list.length < Array.from(incoming).length) {
        toast({ title: "Some files were skipped (images only: JPEG, PNG, WebP, GIF)", variant: "destructive" })
      }
      setImages((prev) => {
        const merged = [...prev, ...list].slice(0, 10)
        return merged
      })
    },
    [toast],
  )

  const removeImageAt = (i: number) => {
    setImages((prev) => prev.filter((_, j) => j !== i))
  }

  const filesPayload = (): CustomProductRequestFiles | null => {
    if (!specSheet) return null
    return {
      images,
      specSheet,
      supplierDocs,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tErr = validateCustomRequestText(text)
    if (tErr) {
      toast({ title: tErr, variant: "destructive" })
      return
    }
    const f = filesPayload()
    if (!f) {
      toast({ title: "OEM spec PDF is required", variant: "destructive" })
      return
    }
    const fErr = validateCustomRequestFiles(f)
    if (fErr) {
      toast({ title: fErr, variant: "destructive" })
      return
    }
    if (mode === "resubmit" && !requestId) {
      toast({ title: "Missing request id", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      if (mode === "create") {
        const res = await createCustomProductRequest(text, f)
        if (!res.success) throw new Error(res.message || "Request failed")
        toast({ title: "Request submitted" })
        onSuccess?.()
        setText(emptyText())
        setImages([])
        setSpecSheet(null)
        setSupplierDocs([])
      } else {
        const res = await resubmitCustomProductRequest(requestId!, text, f)
        if (!res.success) throw new Error(res.message || "Resubmit failed")
        toast({ title: "Resubmitted" })
        onSuccess?.()
        setImages([])
        setSpecSheet(null)
        setSupplierDocs([])
      }
    } catch (err: unknown) {
      const e2 = err as { message?: string }
      toast({
        title: e2.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const stopDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative space-y-3", className)}
    >
      {submitting && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/75 backdrop-blur-sm"
          aria-live="polite"
          aria-busy
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-medium text-foreground">Uploading and submitting…</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-snug">
        At least <strong className="text-foreground/90">3</strong> images,{" "}
        <strong className="text-foreground/90">1</strong> OEM PDF, <strong className="text-foreground/90">1+</strong>{" "}
        supplier PDFs · JPEG, PNG, WebP, GIF.
      </p>

      <div className="space-y-2 rounded-xl border border-border/80 bg-card/50 p-3 shadow-sm">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Product details</h3>
        <div className="grid gap-2">
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-1 sm:col-span-1 lg:col-span-2">
              <Label htmlFor="cpr-name" className="text-xs text-foreground/90">
                Product name *
              </Label>
              <Input
                id="cpr-name"
                className={fieldClass}
                value={text.productName}
                onChange={(e) => setText({ ...text, productName: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="cpr-code" className="text-xs text-foreground/90">
                Part code
              </Label>
              <Input
                id="cpr-code"
                className={fieldClass}
                value={text.partCode ?? ""}
                onChange={(e) => setText({ ...text, partCode: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
            <div className="grid gap-1">
              <Label htmlFor="cpr-cat" className="text-xs text-foreground/90">
                Category *
              </Label>
              <Input
                id="cpr-cat"
                className={fieldClass}
                value={text.category}
                onChange={(e) => setText({ ...text, category: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="cpr-make" className="text-xs text-foreground/90">
                Make *
              </Label>
              <Input
                id="cpr-make"
                className={fieldClass}
                value={text.make}
                onChange={(e) => setText({ ...text, make: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="cpr-model" className="text-xs text-foreground/90">
                Model *
              </Label>
              <Input
                id="cpr-model"
                className={fieldClass}
                value={text.model}
                onChange={(e) => setText({ ...text, model: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="cpr-year" className="text-xs text-foreground/90">
                Year
              </Label>
              <Input
                id="cpr-year"
                type="number"
                className={fieldClass}
                value={text.year ?? ""}
                onChange={(e) =>
                  setText({
                    ...text,
                    year: e.target.value === "" ? null : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="cpr-desc" className="text-xs text-foreground/90">
              Description
            </Label>
            <Textarea
              id="cpr-desc"
              rows={2}
              className={cn(
                fieldClass,
                "h-auto min-h-[60px] py-1.5 text-sm leading-snug resize-y",
              )}
              value={text.description ?? ""}
              onChange={(e) => setText({ ...text, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border/80 bg-card/50 p-3 shadow-sm">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Files</h3>
          <p className="text-[11px] text-muted-foreground">Drag, drop, or click each zone</p>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {/* Product images */}
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground/90">Product images *</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                  images.length >= 3
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                )}
              >
                {images.length} / 10
              </span>
            </div>
            <input
              ref={imagesInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) addImages(e.target.files)
                e.target.value = ""
              }}
            />
            <div
              role="button"
              tabIndex={0}
              className={cn(
                dropZoneClass(dragImage),
                !dragImage && images.length > 0 && images.length < 3
                  ? "border-amber-500/50 bg-amber-500/5"
                  : null,
              )}
              onClick={() => imagesInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  imagesInputRef.current?.click()
                }
              }}
              onDragEnter={(e) => {
                stopDrag(e)
                setDragImage(true)
              }}
              onDragLeave={(e) => {
                stopDrag(e)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragImage(false)
              }}
              onDragOver={stopDrag}
              onDrop={(e) => {
                stopDrag(e)
                setDragImage(false)
                if (e.dataTransfer.files.length) addImages(e.dataTransfer.files)
              }}
            >
              <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
              <p className="text-xs text-foreground/90">Drop or click to add</p>
              <p className="text-[10px] leading-tight text-muted-foreground">3–10 photos</p>
            </div>
            {images.length > 0 && (
              <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                {images.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="group/img relative aspect-square max-h-16 overflow-hidden rounded-md border border-border/80 bg-muted/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob previews */}
                    <img
                      src={imagePreviews[i]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-background/90 text-foreground text-[10px] shadow-sm opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-destructive/90 hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImageAt(i)
                      }}
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="sr-only">{file.name}</span>
                  </li>
                ))}
                {images.length < 10 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => imagesInputRef.current?.click()}
                      className="flex h-full min-h-12 w-full flex-col items-center justify-center gap-0 rounded-md border-2 border-dashed border-border/80 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-[9px]">Add</span>
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* OEM PDF */}
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground/90">OEM spec PDF *</span>
              {specSheet ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Ready
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200">
                  Required
                </span>
              )}
            </div>
            <input
              ref={specInputRef}
              type="file"
              accept={PDF_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f && isPdfFile(f)) setSpecSheet(f)
                else if (f) {
                  toast({ title: "Please choose a PDF file", variant: "destructive" })
                }
                e.target.value = ""
              }}
            />
            <div
              className={dropZoneClass(dragSpec)}
              role="button"
              tabIndex={0}
              onClick={() => specInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  specInputRef.current?.click()
                }
              }}
              onDragEnter={(e) => {
                stopDrag(e)
                setDragSpec(true)
              }}
              onDragLeave={(e) => {
                stopDrag(e)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragSpec(false)
              }}
              onDragOver={stopDrag}
              onDrop={(e) => {
                stopDrag(e)
                setDragSpec(false)
                const f = e.dataTransfer.files[0]
                if (f && isPdfFile(f)) setSpecSheet(f)
                else if (e.dataTransfer.files[0]) {
                  toast({ title: "Please drop a PDF", variant: "destructive" })
                }
              }}
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
              <p className="text-xs text-foreground/90">OEM specification</p>
              {specSheet ? (
                <p className="line-clamp-2 max-w-full text-[10px] leading-tight text-primary" title={specSheet.name}>
                  {specSheet.name}
                </p>
              ) : (
                <p className="text-[10px] leading-tight text-muted-foreground">One PDF</p>
              )}
            </div>
            {specSheet && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-full text-[11px] text-muted-foreground"
                onClick={() => setSpecSheet(null)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove file
              </Button>
            )}
          </div>

          {/* Supplier PDFs */}
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground/90">Supplier PDFs *</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                  supplierDocs.length >= 1
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                )}
              >
                {supplierDocs.length} / 10
              </span>
            </div>
            <input
              ref={suppInputRef}
              type="file"
              accept={PDF_ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => {
                const all = Array.from(e.target.files || [])
                const pdfs = all.filter((f) => isPdfFile(f))
                if (pdfs.length < all.length) {
                  toast({ title: "Only PDFs were kept", variant: "destructive" })
                }
                setSupplierDocs((prev) => [...prev, ...pdfs].slice(0, 10))
                e.target.value = ""
              }}
            />
            <div
              className={dropZoneClass(dragSupp)}
              role="button"
              tabIndex={0}
              onClick={() => suppInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  suppInputRef.current?.click()
                }
              }}
              onDragEnter={(e) => {
                stopDrag(e)
                setDragSupp(true)
              }}
              onDragLeave={(e) => {
                stopDrag(e)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragSupp(false)
              }}
              onDragOver={stopDrag}
              onDrop={(e) => {
                stopDrag(e)
                setDragSupp(false)
                const all = Array.from(e.dataTransfer.files)
                const pdfs = all.filter((f) => isPdfFile(f))
                if (pdfs.length) {
                  setSupplierDocs((prev) => [...prev, ...pdfs].slice(0, 10))
                } else if (all.length) {
                  toast({ title: "Please drop PDF files", variant: "destructive" })
                }
              }}
            >
              <Upload className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
              <p className="text-xs text-foreground/90">Supplier PDFs</p>
              <p className="text-[10px] leading-tight text-muted-foreground">1–10 files</p>
            </div>
            {supplierDocs.length > 0 && (
              <ul className="max-h-20 space-y-0.5 overflow-y-auto rounded-md border border-border/60 bg-muted/30 p-1.5 text-[11px]">
                {supplierDocs.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-muted/80"
                  >
                    <span className="min-w-0 flex-1 truncate text-foreground/90" title={f.name}>
                      {f.name}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      onClick={() => setSupplierDocs((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={`Remove ${f.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <Button
          type="submit"
          size="default"
          disabled={submitting}
          className="min-w-[9rem] font-medium"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
              Submitting…
            </>
          ) : mode === "create" ? (
            "Submit request"
          ) : (
            "Resubmit"
          )}
        </Button>
        {submitting && <span className="text-sm text-muted-foreground">Do not close this window.</span>}
      </div>
    </form>
  )
}
