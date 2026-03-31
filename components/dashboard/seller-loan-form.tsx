"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Loader2,
  Banknote,
  Building2,
  FileText,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  listSellerLoanPartners,
  submitSellerLoanApplication,
  type SellerLoanFieldDefinition,
  type SellerLoanPartner,
} from "@/lib/api/seller-loans"
import { toast } from "sonner"

interface SellerLoanFormProps {
  onApplicationCreated?: () => void
}

function defaultAmountBounds(p: SellerLoanPartner | null) {
  const min = p?.minAmount != null ? Number(p.minAmount) : 250
  const max = p?.maxAmount != null ? Number(p.maxAmount) : 750_000
  return { min, max }
}

export function SellerLoanForm({ onApplicationCreated }: SellerLoanFormProps) {
  const [partners, setPartners] = useState<SellerLoanPartner[]>([])
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [partnerId, setPartnerId] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [collateral, setCollateral] = useState("")
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingPartners(true)
      try {
        const res = await listSellerLoanPartners()
        if (cancelled) return
        const list = Array.isArray(res.data) ? res.data : []
        const active = list.filter((p) => p.isActive !== false)
        setPartners(active)
        if (active.length && !partnerId) {
          setPartnerId(active[0].id)
        }
      } catch (e: unknown) {
        const err = e as { message?: string }
        toast.error(err.message || "Could not load partners")
        setPartners([])
      } finally {
        if (!cancelled) setLoadingPartners(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selected = useMemo(
    () => partners.find((p) => p.id === partnerId) ?? null,
    [partners, partnerId]
  )

  const { min, max } = defaultAmountBounds(selected)
  const defs: SellerLoanFieldDefinition[] = selected?.fieldDefinitionsJson ?? []

  useEffect(() => {
    setCustomValues({})
  }, [partnerId])

  const handleCustomChange = (key: string, value: string) => {
    setCustomValues((prev) => ({ ...prev, [key]: value }))
  }

  const validateCustomFields = (): boolean => {
    for (const d of defs) {
      if (d.required && !String(customValues[d.key] ?? "").trim()) {
        toast.error(`Please fill in: ${d.label || d.key}`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId) {
      toast.error("Choose a partner")
      return
    }
    const n = parseFloat(amount.replace(/,/g, ""))
    if (Number.isNaN(n) || n < min || n > max) {
      toast.error(`Amount must be between ${min.toLocaleString()} and ${max.toLocaleString()}`)
      return
    }
    if (!purpose.trim()) {
      toast.error("Describe the purpose of the loan")
      return
    }
    if (!validateCustomFields()) return

    const customFields: Record<string, string | number | boolean> = {}
    for (const d of defs) {
      const raw = customValues[d.key]?.trim() ?? ""
      if (!raw) continue
      const t = (d.type || "text").toLowerCase()
      if (t === "number" || t === "integer") {
        const num = parseFloat(raw)
        if (!Number.isNaN(num)) customFields[d.key] = num
        else customFields[d.key] = raw
      } else if (t === "boolean" || t === "checkbox") {
        customFields[d.key] = raw === "true" || raw === "1" || raw.toLowerCase() === "yes"
      } else {
        customFields[d.key] = raw
      }
    }

    setSubmitting(true)
    try {
      const res = await submitSellerLoanApplication({
        partnerId,
        requestedAmount: n,
        purpose: purpose.trim(),
        collateralDescription: collateral.trim() || undefined,
        customFields:
          Object.keys(customFields).length > 0 ? customFields : undefined,
      })
      if (!res.success) {
        throw new Error(res.message || "Submit failed")
      }
      toast.success("Application submitted")
      setAmount("")
      setPurpose("")
      setCollateral("")
      setCustomValues({})
      onApplicationCreated?.()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message || "Could not submit application")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPartners) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading partners…
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">No active partners</p>
          <p className="text-sm mt-1 max-w-md mx-auto">
            Financing partners will appear here when your marketplace enables them.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card className="glass-card border-border/80 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 font-medium">
            <Banknote className="h-5 w-5 text-accent" />
            New application
          </CardTitle>
          <p className="text-sm text-muted-foreground font-light">
            We attach a verified snapshot (revenue, inventory, store health, orders) automatically — you only choose a partner, amount, and purpose.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Partner</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected?.feesAndTermsSummary && (
              <p className="text-xs text-muted-foreground whitespace-pre-wrap border rounded-lg p-3 bg-muted/30">
                {selected.feesAndTermsSummary}
              </p>
            )}
            {selected?.description && (
              <p className="text-sm text-muted-foreground">{selected.description}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="loan-amount">Requested amount</Label>
              <Input
                id="loan-amount"
                type="text"
                inputMode="decimal"
                placeholder={`${min.toLocaleString()} – ${max.toLocaleString()}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Partner limits: {min.toLocaleString()} – {max.toLocaleString()}
              </p>
            </div>
            {selected?.termMonths != null && (
              <div className="grid gap-2">
                <Label>Typical term</Label>
                <div className="h-10 flex items-center text-sm text-muted-foreground">
                  {selected.termMonths} months
                  {selected.interestRate != null && (
                    <span className="ml-2">
                      · from {Number(selected.interestRate).toFixed(2)}% APR (indicative)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="loan-purpose" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Purpose
            </Label>
            <Textarea
              id="loan-purpose"
              rows={3}
              placeholder="e.g. Filters, oil pumps, and brake inventory"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="loan-collateral" className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Collateral (optional)
            </Label>
            <Textarea
              id="loan-collateral"
              rows={2}
              placeholder="Describe collateral if applicable"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
            />
          </div>

          {defs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-medium">Partner requirements</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {defs.map((d) => (
                    <div key={d.key} className="grid gap-1.5">
                      <Label htmlFor={`cf-${d.key}`}>
                        {d.label || d.key}
                        {d.required ? " *" : ""}
                      </Label>
                      {(d.type || "").toLowerCase() === "textarea" ? (
                        <Textarea
                          id={`cf-${d.key}`}
                          rows={2}
                          value={customValues[d.key] ?? ""}
                          onChange={(e) => handleCustomChange(d.key, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={`cf-${d.key}`}
                          type={
                            (d.type || "").toLowerCase() === "number" ||
                            (d.type || "").toLowerCase() === "integer"
                              ? "number"
                              : (d.type || "").toLowerCase() === "email"
                                ? "email"
                                : "text"
                          }
                          value={customValues[d.key] ?? ""}
                          onChange={(e) => handleCustomChange(d.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.form>
  )
}
