// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, userType } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token and new password are required',
          error: 'MISSING_FIELDS',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters long',
          error: 'WEAK_PASSWORD',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Proxy to backend API
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';
    const url = `${backendUrl}/api/auth/reset-password`;

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        newPassword,
        userType: userType || 'seller'
      })
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Reset password proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reset password',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


