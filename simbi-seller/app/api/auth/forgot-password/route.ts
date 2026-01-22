// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userType } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required',
          error: 'MISSING_EMAIL',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Proxy to backend API
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';
    const url = `${backendUrl}/api/auth/forgot-password`;

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        userType: userType || 'seller'
      })
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Forgot password proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process password reset request',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


