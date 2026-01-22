// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '10';

    const response = await fetch(`${backendUrl}/api/seller/dashboard/top-products?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dashboard top products proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve top products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
