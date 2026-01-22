// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the backend API base URL based on environment
 */
export function getBackendUrl(): string {
  // In production, use environment variable or default to same origin
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || '';
  }
  
  // In development, use configured URL or localhost
  return process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';
}

/**
 * Standard CORS headers for API routes
 */
const corsBaseHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

/**
 * Get CORS headers with origin
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') ?? '*';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': origin,
  };
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Proxy a request to the backend API
 * @param request - The incoming Next.js request
 * @param endpoint - The backend endpoint path (e.g., '/api/seller/dashboard/stats')
 * @param options - Additional fetch options
 */
export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
  options: RequestInit = {}
): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);

  try {
    const backendUrl = getBackendUrl();
    
    // Clean up endpoint path
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build full URL with query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = `${backendUrl}${cleanEndpoint}${queryString ? `?${queryString}` : ''}`;

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader }),
      ...(options.headers || {}),
    };

    // Make request to backend
    const backendResponse = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Get response data
    const contentType = backendResponse.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await backendResponse.json();
    } else if (contentType?.includes('text/csv')) {
      data = await backendResponse.text();
      return new NextResponse(data, {
        status: backendResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': backendResponse.headers.get('Content-Disposition') || 'attachment; filename="export.csv"',
        },
      });
    } else {
      data = await backendResponse.text();
    }

    // Return response with CORS headers
    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Backend proxy error:', error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to backend API',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503, headers: corsHeaders }
    );
  }
}

/**
 * Proxy a request with a request body
 */
export async function proxyWithBody(
  request: NextRequest,
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
): Promise<NextResponse> {
  try {
    const body = await request.text();
    
    return proxyToBackend(request, endpoint, {
      method,
      body: body || undefined,
    });
  } catch (error) {
    const corsHeaders = getCorsHeaders(request);
    console.error('Proxy with body error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process request',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}