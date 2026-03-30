"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { reverseGeocode, searchPlaces } from "@/lib/api/geocode"
import { haversineKm } from "@/lib/commerce/haversine-km"
import type {
  DeliveryLocationSavePayload,
  GeocodeSuggestion,
} from "@/lib/geocode/types"
import type { ShippingFieldsFromGeocode } from "@/lib/geocode/parse-nominatim-address"
import {
  ZIMBABWE_DEFAULT_ZOOM,
  ZIMBABWE_MAP_CENTER,
  ZIMBABWE_MAX_BOUNDS,
  clampLatLngToZimbabwe,
} from "@/lib/geography/zimbabwe"

function useFixLeafletIcons() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })
  }, [])
}

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapPanTo({
  center,
  zoom,
  panVersion,
}: {
  center: [number, number]
  zoom: number
  panVersion: number
}) {
  const map = useMap()
  const centerRef = useRef(center)
  const zoomRef = useRef(zoom)
  centerRef.current = center
  zoomRef.current = zoom
  const skipNextFly = useRef(true)
  useEffect(() => {
    if (skipNextFly.current) {
      skipNextFly.current = false
      return
    }
    map.flyTo(centerRef.current, zoomRef.current, { duration: 0.65 })
  }, [panVersion, map])
  return null
}

type LatLng = { lat: number; lng: number }

function sameLatLng(a: LatLng | null, b: LatLng | null): boolean {
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return (
    Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lng - b.lng) < 1e-5
  )
}

export function DeliveryLocationModal({
  open,
  onOpenChange,
  warehouse,
  committed,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse: LatLng
  committed: LatLng | null
  onSave: (payload: DeliveryLocationSavePayload) => void
}) {
  useFixLeafletIcons()
  const [draft, setDraft] = useState<LatLng | null>(null)
  const [addressHint, setAddressHint] =
    useState<ShippingFieldsFromGeocode | null>(null)
  const [reverseLoading, setReverseLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [panVersion, setPanVersion] = useState(0)
  const [saving, setSaving] = useState(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reverseSeq = useRef(0)

  useEffect(() => {
    if (open) {
      setDraft(committed)
      setAddressHint(null)
      setReverseLoading(false)
      setQuery("")
      setSuggestions([])
      setListOpen(false)
      setPanVersion(0)
      setSaving(false)
    }
  }, [open, committed])

  const distanceKm = useMemo(
    () => (draft ? haversineKm(warehouse, draft) : null),
    [warehouse, draft]
  )

  const mapCenter: [number, number] = useMemo(
    () =>
      draft
        ? [draft.lat, draft.lng]
        : [ZIMBABWE_MAP_CENTER[0], ZIMBABWE_MAP_CENTER[1]],
    [draft]
  )
  const mapZoom = draft ? 14 : ZIMBABWE_DEFAULT_ZOOM

  useEffect(() => {
    const q = query.trim()
    if (q.length < 1) {
      setSuggestions([])
      return
    }
    const t = setTimeout(() => {
      setSearchLoading(true)
      searchPlaces(q)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const warehouseIcon = useMemo(
    () =>
      L.divIcon({
        html: '<div style="width:12px;height:12px;background:#dc2626;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: "leaflet-warehouse-icon",
      }),
    []
  )

  const bumpPan = () => setPanVersion((v) => v + 1)

  const handleSelectSuggestion = (s: GeocodeSuggestion) => {
    const c = clampLatLngToZimbabwe(s.lat, s.lng)
    setDraft(c)
    setAddressHint({
      addressLine1: s.addressLine1 ?? "",
      city: s.city ?? "",
      province: s.province ?? "",
    })
    setReverseLoading(false)
    setQuery("")
    setListOpen(false)
    setSuggestions([])
    bumpPan()
  }

  const handleMapPick = (lat: number, lng: number) => {
    const c = clampLatLngToZimbabwe(lat, lng)
    setDraft(c)
    const seq = ++reverseSeq.current
    setReverseLoading(true)
    reverseGeocode(c.lat, c.lng)
      .then((fields) => {
        if (reverseSeq.current !== seq) return
        setAddressHint(fields)
      })
      .finally(() => {
        if (reverseSeq.current === seq) setReverseLoading(false)
      })
    bumpPan()
  }

  const handleClearPin = () => {
    setDraft(null)
    setAddressHint(null)
    setReverseLoading(false)
    bumpPan()
  }

  const scheduleBlurClose = () => {
    blurTimer.current = setTimeout(() => setListOpen(false), 180)
  }

  const cancelBlurClose = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
  }

  const unchanged = sameLatLng(draft, committed)
  const canSave = !unchanged

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      let hint = addressHint
      const hintUseful =
        hint &&
        (hint.addressLine1.trim() ||
          hint.city.trim() ||
          hint.province.trim())
      if (draft && !hintUseful) {
        hint = await reverseGeocode(draft.lat, draft.lng)
      }
      const finalHint = hint
      const useful =
        finalHint &&
        (finalHint.addressLine1.trim() ||
          finalHint.city.trim() ||
          finalHint.province.trim())
      const payload: DeliveryLocationSavePayload = {
        location: draft,
        shippingFromPin:
          draft && useful
            ? {
                addressLine1: finalHint!.addressLine1.trim(),
                city: finalHint!.city.trim(),
                province: finalHint!.province.trim(),
              }
            : undefined,
      }
      onSave(payload)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="delivery-location-modal-content max-h-[92vh] max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        showCloseButton
      >
        <div className="border-b border-border px-6 pb-4 pt-6 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="font-light text-foreground">
              Pin your delivery spot
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Zimbabwe only. Search or tap the map — red dot is our warehouse.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="relative">
            <label className="mb-2 block text-xs font-light text-muted-foreground dark:text-muted">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                autoComplete="off"
                placeholder="Start typing — e.g. Bulawayo, Mutare, Avondale…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setListOpen(true)
                }}
                onFocus={() => {
                  cancelBlurClose()
                  setListOpen(true)
                }}
                onBlur={scheduleBlurClose}
                className="bg-background pl-9 dark:bg-white/5"
              />
              {searchLoading ? (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </div>
            {listOpen && suggestions.length > 0 ? (
              <ul
                className="absolute z-[2000] mt-1 max-h-[min(45vh,340px)] w-full overflow-y-auto rounded-md border border-border bg-background py-1 text-sm shadow-lg dark:border-white/10 dark:bg-zinc-950"
                onMouseDown={(e) => e.preventDefault()}
              >
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 text-left font-light text-foreground hover:bg-muted dark:text-white dark:hover:bg-white/10"
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {listOpen &&
            !searchLoading &&
            query.trim().length >= 1 &&
            suggestions.length === 0 ? (
              <p className="mt-2 text-xs font-light text-muted-foreground dark:text-muted">
                No matches in Zimbabwe. Try another spelling or tap the map.
              </p>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-xs font-light text-muted-foreground dark:text-muted">
              Tap map to move pin
            </p>
            <div className="delivery-location-modal-map relative z-0 h-[min(50vh,400px)] w-full overflow-hidden rounded-lg border border-border dark:border-white/10 [&_.leaflet-container]:z-0">
              {open ? (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="h-full w-full"
                  scrollWheelZoom
                  maxBounds={ZIMBABWE_MAX_BOUNDS}
                  maxBoundsViscosity={0.85}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapPanTo
                    center={mapCenter}
                    zoom={mapZoom}
                    panVersion={panVersion}
                  />
                  <Marker
                    position={[warehouse.lat, warehouse.lng]}
                    icon={warehouseIcon}
                  />
                  <MapClickHandler onPick={handleMapPick} />
                  {draft ? (
                    <Marker position={[draft.lat, draft.lng]} />
                  ) : null}
                </MapContainer>
              ) : null}
            </div>
          </div>

          {draft && distanceKm != null ? (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-light dark:border-white/10 dark:bg-white/5">
              <span className="text-foreground dark:text-white">
                ≈ {distanceKm.toFixed(1)} km
              </span>
              <span className="text-muted-foreground dark:text-muted">
                {" "}
                from warehouse
              </span>
              {reverseLoading ? (
                <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Finding address…
                </span>
              ) : addressHint &&
                (addressHint.addressLine1.trim() ||
                  addressHint.city.trim() ||
                  addressHint.province.trim()) ? (
                <p className="mt-2 border-t border-border pt-2 text-xs font-light text-muted-foreground dark:border-white/10">
                  <span className="text-foreground dark:text-white">
                    Address preview:
                  </span>{" "}
                  {[
                    addressHint.addressLine1,
                    addressHint.city,
                    addressHint.province,
                  ]
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 dark:border-white/10 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {draft ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={handleClearPin}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear pin
              </Button>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSave || saving}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save and close"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
