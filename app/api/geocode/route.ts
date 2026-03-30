import { NextResponse } from "next/server"
import type { GeocodeSuggestion } from "@/lib/geocode/types"
import { parseNominatimAddress } from "@/lib/geocode/parse-nominatim-address"
import { isLatLngInZimbabwe } from "@/lib/geography/zimbabwe"

const NOMINATIM_LIMIT = 40

/**
 * Zimbabwe-only place search via Nominatim (OpenStreetMap).
 * https://nominatim.org/release-docs/latest/api/Search/
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (q.length < 1) {
    return NextResponse.json({ results: [] satisfies GeocodeSuggestion[] })
  }

  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", q)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", String(NOMINATIM_LIMIT))
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("countrycodes", "zw")
  url.searchParams.set(
    "viewbox",
    `${25.2},${-15.55},${33.1},${-22.45}`
  )
  url.searchParams.set("bounded", "0")

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": "SimbiMarket-Checkout/1.0 (+https://simbimarket.com)",
      },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      { error: "Geocode request failed", results: [] },
      { status: 502 }
    )
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Geocode upstream error", results: [] },
      { status: 502 }
    )
  }

  const raw = (await res.json()) as Array<{
    lat?: string
    lon?: string
    display_name?: string
    place_id?: number
    address?: Record<string, string>
  }>

  const results: GeocodeSuggestion[] = raw
    .map((row, i) => {
      const lat = row.lat != null ? Number(row.lat) : NaN
      const lng = row.lon != null ? Number(row.lon) : NaN
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      if (!isLatLngInZimbabwe(lat, lng)) return null
      const label = row.display_name?.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      const id = String(row.place_id ?? `${lat},${lng},${i}`)
      const parsed = parseNominatimAddress(row.address, row.display_name)
      return {
        id,
        label,
        lat,
        lng,
        addressLine1: parsed.addressLine1,
        city: parsed.city,
        province: parsed.province,
      }
    })
    .filter((x): x is GeocodeSuggestion => x != null)

  return NextResponse.json({ results })
}
