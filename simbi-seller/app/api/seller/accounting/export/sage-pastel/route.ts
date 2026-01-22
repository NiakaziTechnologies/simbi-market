// @ts-nocheck
import { NextRequest } from 'next/server';
import { handleOptions, proxyToBackend } from '@/lib/proxyUtils';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/seller/accounting/export/sage-pastel');
}
