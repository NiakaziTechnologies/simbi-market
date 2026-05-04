"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw, Copy, Trash2, Pencil, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { canEditLogisticsSettings } from "@/lib/auth/admin-rbac"
import { API_CONFIG, DEFAULT_PRODUCTION_API_URL } from "@/lib/config"
import {
  listLogisticsCarriers,
  createLogisticsCarrier,
  updateLogisticsCarrier,
  deleteLogisticsCarrier,
  listLogisticsRegions,
  createLogisticsRegion,
  updateLogisticsRegion,
  deleteLogisticsRegion,
  listShippingMatrix,
  upsertShippingMatrixRow,
  listLogisticsShipments,
  getLogisticsCarrier,
  getLogisticsShipment,
  pollLogisticsShipments,
  coerceLogisticsCarrier,
  coerceLogisticsRegion,
  coerceLogisticsShipment,
  type LogisticsCarrier,
  type LogisticsRegion,
  type ShippingMatrixRow,
  type LogisticsShipment,
} from "@/lib/api/admin-logistics"
import type { OrderShippingTrackingEvent } from "@/lib/api/orders"
import { ShippingTrackingTimeline } from "@/components/orders/shipping-tracking-timeline"
import { JsonSchemaJsonField } from "@/components/dashboard/admin/json-schema-example"
import {
  LOGISTICS_CARRIER_INTEGRATION_CONFIG_EXAMPLE,
  LOGISTICS_CARRIER_SECRETS_EXAMPLE,
  LOGISTICS_CARRIER_SERVICE_LEVELS_EXAMPLE,
  LOGISTICS_CARRIER_SLA_CONFIG_EXAMPLE,
} from "@/lib/admin/logistics-carrier-json-examples"

function parseJsonField(label: string, raw: string): Record<string, unknown> | undefined {
  const t = raw.trim()
  if (!t) return undefined
  try {
    const v = JSON.parse(t) as unknown
    if (v != null && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>
    throw new Error(`${label} must be a JSON object`)
  } catch (e) {
    throw new Error(`${label}: ${(e as Error).message}`)
  }
}

function parseJsonArrayField(label: string, raw: string): unknown[] {
  const t = raw.trim()
  if (!t) return []
  try {
    const v = JSON.parse(t) as unknown
    if (!Array.isArray(v)) throw new Error(`${label} must be a JSON array`)
    return v
  } catch (e) {
    throw new Error(`${label}: ${(e as Error).message}`)
  }
}

function TableLoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2 py-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function LogisticsConsole() {
  const { toast } = useToast()
  const { user } = useAuth()
  const canMutate = canEditLogisticsSettings(user?.adminRole)
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, "")

  const [tab, setTab] = useState("carriers")
  const [carriers, setCarriers] = useState<LogisticsCarrier[]>([])
  const [regions, setRegions] = useState<LogisticsRegion[]>([])
  const [matrix, setMatrix] = useState<ShippingMatrixRow[]>([])
  const [shipments, setShipments] = useState<LogisticsShipment[]>([])
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [carrierSaving, setCarrierSaving] = useState(false)
  const [regionSaving, setRegionSaving] = useState(false)
  const [matrixSaving, setMatrixSaving] = useState(false)
  const [shipmentDetailLoading, setShipmentDetailLoading] = useState(false)

  const [carrierDialog, setCarrierDialog] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<LogisticsCarrier | null>(null)
  const [cName, setCName] = useState("")
  const [cCode, setCCode] = useState("")
  const [cEmail, setCEmail] = useState("")
  const [cPhone, setCPhone] = useState("")
  const [cServiceLevels, setCServiceLevels] = useState("[]")
  const [cApiEndpoint, setCApiEndpoint] = useState("")
  const [cApiKey, setCApiKey] = useState("")
  const [cHasApiIntegration, setCHasApiIntegration] = useState(false)
  const [cSupportsWebhook, setCSupportsWebhook] = useState(true)
  const [cPollMins, setCPollMins] = useState("30")
  const [cDisplayPriority, setCDisplayPriority] = useState("")
  const [cConfig, setCConfig] = useState("{}")
  const [cSla, setCSla] = useState("{}")
  const [cSecrets, setCSecrets] = useState("{}")

  const [regionDialog, setRegionDialog] = useState(false)
  const [editingRegion, setEditingRegion] = useState<LogisticsRegion | null>(null)
  const [rCode, setRCode] = useState("")
  const [rName, setRName] = useState("")
  const [rPrimary, setRPrimary] = useState("")
  const [rFailover, setRFailover] = useState("")

  const [matrixDialog, setMatrixDialog] = useState(false)
  const [mCurrency, setMCurrency] = useState("USD")
  const [mTier, setMTier] = useState("SMALL")
  const [mLen, setMLen] = useState("60")
  const [mWid, setMWid] = useState("40")
  const [mHgt, setMHgt] = useState("30")
  const [mWt, setMWt] = useState("5")
  const [mBase, setMBase] = useState("5")
  const [mEta, setMEta] = useState("48")
  const [mActive, setMActive] = useState(true)

  const [shipmentDetail, setShipmentDetail] = useState<LogisticsShipment | null>(null)
  const [shipmentDetailOpen, setShipmentDetailOpen] = useState(false)

  const loadCarriers = useCallback(async () => {
    const list = await listLogisticsCarriers()
    setCarriers(list.map((row) => coerceLogisticsCarrier(row)))
  }, [])
  const loadRegions = useCallback(async () => {
    const list = await listLogisticsRegions()
    setRegions(list.map((row) => coerceLogisticsRegion(row)))
  }, [])
  const loadMatrix = useCallback(async () => {
    const list = await listShippingMatrix()
    setMatrix(list)
  }, [])
  const loadShipments = useCallback(async () => {
    const list = await listLogisticsShipments()
    setShipments(list.map((row) => coerceLogisticsShipment(row)))
  }, [])

  const refreshTab = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === "carriers") await loadCarriers()
      if (tab === "regions") {
        await loadCarriers()
        await loadRegions()
      }
      if (tab === "matrix") await loadMatrix()
      if (tab === "shipments") await loadShipments()
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: "Load failed",
        description: err.status === 403 ? "Not allowed for your admin role." : err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [tab, loadCarriers, loadRegions, loadMatrix, loadShipments, toast])

  useEffect(() => {
    void refreshTab()
  }, [refreshTab])

  const applyCarrierToForm = useCallback((c: LogisticsCarrier) => {
    setCName(String(c.name ?? ""))
    setCCode(String(c.code ?? ""))
    setCEmail(String(c.contactEmail ?? ""))
    setCPhone(String(c.contactPhone ?? ""))
    setCServiceLevels(JSON.stringify(Array.isArray(c.serviceLevels) ? c.serviceLevels : [], null, 2))
    setCApiEndpoint(String(c.apiEndpoint ?? ""))
    setCApiKey(String(c.apiKey ?? ""))
    setCHasApiIntegration(Boolean(c.hasApiIntegration))
    setCSupportsWebhook(c.supportsWebhook !== false)
    setCPollMins(String(c.pollingIntervalMinutes ?? 30))
    setCDisplayPriority(c.displayPriority != null && !Number.isNaN(Number(c.displayPriority)) ? String(c.displayPriority) : "")
    setCConfig(JSON.stringify(c.integrationConfig ?? {}, null, 2))
    setCSla(JSON.stringify(c.slaConfig ?? {}, null, 2))
    setCSecrets("{}")
  }, [])

  const openNewCarrier = () => {
    setEditingCarrier(null)
    setCName("")
    setCCode("")
    setCEmail("")
    setCPhone("")
    setCServiceLevels("[]")
    setCApiEndpoint("")
    setCApiKey("")
    setCHasApiIntegration(false)
    setCSupportsWebhook(true)
    setCPollMins("30")
    setCDisplayPriority("")
    setCConfig("{}")
    setCSla("{}")
    setCSecrets("{}")
    setCarrierDialog(true)
  }

  const openEditCarrier = useCallback(
    async (c: LogisticsCarrier) => {
      setEditingCarrier(c)
      setCarrierDialog(true)
      applyCarrierToForm(coerceLogisticsCarrier(c))
      try {
        const full = coerceLogisticsCarrier(await getLogisticsCarrier(c.id))
        applyCarrierToForm(full)
      } catch {
        toast({
          title: "Could not load carrier detail",
          description: "Showing list row data; refresh if fields look incomplete.",
        })
      }
    },
    [applyCarrierToForm, toast]
  )

  const saveCarrier = async () => {
    if (!canMutate || carrierSaving) return
    setCarrierSaving(true)
    try {
      const integrationConfig = parseJsonField("integrationConfig", cConfig)
      const slaConfig = parseJsonField("slaConfig", cSla)
      const integrationSecrets = parseJsonField("integrationSecrets", cSecrets)
      const serviceLevels = parseJsonArrayField("serviceLevels", cServiceLevels)
      const pollNum = Number.parseInt(cPollMins, 10)
      const pollingIntervalMinutes = Number.isFinite(pollNum) && pollNum > 0 ? pollNum : 30

      const body: Record<string, unknown> = {
        name: cName.trim(),
        code: cCode.trim(),
        contactEmail: cEmail.trim(),
        contactPhone: cPhone.trim(),
        serviceLevels,
        hasApiIntegration: cHasApiIntegration,
        supportsWebhook: cSupportsWebhook,
        pollingIntervalMinutes,
      }
      if (cDisplayPriority.trim() !== "") {
        const dp = Number(cDisplayPriority)
        if (!Number.isFinite(dp)) throw new Error("displayPriority must be a number")
        body.displayPriority = dp
      }
      const ep = cApiEndpoint.trim()
      if (ep) body.apiEndpoint = ep
      const legacyKey = cApiKey.trim()
      if (legacyKey) body.apiKey = legacyKey
      if (integrationConfig) body.integrationConfig = integrationConfig
      if (slaConfig) body.slaConfig = slaConfig
      if (integrationSecrets && Object.keys(integrationSecrets).length) body.integrationSecrets = integrationSecrets

      if (editingCarrier) {
        await updateLogisticsCarrier(editingCarrier.id, body)
        toast({ title: "Carrier updated" })
      } else {
        await createLogisticsCarrier(body)
        toast({ title: "Carrier created" })
      }
      setCarrierDialog(false)
      await loadCarriers()
    } catch (e: unknown) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setCarrierSaving(false)
    }
  }

  const carrierSaveDisabled =
    !canMutate ||
    carrierSaving ||
    !cName.trim() ||
    !cCode.trim() ||
    !cEmail.trim() ||
    !cPhone.trim()

  const removeCarrier = async (id: string) => {
    if (!canMutate || !confirm("Delete this carrier?")) return
    try {
      await deleteLogisticsCarrier(id)
      toast({ title: "Carrier deleted" })
      await loadCarriers()
    } catch (e: unknown) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" })
    }
  }

  const openNewRegion = () => {
    setEditingRegion(null)
    setRCode("")
    setRName("")
    setRPrimary(carriers[0]?.id ?? "")
    setRFailover("")
    setRegionDialog(true)
  }

  const openEditRegion = (r: LogisticsRegion) => {
    const x = coerceLogisticsRegion(r)
    setEditingRegion(x)
    setRCode(x.regionCode)
    setRName(String(x.name ?? ""))
    setRPrimary(x.primaryCarrierId)
    setRFailover((x.failoverCarrierIds || []).join(","))
    setRegionDialog(true)
  }

  const saveRegion = async () => {
    if (!canMutate || regionSaving) return
    setRegionSaving(true)
    try {
      const failoverCarrierIds = rFailover
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      if (editingRegion) {
        await updateLogisticsRegion(editingRegion.id, {
          regionCode: rCode.trim(),
          name: rName.trim() || undefined,
          primaryCarrierId: rPrimary,
          failoverCarrierIds,
        })
        toast({ title: "Region updated" })
      } else {
        await createLogisticsRegion({
          regionCode: rCode.trim(),
          primaryCarrierId: rPrimary,
          name: rName.trim() || undefined,
          failoverCarrierIds,
        })
        toast({ title: "Region created" })
      }
      setRegionDialog(false)
      await loadRegions()
    } catch (e: unknown) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setRegionSaving(false)
    }
  }

  const removeRegion = async (id: string) => {
    if (!canMutate || !confirm("Delete this region?")) return
    try {
      await deleteLogisticsRegion(id)
      toast({ title: "Region deleted" })
      await loadRegions()
    } catch (e: unknown) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" })
    }
  }

  const openMatrixDialog = () => {
    setMatrixDialog(true)
  }

  const saveMatrix = async () => {
    if (!canMutate || matrixSaving) return
    setMatrixSaving(true)
    try {
      await upsertShippingMatrixRow({
        currency: mCurrency,
        tier: mTier,
        maxLengthCm: Number(mLen),
        maxWidthCm: Number(mWid),
        maxHeightCm: Number(mHgt),
        maxWeightKg: Number(mWt),
        baseCost: Number(mBase),
        baselineEtaHours: Number(mEta),
        isActive: mActive,
      })
      toast({ title: "Matrix row saved" })
      setMatrixDialog(false)
      await loadMatrix()
    } catch (e: unknown) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setMatrixSaving(false)
    }
  }

  const openShipment = async (s: LogisticsShipment) => {
    setShipmentDetailOpen(true)
    setShipmentDetail(null)
    setShipmentDetailLoading(true)
    try {
      const full = coerceLogisticsShipment(await getLogisticsShipment(s.id))
      setShipmentDetail(full)
    } catch {
      setShipmentDetail(coerceLogisticsShipment(s))
    } finally {
      setShipmentDetailLoading(false)
    }
  }

  const runPoll = async () => {
    if (!canMutate) return
    setPolling(true)
    try {
      await pollLogisticsShipments()
      toast({ title: "Poll triggered" })
      await loadShipments()
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: err.status === 403 ? "Not allowed" : "Poll failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setPolling(false)
    }
  }

  const eventsForDetail = useMemo((): OrderShippingTrackingEvent[] => {
    const ev = shipmentDetail?.trackingEvents
    if (!Array.isArray(ev)) return []
    return ev as OrderShippingTrackingEvent[]
  }, [shipmentDetail])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground dark:text-zinc-300 max-w-3xl leading-relaxed space-y-2">
          <p>
            Carriers, regions, and the rate matrix power{" "}
            <span className="font-mono text-foreground dark:text-zinc-100">carrier_v1</span> checkout quotes. Tracking webhooks are{" "}
            <span className="font-medium text-foreground dark:text-zinc-200">HMAC-signed server-to-server POSTs</span> (configure at the carrier portal, not in the browser):{" "}
            <code className="text-xs font-mono break-all rounded border border-border/70 bg-muted/80 px-1.5 py-1 text-foreground shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
              {baseUrl}/api/webhooks/logistics/&lt;carrierId&gt;/tracking-update
            </code>
          </p>
          <p className="text-xs font-mono text-foreground dark:text-zinc-200 rounded-md border border-border/70 bg-muted/50 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-950/80">
            <span className="text-muted-foreground dark:text-zinc-400 font-sans font-normal">Active backend API — </span>
            {baseUrl}
            <span className="text-muted-foreground dark:text-zinc-500 font-sans font-normal">
              {" "}
              (production default: {DEFAULT_PRODUCTION_API_URL}; override with{" "}
              <span className="font-mono">NEXT_PUBLIC_API_URL</span>)
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void refreshTab()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          {tab === "shipments" ? (
            <Button type="button" size="sm" onClick={() => void runPoll()} disabled={polling || !canMutate} className="gap-2">
              {polling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Poll shipments
            </Button>
          ) : null}
        </div>
      </div>

      {!canMutate ? (
        <p className="text-sm text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg p-3 bg-amber-500/5">
          Your role can view logistics data; create/update/delete requires Logistics Coordinator or Super Admin.
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 dark:bg-zinc-900/90 dark:text-zinc-200">
          <TabsTrigger value="carriers" className="dark:text-zinc-100 dark:data-[state=active]:text-foreground">
            Carriers
          </TabsTrigger>
          <TabsTrigger value="regions" className="dark:text-zinc-100 dark:data-[state=active]:text-foreground">
            Regions
          </TabsTrigger>
          <TabsTrigger value="matrix" className="dark:text-zinc-100 dark:data-[state=active]:text-foreground">
            Rate matrix
          </TabsTrigger>
          <TabsTrigger value="shipments" className="dark:text-zinc-100 dark:data-[state=active]:text-foreground">
            Shipments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carriers" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Carriers</CardTitle>
                <CardDescription>Masked secrets in list/detail; send new secrets only when saving.</CardDescription>
              </div>
              {canMutate ? (
                <Button size="sm" onClick={openNewCarrier} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <TableLoadingSkeleton rows={8} />
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carriers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs">{c.code || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" type="button" onClick={() => void navigator.clipboard.writeText(`${baseUrl}/api/webhooks/logistics/${c.id}/tracking-update`)} title="Copy webhook URL">
                          <Copy className="h-4 w-4" />
                        </Button>
                        {canMutate ? (
                          <>
                            <Button variant="ghost" size="icon" type="button" onClick={() => void openEditCarrier(c)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => void removeCarrier(c.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!carriers.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground text-center py-8">
                        No carriers
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Regions</CardTitle>
                <CardDescription>Primary and ordered failover carriers per region code.</CardDescription>
              </div>
              {canMutate ? (
                <Button size="sm" onClick={openNewRegion} disabled={!carriers.length} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <TableLoadingSkeleton rows={8} />
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead>Failover</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.regionCode}</TableCell>
                      <TableCell>{r.name || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.primaryCarrierId}</TableCell>
                      <TableCell className="text-xs">{(r.failoverCarrierIds || []).join(", ") || "—"}</TableCell>
                      <TableCell className="text-right">
                        {canMutate ? (
                          <>
                            <Button variant="ghost" size="sm" type="button" onClick={() => openEditRegion(r)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" type="button" onClick={() => void removeRegion(r.id)}>
                              Delete
                            </Button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!regions.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center py-8">
                        No regions
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shipping rate matrix</CardTitle>
                <CardDescription>Tier bounds and fallback costs when no carrier quote is available.</CardDescription>
              </div>
              {canMutate ? (
                <Button size="sm" onClick={openMatrixDialog} className="gap-1">
                  <Plus className="h-4 w-4" /> Upsert row
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <TableLoadingSkeleton rows={8} />
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Max L×W×H (cm)</TableHead>
                    <TableHead>Max kg</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>ETA h</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.currency}</TableCell>
                      <TableCell>{row.tier}</TableCell>
                      <TableCell className="text-xs">
                        {row.maxLengthCm}×{row.maxWidthCm}×{row.maxHeightCm}
                      </TableCell>
                      <TableCell>{row.maxWeightKg}</TableCell>
                      <TableCell>{row.baseCost}</TableCell>
                      <TableCell>{row.baselineEtaHours}</TableCell>
                      <TableCell>{row.isActive === false ? "No" : "Yes"}</TableCell>
                    </TableRow>
                  ))}
                  {!matrix.length ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground text-center py-8">
                        No matrix rows
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
              <CardDescription>Open a row for tracking events (admin view).</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <TableLoadingSkeleton rows={8} />
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Carrier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/40" onClick={() => void openShipment(s)}>
                      <TableCell className="font-mono text-xs">{s.id.slice(0, 10)}…</TableCell>
                      <TableCell className="font-mono text-xs">{String(s.orderId ?? "—").slice(0, 12)}</TableCell>
                      <TableCell className="font-mono text-xs">{String(s.carrierId ?? "—").slice(0, 10)}</TableCell>
                    </TableRow>
                  ))}
                  {!shipments.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground text-center py-8">
                        No shipments
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={carrierDialog}
        onOpenChange={(open) => {
          setCarrierDialog(open)
          if (!open) setCarrierSaving(false)
        }}
      >
        <DialogContent className="w-[96vw] max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCarrier ? "Edit carrier" : "New carrier"}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-zinc-400">
              API expects camelCase JSON. <span className="font-mono">code</span> is the short unique id (not{" "}
              <span className="font-mono">carrierCode</span> inside config). Secrets are masked in GET responses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="carrier-name">name</Label>
                <Input id="carrier-name" value={cName} onChange={(e) => setCName(e.target.value)} autoComplete="off" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="carrier-code">code</Label>
                <Input
                  id="carrier-code"
                  value={cCode}
                  onChange={(e) => setCCode(e.target.value)}
                  placeholder="FEDEX_ZW"
                  className="font-mono text-sm"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="carrier-email">contactEmail</Label>
                <Input id="carrier-email" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} autoComplete="off" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="carrier-phone">contactPhone</Label>
                <Input id="carrier-phone" value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="+263…" autoComplete="off" />
              </div>
            </div>
            <JsonSchemaJsonField
              label="serviceLevels (JSON array)"
              description='JSON array of service level strings or objects, e.g. ["STANDARD","EXPRESS"].'
              example={LOGISTICS_CARRIER_SERVICE_LEVELS_EXAMPLE}
              hint="Must be valid JSON array. Use [] if you do not need service levels yet."
            >
              <Textarea value={cServiceLevels} onChange={(e) => setCServiceLevels(e.target.value)} rows={6} spellCheck={false} />
            </JsonSchemaJsonField>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="carrier-api-endpoint">apiEndpoint (legacy, optional)</Label>
                <Input id="carrier-api-endpoint" value={cApiEndpoint} onChange={(e) => setCApiEndpoint(e.target.value)} placeholder="https://…" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="carrier-api-key">apiKey (legacy, optional)</Label>
                <Input id="carrier-api-key" value={cApiKey} onChange={(e) => setCApiKey(e.target.value)} type="password" autoComplete="new-password" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Switch id="carrier-has-api" checked={cHasApiIntegration} onCheckedChange={setCHasApiIntegration} />
                <Label htmlFor="carrier-has-api" className="font-normal text-muted-foreground dark:text-zinc-300">
                  hasApiIntegration
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="carrier-webhook" checked={cSupportsWebhook} onCheckedChange={setCSupportsWebhook} />
                <Label htmlFor="carrier-webhook" className="font-normal text-muted-foreground dark:text-zinc-300">
                  supportsWebhook
                </Label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="carrier-poll" className="shrink-0 font-normal text-muted-foreground dark:text-zinc-300">
                  pollingIntervalMinutes
                </Label>
                <Input
                  id="carrier-poll"
                  className="h-8 w-20 font-mono text-sm"
                  inputMode="numeric"
                  value={cPollMins}
                  onChange={(e) => setCPollMins(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="carrier-priority" className="shrink-0 font-normal text-muted-foreground dark:text-zinc-300">
                  displayPriority
                </Label>
                <Input
                  id="carrier-priority"
                  className="h-8 w-24 font-mono text-sm"
                  inputMode="numeric"
                  placeholder="optional"
                  value={cDisplayPriority}
                  onChange={(e) => setCDisplayPriority(e.target.value)}
                />
              </div>
            </div>
            <JsonSchemaJsonField
              label="integrationConfig (JSON object)"
              description="Non-secret templates only: paths, header templates, etc. Top-level carrier id is the field code, not a key here."
              example={LOGISTICS_CARRIER_INTEGRATION_CONFIG_EXAMPLE}
            >
              <Textarea value={cConfig} onChange={(e) => setCConfig(e.target.value)} rows={12} spellCheck={false} />
            </JsonSchemaJsonField>
            <JsonSchemaJsonField
              label="slaConfig (JSON object)"
              description="Service-level expectations for ops and polling: cutoffs, ETA hours, business-day rules, retries."
              example={LOGISTICS_CARRIER_SLA_CONFIG_EXAMPLE}
            >
              <Textarea value={cSla} onChange={(e) => setCSla(e.target.value)} rows={10} spellCheck={false} />
            </JsonSchemaJsonField>
            <JsonSchemaJsonField
              label="integrationSecrets (JSON, optional — merge on save)"
              description="Credentials and signing material. Never logged in full; omit keys you are not changing."
              example={LOGISTICS_CARRIER_SECRETS_EXAMPLE}
              hint="Send only the keys you want to set or rotate. Use an empty object {} to skip updating secrets."
            >
              <Textarea
                value={cSecrets}
                onChange={(e) => setCSecrets(e.target.value)}
                rows={8}
                spellCheck={false}
                placeholder="{}"
              />
            </JsonSchemaJsonField>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" disabled={carrierSaving} onClick={() => setCarrierDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveCarrier()} disabled={carrierSaveDisabled} className="gap-2">
              {carrierSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={regionDialog}
        onOpenChange={(open) => {
          setRegionDialog(open)
          if (!open) setRegionSaving(false)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRegion ? "Edit region" : "New region"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>regionCode</Label>
                <Input value={rCode} onChange={(e) => setRCode(e.target.value)} placeholder="DEFAULT" />
              </div>
              <div className="grid gap-1.5">
                <Label>Name (optional)</Label>
                <Input value={rName} onChange={(e) => setRName(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Primary carrier</Label>
              <Select value={rPrimary} onValueChange={setRPrimary}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Failover carrier IDs (comma-separated, order matters)</Label>
              <Input value={rFailover} onChange={(e) => setRFailover(e.target.value)} placeholder="uuid-first-try, uuid-second-try" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" disabled={regionSaving} onClick={() => setRegionDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void saveRegion()}
              disabled={!canMutate || regionSaving || !rCode.trim() || !rPrimary}
              className="gap-2"
            >
              {regionSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={matrixDialog}
        onOpenChange={(open) => {
          setMatrixDialog(open)
          if (!open) setMatrixSaving(false)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upsert matrix row</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <Select value={mCurrency} onValueChange={setMCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ZWL">ZWL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tier</Label>
              <Select value={mTier} onValueChange={setMTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">SMALL</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LARGE">LARGE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>maxLengthCm</Label>
              <Input value={mLen} onChange={(e) => setMLen(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>maxWidthCm</Label>
              <Input value={mWid} onChange={(e) => setMWid(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>maxHeightCm</Label>
              <Input value={mHgt} onChange={(e) => setMHgt(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>maxWeightKg</Label>
              <Input value={mWt} onChange={(e) => setMWt(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>baseCost</Label>
              <Input value={mBase} onChange={(e) => setMBase(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>baselineEtaHours</Label>
              <Input value={mEta} onChange={(e) => setMEta(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="mAct" checked={mActive} onChange={(e) => setMActive(e.target.checked)} />
              <Label htmlFor="mAct">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" disabled={matrixSaving} onClick={() => setMatrixDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveMatrix()} disabled={!canMutate || matrixSaving} className="gap-2">
              {matrixSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={shipmentDetailOpen}
        onOpenChange={(open) => {
          setShipmentDetailOpen(open)
          if (!open) {
            setShipmentDetailLoading(false)
            setShipmentDetail(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment tracking</DialogTitle>
          </DialogHeader>
          {shipmentDetailLoading ? (
            <div className="space-y-4 py-2" aria-busy="true" aria-label="Loading shipment">
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : shipmentDetail ? (
            <div className="space-y-4">
              <p className="text-xs font-mono text-muted-foreground dark:text-zinc-400">{shipmentDetail.id}</p>
              <ShippingTrackingTimeline events={eventsForDetail} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
