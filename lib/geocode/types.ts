import type { ShippingFieldsFromGeocode } from "./parse-nominatim-address"

export type { ShippingFieldsFromGeocode }

export interface GeocodeSuggestion {
  id: string
  label: string
  lat: number
  lng: number
  /** Filled from Nominatim when available */
  addressLine1?: string
  city?: string
  province?: string
}

export interface DeliveryLocationSavePayload {
  location: { lat: number; lng: number } | null
  /** When pin saved, best-effort fields for shipping form */
  shippingFromPin?: ShippingFieldsFromGeocode
}
