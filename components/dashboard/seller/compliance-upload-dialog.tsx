"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ExternalLink, FileText, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getComplianceHealth,
  uploadKyc,
  uploadTin,
  uploadZimra,
  type ComplianceDocKey,
  type ComplianceHealthDocument,
} from "@/lib/api/seller-compliance-health"

type UploadKey = ComplianceDocKey

function docByKey(docs: ComplianceHealthDocument[], key: ComplianceDocKey) {
  return docs.find((d) => d.key === key) || null
}

function isoFromDateInput(v: string): string | undefined {
  // input[type=date] gives YYYY-MM-DD, convert to ISO midnight
  if (!v) return undefined
  const d = new Date(`${v}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

export function ComplianceUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [docs, setDocs] = useState<ComplianceHealthDocument[]>([])
  const [active, setActive] = useState<UploadKey>("ZIMRA")

  const [file, setFile] = useState<File | null>(null)
  const [issuedDate, setIssuedDate] = useState<string>("")
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  const resetForm = () => {
    setFile(null)
    setIssuedDate("")
    setExpiryDate("")
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getComplianceHealth()
      setDocs(res.documents || [])
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "Could not load compliance data", description: err.message, variant: "destructive" })
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (open) {
      resetForm()
      void load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const current = useMemo(() => docByKey(docs, active), [docs, active])
  const needsExpiry = active === "ZIMRA" || active === "TIN"

  const onUpload = async () => {
    if (!file) {
      toast({ title: "PDF file is required", variant: "destructive" })
      return
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Only PDF files are allowed", variant: "destructive" })
      return
    }
    if (needsExpiry && !expiryDate) {
      toast({ title: "Expiry date is required", variant: "destructive" })
      return
    }

    setUploading(true)
    try {
      const body = {
        file,
        issuedDate: isoFromDateInput(issuedDate),
        expiryDate: isoFromDateInput(expiryDate),
      }
      const res =
        active === "ZIMRA"
          ? await uploadZimra(body)
          : active === "TIN"
            ? await uploadTin(body)
            : await uploadKyc(body)

      if (!res.success) throw new Error(res.message || "Upload failed")
      toast({ title: res.message || "Document uploaded successfully" })
      resetForm()
      await load()
    } catch (e: unknown) {
      const err = e as { message?: string; data?: { message?: string } }
      toast({ title: err.data?.message || err.message || "Upload failed", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[96vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload/Update Documents</DialogTitle>
          <DialogDescription>
            Upload compliance PDFs for ZIMRA, TIN, and KYC. Status updates after review.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : (
          <Tabs value={active} onValueChange={(v) => { setActive(v as UploadKey); resetForm() }}>
            <TabsList className="w-full grid grid-cols-3 bg-background/40 border border-border text-foreground">
              <TabsTrigger
                value="ZIMRA"
                className="text-foreground/90 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:text-foreground"
              >
                ZIMRA
              </TabsTrigger>
              <TabsTrigger
                value="TIN"
                className="text-foreground/90 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:text-foreground"
              >
                TIN
              </TabsTrigger>
              <TabsTrigger
                value="KYC"
                className="text-foreground/90 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:text-foreground"
              >
                KYC
              </TabsTrigger>
            </TabsList>

            {(["ZIMRA", "TIN", "KYC"] as const).map((key) => {
              const d = docByKey(docs, key)
              const reqExpiry = key === "ZIMRA" || key === "TIN"
              return (
                <TabsContent key={key} value={key} className="space-y-4 pt-2">
                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{d?.label || key}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: {d?.documentStatus || "MISSING"}
                          {d?.lastUploadedAt ? ` · Last uploaded ${new Date(d.lastUploadedAt).toLocaleString()}` : ""}
                        </div>
                        {d?.rejectionReason ? (
                          <div className="mt-2 text-xs text-destructive">Rejected: {d.rejectionReason}</div>
                        ) : null}
                      </div>
                      {d?.fileUrl ? (
                        <Button asChild variant="outline" size="sm" className="gap-2">
                          <a href={d.fileUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            View document
                          </a>
                        </Button>
                      ) : (
                        <div className="text-xs text-muted-foreground">No file uploaded yet</div>
                      )}
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                      <div>
                        Issued:{" "}
                        <span className="text-foreground">
                          {d?.issuedDate ? new Date(d.issuedDate).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      <div>
                        Expiry:{" "}
                        <span className="text-foreground">
                          {d?.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "—"}
                        </span>
                        {typeof d?.daysUntilExpiry === "number" ? (
                          <span className="ml-2">({d.daysUntilExpiry} days)</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload new file (PDF)
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label>Issued date (optional)</Label>
                        <Input
                          type="date"
                          value={issuedDate}
                          onChange={(e) => setIssuedDate(e.target.value)}
                          disabled={uploading}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>{reqExpiry ? "Expiry date *" : "Expiry date (optional)"}</Label>
                        <Input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          disabled={uploading}
                        />
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label>PDF file *</Label>
                      <Input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        disabled={uploading}
                      />
                      {file ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => void onUpload()}
                        disabled={uploading || !file || (reqExpiry && !expiryDate) || active !== key}
                        className="gap-2"
                      >
                        {uploading && active === key ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          "Upload / Update"
                        )}
                      </Button>
                      {uploading && active === key ? (
                        <span className="text-xs text-muted-foreground">Please wait…</span>
                      ) : null}
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

