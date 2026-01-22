// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header required'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';
    const url = `${backendUrl}/api/seller/settings${queryString ? `?${queryString}` : ''}`;

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Settings proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header required'
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';
    const backendResponse = await fetch(`${backendUrl}/api/seller/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Settings update proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
