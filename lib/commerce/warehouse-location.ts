function numFromEnv(value: string | undefined, fallback: number): number {
  if (value == null || value === "") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Fulfilment warehouse (lat, lng). Override via NEXT_PUBLIC_WAREHOUSE_LAT / NEXT_PUBLIC_WAREHOUSE_LNG */
export const WAREHOUSE_LAT = numFromEnv(
  process.env.NEXT_PUBLIC_WAREHOUSE_LAT,
  -17.836247
)
export const WAREHOUSE_LNG = numFromEnv(
  process.env.NEXT_PUBLIC_WAREHOUSE_LNG,
  31.040691
)

export const WAREHOUSE_POSITION = {
  lat: WAREHOUSE_LAT,
  lng: WAREHOUSE_LNG,
} as const
