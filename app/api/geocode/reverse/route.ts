import { NextResponse } from "next/server"
import {
  parseNominatimAddress,
  type ShippingFieldsFromGeocode,
} from "@/lib/geocode/parse-nominatim-address"
import { clampLatLngToZimbabwe, isLatLngInZimbabwe } from "@/lib/geography/zimbabwe"

/**
 * Reverse geocode a point (Zimbabwe-clamped). Nominatim reverse API.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Invalid coordinates", fields: null },
      { status: 400 }
    )
  }

  const c = clampLatLngToZimbabwe(lat, lng)
  if (!isLatLngInZimbabwe(c.lat, c.lng)) {
    return NextResponse.json(
      { error: "Outside Zimbabwe", fields: null },
      { status: 400 }
    )
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse")
  url.searchParams.set("lat", String(c.lat))
  url.searchParams.set("lon", String(c.lng))
  url.searchParams.set("format", "json")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("zoom", "18")

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
      { error: "Reverse geocode failed", fields: null },
      { status: 502 }
    )
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Upstream error", fields: null },
      { status: 502 }
    )
  }

  const json = (await res.json()) as {
    display_name?: string
    address?: Record<string, string>
  }

  const fields: ShippingFieldsFromGeocode = parseNominatimAddress(
    json.address,
    json.display_name
  )

  return NextResponse.json({
    label: json.display_name ?? "",
    fields,
  })
}
