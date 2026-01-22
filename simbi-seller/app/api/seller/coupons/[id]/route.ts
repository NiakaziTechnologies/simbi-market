// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3000';
    const url = `${backendUrl}/api/seller/coupons/${id}`;

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
    console.error('Get coupon proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3000';
    const url = `${backendUrl}/api/seller/coupons/${id}`;

    const backendResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Update coupon proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3000';
    const url = `${backendUrl}/api/seller/coupons/${id}`;

    const backendResponse = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Delete coupon proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}















