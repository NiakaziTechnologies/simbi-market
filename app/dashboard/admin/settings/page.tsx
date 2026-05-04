"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialPartnersTab } from "@/components/dashboard/admin/financial-partners-tab"
import { LoanApplicationsTab } from "@/components/dashboard/admin/loan-applications-tab"
import {
  getCommercePricing,
  updateCommercePricing,
  normalizeCommercePricing,
  type CommercePricingData,
  type CommerceShippingEngineSetting,
  type ShippingMode,
} from "@/lib/api/admin-commerce-pricing"

function parseNumber(value: string): number | null {
  const n = parseFloat(value.replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function applySnapshotToForm(
  d: CommercePricingData,
  setters: {
    setShippingMode: (m: ShippingMode) => void
    setShipping: (s: string) => void
    setDynamicPrice: (s: string) => void
    setDynamicKm: (s: string) => void
    setCommission: (s: string) => void
    setShippingEngine: (e: CommerceShippingEngineSetting) => void
  }
) {
  setters.setShippingMode(d.shippingMode)
  setters.setShipping(String(d.shippingFlatRate))
  setters.setDynamicPrice(String(d.shippingDynamicPrice))
  setters.setDynamicKm(String(d.shippingDynamicDistanceKm))
  setters.setCommission(String(d.commissionPercent))
  setters.setShippingEngine(d.shippingEngine)
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("commerce")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snapshot, setSnapshot] = useState<CommercePricingData | null>(null)
  const [shippingMode, setShippingMode] = useState<ShippingMode>("fixed")
  const [shipping, setShipping] = useState("")
  const [dynamicPrice, setDynamicPrice] = useState("")
  const [dynamicKm, setDynamicKm] = useState("")
  const [commission, setCommission] = useState("")
  const [shippingEngine, setShippingEngine] = useState<CommerceShippingEngineSetting>("legacy")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCommercePricing()
      if (!res.success || !res.data) {
        throw new Error("Invalid response from server")
      }
      const d = normalizeCommercePricing(res.data)
      setSnapshot(d)
      applySnapshotToForm(d, {
        setShippingMode,
        setShipping,
        setDynamicPrice,
        setDynamicKm,
        setCommission,
        setShippingEngine,
      })
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: "Could not load settings",
        description: err.message || "Failed to load commerce pricing settings",
        variant: "destructive",
      })
      setSnapshot(null)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    if (!snapshot) return

    const ship = parseNumber(shipping)
    const comm = parseNumber(commission)

    if (ship === null || ship < 0) {
      toast({
        title: "Invalid flat shipping",
        description: "Must be a number ≥ 0 (used for fixed mode and as distance fallback).",
        variant: "destructive",
      })
      return
    }
    if (comm === null || comm < 0 || comm > 100) {
      toast({
        title: "Invalid commission",
        description: "Platform commission must be between 0 and 100.",
        variant: "destructive",
      })
      return
    }

    const dynP = parseNumber(dynamicPrice)
    const dynK = parseNumber(dynamicKm)

    if (shippingMode === "distance") {
      if (dynP === null || dynP < 0) {
        toast({
          title: "Invalid distance pricing",
          description: "Price per distance block must be a number ≥ 0.",
          variant: "destructive",
        })
        return
      }
      if (dynK === null || dynK <= 0) {
        toast({
          title: "Invalid block size",
          description: "Kilometers per block must be greater than 0 when using distance-based shipping.",
          variant: "destructive",
        })
        return
      }
    } else {
      if (dynP !== null && dynP < 0) {
        toast({
          title: "Invalid distance pricing",
          description: "Price per block must be ≥ 0.",
          variant: "destructive",
        })
        return
      }
      if (dynK !== null && dynK <= 0) {
        toast({
          title: "Invalid block size",
          description: "Kilometers per block must be greater than 0 if you set a value.",
          variant: "destructive",
        })
        return
      }
    }

    const payload: Partial<CommercePricingData> = {}
    if (shippingMode !== snapshot.shippingMode) payload.shippingMode = shippingMode
    if (ship !== snapshot.shippingFlatRate) payload.shippingFlatRate = ship
    if (comm !== snapshot.commissionPercent) payload.commissionPercent = comm

    if (dynP !== null && dynP !== snapshot.shippingDynamicPrice) {
      payload.shippingDynamicPrice = dynP
    }
    if (dynK !== null && dynK !== snapshot.shippingDynamicDistanceKm) {
      payload.shippingDynamicDistanceKm = dynK
    }

    if (shippingEngine !== snapshot.shippingEngine) {
      payload.shippingEngine = shippingEngine
    }

    if (payload.shippingMode === "distance" && snapshot.shippingMode === "fixed") {
      payload.shippingDynamicPrice = dynP!
      payload.shippingDynamicDistanceKm = dynK!
    }

    if (Object.keys(payload).length === 0) {
      toast({ title: "No changes to save" })
      return
    }

    setSaving(true)
    try {
      const res = await updateCommercePricing(payload)
      if (res.success && res.data) {
        const next = normalizeCommercePricing(res.data)
        setSnapshot(next)
        applySnapshotToForm(next, {
          setShippingMode,
          setShipping,
          setDynamicPrice,
          setDynamicKm,
          setCommission,
          setShippingEngine,
        })
        toast({
          title: "Saved",
          description: res.message || "Commerce pricing updated successfully",
        })
      } else {
        toast({
          title: "Update failed",
          description: "The server did not confirm success.",
          variant: "destructive",
        })
      }
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number; data?: { message?: string; error?: string } }
      const msg =
        err.data?.message ||
        err.data?.error ||
        err.message ||
        "Failed to save settings"
      if (err.status === 403) {
        toast({
          title: "Permission denied",
          description: "You need super admin access to change these settings.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Save failed",
          description: msg,
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-light text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground font-light">
          Commerce pricing, financial partners, and loan applications (admin API required).
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-1 sm:grid-cols-3 bg-background/50 border border-border">
          <TabsTrigger
            value="commerce"
            className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "commerce" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Commerce pricing
          </TabsTrigger>
          <TabsTrigger
            value="partners"
            className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "partners" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Financial partners
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "loans" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Loan applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commerce" className="mt-0">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-light">Commerce pricing</CardTitle>
          <CardDescription>
            Choose fixed or distance-based shipping per seller order, flat fallback, and platform
            commission. Values apply to new checkouts and buyer-facing prices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : snapshot ? (
            <>
              <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/10">
                <Label className="text-base">Shipping engine</Label>
                <RadioGroup
                  value={shippingEngine}
                  onValueChange={(v) => setShippingEngine(v as CommerceShippingEngineSetting)}
                  className="grid gap-3"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="legacy" id="engine-legacy" />
                    <Label htmlFor="engine-legacy" className="font-normal cursor-pointer leading-snug">
                      Legacy — storefront uses flat/distance settings below (no carrier quote API).
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="carrier_v1" id="engine-carrier" />
                    <Label htmlFor="engine-carrier" className="font-normal cursor-pointer leading-snug">
                      Carrier v1 — checkout calls live quotes; orders store quote snapshots. Configure carriers and
                      regions under{" "}
                      <Link href="/dashboard/admin/logistics" className="text-accent underline">
                        Logistics
                      </Link>
                      .
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Shipping mode</Label>
                <RadioGroup
                  value={shippingMode}
                  onValueChange={(v) => setShippingMode(v as ShippingMode)}
                  className="grid gap-3"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="fixed" id="ship-mode-fixed" />
                    <Label htmlFor="ship-mode-fixed" className="font-normal cursor-pointer">
                      Fixed shipping — flat fee per seller order
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="distance" id="ship-mode-distance" />
                    <Label htmlFor="ship-mode-distance" className="font-normal cursor-pointer">
                      Distance-based — fee from delivery distance (see below)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingFlatRate">Flat shipping (per seller order)</Label>
                <Input
                  id="shippingFlatRate"
                  type="number"
                  min={0}
                  step="0.01"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Used as the shipping amount when mode is fixed. When mode is distance, this is the
                  fallback if the buyer does not send <code className="text-xs">deliveryDistanceKm</code>{" "}
                  or the server cannot compute distance.
                </p>
              </div>

              <div
                className={`space-y-4 rounded-lg border border-border p-4 ${
                  shippingMode === "distance" ? "bg-muted/20" : "bg-muted/5"
                }`}
              >
                <p className="text-sm font-medium text-foreground">Distance-based settings</p>
                <p className="text-sm text-muted-foreground">
                  Used when shipping mode is <strong>distance</strong>. Charge is{" "}
                  <span className="font-mono text-xs">(deliveryKm ÷ block km) × price per block</span>,
                  rounded. Checkout can include optional{" "}
                  <code className="text-xs">deliveryDistanceKm</code>; if omitted, flat shipping above
                  applies.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shippingDynamicPrice">Price per distance block</Label>
                    <Input
                      id="shippingDynamicPrice"
                      type="number"
                      min={0}
                      step="0.01"
                      value={dynamicPrice}
                      onChange={(e) => setDynamicPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingDynamicDistanceKm">Kilometers per block</Label>
                    <Input
                      id="shippingDynamicDistanceKm"
                      type="number"
                      min={0}
                      step="0.1"
                      value={dynamicKm}
                      onChange={(e) => setDynamicKm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionPercent">Platform commission (%)</Label>
                <Input
                  id="commissionPercent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Single rate 0–100 (e.g. 10 = 10%).
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save commerce pricing
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load settings.</p>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="partners" className="mt-0">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">Financial partners</CardTitle>
              <CardDescription>
                Configure lending partners, seller form fields (<code className="text-xs">fieldDefinitionsJson</code>
                ), and HTTP integration. Secrets: use the key button or include on create only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialPartnersTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="mt-0">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light">Loan applications</CardTitle>
              <CardDescription>
                Cross-seller applications for support. Backend:{" "}
                <code className="text-xs">GET /api/admin/financial-partners/loan-applications</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanApplicationsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
