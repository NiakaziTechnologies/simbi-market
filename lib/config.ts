/**
 * Global configuration for backend API endpoints
 */

/** Default production API host (no trailing slash). Override with `NEXT_PUBLIC_API_URL`. */
export const DEFAULT_PRODUCTION_API_URL = "https://simbi-three.vercel.app"

// Get the appropriate base URL based on environment
function getBaseURL(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, "")
      : ""
  if (fromEnv) return fromEnv

  // Deployed storefront (not local): talk to production API unless env is set above
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return DEFAULT_PRODUCTION_API_URL
  }

  // SSR on production host (e.g. Vercel): avoid defaulting to localhost during prerender
  if (
    typeof window === "undefined" &&
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "production"
  ) {
    return DEFAULT_PRODUCTION_API_URL
  }

  return "http://localhost:3006"
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