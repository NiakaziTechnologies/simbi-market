// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || 'http://localhost:3002';

    const response = await fetch(`${backendUrl}/api/seller/inventory/bulk-upload/template`, {
      method: 'GET',
      headers: {
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="product_upload_template.csv"'
      }
    });
  } catch (error) {
    console.error('Bulk upload template proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve bulk upload template',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
