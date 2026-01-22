// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { sellers } from '../_store';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const corsBaseHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') ?? '*';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': origin,
  };
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    const { email, password } = loginSchema.parse(body);

    const seller = sellers.find((s) => s.email === email);

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    if (seller.status !== 'APPROVED' && seller.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          message: 'Account pending approval. Please wait for admin review.',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const accessToken = jwt.sign(
      {
        sub: seller.id,
        email: seller.email,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    const refreshToken = jwt.sign(
      {
        sub: seller.id,
      },
      refreshSecret,
      { expiresIn: '30d' }
    );

    const { password: _password, ...sellerResponse } = seller;

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          seller: sellerResponse,
          accessToken,
          refreshToken,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
