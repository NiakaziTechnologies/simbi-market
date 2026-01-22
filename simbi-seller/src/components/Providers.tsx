// @ts-nocheck
"use client";

import React, { ReactNode } from 'react';
import { SellerAuthProvider } from '@/hooks/useSellerAuth';
import { AuthGuard } from '@/components/AuthGuard';

interface ProvidersProps {
  children: ReactNode;
}

function ProvidersComponent({ children }: ProvidersProps) {
  return (
    <SellerAuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </SellerAuthProvider>
  );
}

export { ProvidersComponent as Providers };
