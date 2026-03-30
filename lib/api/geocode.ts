import type { GeocodeSuggestion } from "@/lib/geocode/types"
import type { ShippingFieldsFromGeocode } from "@/lib/geocode/parse-nominatim-address"

export async function searchPlaces(query: string): Promise<GeocodeSuggestion[]> {
  const q = query.trim()
  if (q.length < 1) return []

  const res = await fetch(
    `/api/geocode?q=${encodeURIComponent(q)}`,
    { method: "GET", headers: { Accept: "application/json" } }
  )
  if (!res.ok) return []

  const json = (await res.json()) as { results?: GeocodeSuggestion[] }
  return Array.isArray(json.results) ? json.results : []
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ShippingFieldsFromGeocode | null> {
  const res = await fetch(
    `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
    { method: "GET", headers: { Accept: "application/json" } }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { fields?: ShippingFieldsFromGeocode | null }
  return json.fields ?? null
}
