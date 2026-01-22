// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const url = `${backendUrl}/api/seller/orders/${id}/pre-shipment-evidence`;

    // Get form data from request
    const formData = await request.formData();

    // Forward the form data to backend
    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        // Don't set Content-Type header - let fetch set it automatically with boundary for multipart/form-data
      },
      body: formData
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Pre-shipment evidence upload proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload pre-shipment evidence',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}















