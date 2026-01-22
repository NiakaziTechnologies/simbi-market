// @ts-nocheck
// API base URL from globals configuration
import { API_BASE_URL } from './globals';

function getBaseUrl(): string {
  // Use the global configuration
  return API_BASE_URL;
}

class ApiClient {
  private buildUrl(path: string) {
    const BASE_URL = getBaseUrl();
    
    // Log the base URL in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Base URL:', BASE_URL);
    }
    
    // Handle relative URLs (for same-domain API routes)
    if (BASE_URL.startsWith("/")) {
      return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    }
    
    // Handle absolute URLs (for external APIs) - but prefer relative URLs
    return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    // Automatically include Authorization header if token exists
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    // Check for token in localStorage (for seller auth)
    const sellerToken = typeof window !== 'undefined' ? localStorage.getItem('sellerAccessToken') : null;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request Debug:', {
        path,
        hasToken: !!sellerToken,
        tokenPreview: sellerToken ? `${sellerToken.substring(0, 20)}...` : 'No token',
        url: this.buildUrl(path)
      });
    }
    
    if (sellerToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${sellerToken}`);
    }

    const response = await fetch(this.buildUrl(path), {
      ...options,
      headers,
    });

    const contentType = response.headers.get("Content-Type") ?? "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      // Handle 401 Unauthorized - token is invalid or expired
      if (response.status === 401 && typeof window !== 'undefined') {
        // Clear auth data
        localStorage.removeItem('sellerAccessToken');
        localStorage.removeItem('sellerProfile');
        localStorage.removeItem('sellerRefreshToken');
        
        // Only redirect if we're not already on login/register pages
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
          // Dispatch event to notify auth context
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          // Redirect to login
          window.location.href = '/login';
        }
      }
      
      throw {
        status: response.status,
        data,
      };
    }

    return data as T;
  }

  post<T>(path: string, body: unknown, options: RequestInit = {}) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  patch<T>(path: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options: RequestInit = {}) {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();