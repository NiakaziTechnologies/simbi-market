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
    const body = await request.json();

    // Validate response field
    if (!body.response || typeof body.response !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Response field is required'
        },
        { status: 400 }
      );
    }

    const responseText = body.response.trim();

    // Validate length: minimum 10 characters, maximum 2000 characters
    if (responseText.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Response must be at least 10 characters long'
        },
        { status: 400 }
      );
    }

    if (responseText.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Response must not exceed 2000 characters'
        },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3000';
    const url = `${backendUrl}/api/seller/returns/${id}/respond`;

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ response: responseText })
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Seller respond proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit seller response',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

