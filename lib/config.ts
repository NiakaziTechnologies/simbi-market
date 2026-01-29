/**
 * Global configuration for backend API endpoints
 */

// Check if we're in development mode
// Use typeof window check for client-side, or check process.env for server-side
const isDevelopment = 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development')

// Get the appropriate base URL based on environment
function getBaseURL(): string {
  // Allow override via environment variable
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  // Always use localhost for development
  return 'http://localhost:3006'
}

export const API_CONFIG = {
  // Development backend URL
  DEV_BASE_URL: 'http://localhost:3006',
  
  // Production backend URL
  // Use NEXT_PUBLIC_ prefix so it's available on the client side
  PROD_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006',
  
  // Get the appropriate base URL based on environment
  get baseURL(): string {
    return getBaseURL()
  },
}

// Export the base URL directly for easier access
export const getApiBaseURL = getBaseURL
