// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { sellers } from '../_store';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  businessName: z.string().optional(),
  tradingName: z.string().optional(),
  businessAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
});

const corsBaseHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
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

function authenticateToken(request: NextRequest): { sellerId: string } | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as { sub: string };
    return { sellerId: decoded.sub };
  } catch (error) {
    return null;
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const auth = authenticateToken(request);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const seller = sellers.find((s) => s.id === auth.sellerId);
    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message: 'Seller not found',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    const { password, ...sellerResponse } = seller;

    return NextResponse.json(
      {
        success: true,
        data: sellerResponse,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const auth = authenticateToken(request);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    const updates = updateProfileSchema.parse(body);

    const sellerIndex = sellers.findIndex((s) => s.id === auth.sellerId);
    if (sellerIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Seller not found',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Update seller data
    sellers[sellerIndex] = {
      ...sellers[sellerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const { password, ...sellerResponse } = sellers[sellerIndex];

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: sellerResponse,
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

    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
