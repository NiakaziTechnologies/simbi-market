// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sellers } from '../_store';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(1),
  tradingName: z.string().optional(),
  businessAddress: z.string().min(1),
  contactNumber: z.string().min(1),
  tin: z.string().min(1),
  registrationNumber: z.string().optional(),
  bankAccountName: z.string().min(1),
  bankAccountNumber: z.string().min(1),
  bankName: z.string().min(1),
  contactPerson: z.string().optional(),
  city: z.string().optional(),
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
    console.log('Request received');
    console.log('Incoming origin:', request.headers.get('origin') ?? 'unknown');
    const rawBody = await request.text();
    console.log('Raw body:', rawBody);
    const body = JSON.parse(rawBody);
    console.log('Parsed body:', body);
    const validatedData = registerSchema.parse(body);

    const existingSeller = sellers.find((s) => s.email === validatedData.email);
    if (existingSeller) {
      return NextResponse.json(
        {
          success: false,
          message: 'Seller with this email already exists',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const seller = {
      id: `seller-${Date.now()}`,
      email: validatedData.email,
      password: hashedPassword,
      businessName: validatedData.businessName,
      tradingName: validatedData.tradingName || validatedData.businessName,
      businessAddress: validatedData.businessAddress,
      contactNumber: validatedData.contactNumber,
      tin: validatedData.tin,
      registrationNumber: validatedData.registrationNumber,
      bankAccountName: validatedData.bankAccountName,
      bankAccountNumber: validatedData.bankAccountNumber,
      bankName: validatedData.bankName,
      contactPerson: validatedData.contactPerson,
      city: validatedData.city,
      status: 'ACTIVE' as const,
      sriScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sellers.push(seller);

    const { password, ...sellerResponse } = seller;

    return NextResponse.json(
      {
        success: true,
        message: 'Seller registered successfully.',
        data: sellerResponse,
      },
      { status: 201, headers: corsHeaders }
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

    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
