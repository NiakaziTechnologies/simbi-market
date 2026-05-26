/**
 * Global configuration for backend API endpoints
 */

/** Default production API host (no trailing slash). Override with `NEXT_PUBLIC_API_URL`. */
export const DEFAULT_PRODUCTION_API_URL = "http://31.220.82.129:6000"

// Get the appropriate base URL based on environment
function getBaseURL(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, "")
      : ""
  if (fromEnv) return fromEnv

  // Default to production API (override via env or switch to DEV_BASE_URL for local)
  return DEFAULT_PRODUCTION_API_URL
}

export const API_CONFIG = {
  // Development backend URL
  DEV_BASE_URL: 'http://localhost:3006',

  // Production backend URL
  // Use NEXT_PUBLIC_ prefix so it's available on the client side
  PROD_BASE_URL:
    (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "") || DEFAULT_PRODUCTION_API_URL,

  // Get the appropriate base URL based on environment
  get baseURL(): string {
    return getBaseURL()
  },
}

// Export the base URL directly for easier access
export const getApiBaseURL = getBaseURL