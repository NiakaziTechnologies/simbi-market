// @ts-nocheck
/**
 * Utility functions for JWT token handling
 */

/**
 * Decode JWT token without verification (for client-side expiration check)
 * Note: This does NOT verify the signature, only decodes the payload
 */
export function decodeJWT(token: string): { exp?: number; iat?: number; sub?: string; [key: string]: any } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    // Decode base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * Returns true if token is expired or invalid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    // If no expiration claim, consider it expired for safety
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  // Add 5 minute buffer to account for clock skew and network delays
  return currentTime >= (expirationTime - 5 * 60 * 1000);
}

/**
 * Check if a token will expire soon (within 10 minutes)
 */
export function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  return (expirationTime - currentTime) < tenMinutes;
}


















