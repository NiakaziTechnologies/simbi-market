/**
 * Global configuration for backend API endpoints
 */

/** Direct API host (HTTP). Used for rewrites + server-side fetch. Override with `BACKEND_URL`. */
export const DEFAULT_PRODUCTION_API_URL = "http://31.220.82.129:5003"

/**
 * Same-origin path on the HTTPS storefront. Next.js rewrites this to `DEFAULT_PRODUCTION_API_URL`.
 * Avoids mixed-content blocking when the site is served over HTTPS.
 */
export const API_PROXY_PATH = "/api/backend"

function trimUrl(url: string): string {
  return url.trim().replace(/\/$/, "")
}

// Get the appropriate base URL based on environment
function getBaseURL(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? trimUrl(process.env.NEXT_PUBLIC_API_URL)
      : ""
  if (fromEnv) return fromEnv

  // Browser on HTTPS (e.g. www.simbimarket.com): use same-origin proxy
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return API_PROXY_PATH
  }

  // Server-side (SSR): direct HTTP is fine (no mixed-content rule in Node)
  if (typeof window === "undefined") {
    const backend =
      typeof process !== "undefined" && process.env.BACKEND_URL
        ? trimUrl(process.env.BACKEND_URL)
        : ""
    if (backend) return backend
  }

  // Local dev in browser (http://localhost) or fallback
  return DEFAULT_PRODUCTION_API_URL
}

export const API_CONFIG = {
  DEV_BASE_URL: "http://localhost:3006",

  PROD_BASE_URL:
    trimUrl(process.env.NEXT_PUBLIC_API_URL ?? "") || DEFAULT_PRODUCTION_API_URL,

  get baseURL(): string {
    return getBaseURL()
  },
}

export const getApiBaseURL = getBaseURL
