/** Approximate Zimbabwe bounding box (south-west / north-east corners). */
export const ZIMBABWE_BOUNDS = {
  south: -22.42,
  west: 25.23,
  north: -15.6,
  east: 33.08,
} as const

/** Default map view: country-centred (not the warehouse pin). */
export const ZIMBABWE_MAP_CENTER: [number, number] = [-19.02, 29.88]

/** Country-wide zoom; use with center above. */
export const ZIMBABWE_DEFAULT_ZOOM = 6.5

/** Leaflet maxBounds: [[south, west], [north, east]] */
export const ZIMBABWE_MAX_BOUNDS: [[number, number], [number, number]] = [
  [ZIMBABWE_BOUNDS.south, ZIMBABWE_BOUNDS.west],
  [ZIMBABWE_BOUNDS.north, ZIMBABWE_BOUNDS.east],
]

export function clampLatLngToZimbabwe(lat: number, lng: number): {
  lat: number
  lng: number
} {
  return {
    lat: Math.min(ZIMBABWE_BOUNDS.north, Math.max(ZIMBABWE_BOUNDS.south, lat)),
    lng: Math.min(ZIMBABWE_BOUNDS.east, Math.max(ZIMBABWE_BOUNDS.west, lng)),
  }
}

export function isLatLngInZimbabwe(lat: number, lng: number): boolean {
  return (
    lat >= ZIMBABWE_BOUNDS.south &&
    lat <= ZIMBABWE_BOUNDS.north &&
    lng >= ZIMBABWE_BOUNDS.west &&
    lng <= ZIMBABWE_BOUNDS.east
  )
}
