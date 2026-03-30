/**
 * Turn Nominatim `address` + optional display_name into checkout shipping fields.
 * Zimbabwe (and neighbours) vary in OSM tagging; this prefers structured keys, then display fallbacks.
 */

export interface ShippingFieldsFromGeocode {
  addressLine1: string
  city: string
  province: string
}

function pick(
  a: Record<string, string | undefined>,
  keys: string[]
): string {
  for (const k of keys) {
    const v = a[k]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return ""
}

function clip(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export function parseNominatimAddress(
  raw: Record<string, string | undefined> | null | undefined,
  displayName?: string
): ShippingFieldsFromGeocode {
  const a = raw ?? {}
  const parts = (displayName ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
  const noCountry = parts.filter((p) => !/^zimbabwe$/i.test(p))

  const city =
    pick(a, [
      "city",
      "town",
      "village",
      "municipality",
      "hamlet",
      "city_district",
    ]) ||
    pick(a, ["suburb", "neighbourhood"]) ||
    noCountry[0] ||
    ""

  let province = pick(a, [
    "state",
    "region",
    "state_district",
    "county",
    "ISO3166-2-lvl4",
  ])

  if (!province && noCountry.length >= 2) {
    const tail = noCountry[noCountry.length - 1]
    const before = noCountry[noCountry.length - 2]
    if (before && tail && before !== city) province = before
    else if (tail && tail !== city) province = tail
  }

  if (!province && city) {
    const m = city.match(/^(Harare|Bulawayo|Mutare|Gweru|Kwekwe|Chitungwiza)$/i)
    if (m) province = m[1]
  }

  const houseRoad = [a.house_number, a.road].filter(Boolean).join(" ").trim()
  const area = pick(a, [
    "suburb",
    "neighbourhood",
    "quarter",
    "residential",
    "hamlet",
  ])
  let addressLine1 = [houseRoad, area].filter(Boolean).join(", ").trim()

  if (!addressLine1 && noCountry.length >= 1) {
    addressLine1 = noCountry.slice(0, Math.min(2, noCountry.length)).join(", ")
  }
  if (!addressLine1 && displayName) {
    addressLine1 = displayName.split(",").slice(0, 2).join(", ").trim()
  }
  if (!addressLine1) addressLine1 = city || "Delivery location"

  return {
    addressLine1: clip(addressLine1, 140),
    city: clip(city || noCountry[0] || "", 90),
    province: clip(province || city || "", 90),
  }
}
