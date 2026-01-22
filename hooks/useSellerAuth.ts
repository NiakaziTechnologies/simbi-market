"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

interface Seller {
  id: string;
  businessName: string;
  email: string;
  contactNumber: string;
  businessAddress: string;
  tin: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
}

export function useSellerAuth() {
  const { user, role } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    // Mock data - in real implementation, this would come from API
    if (role === 'seller' && user) {
      setSeller({
        id: 'seller-1',
        businessName: user.name || 'Test Business',
        email: user.email || '',
        contactNumber: '+263 123 456 789',
        businessAddress: '123 Business St, Harare',
        tin: '123456789',
        bankAccountName: 'Test Business',
        bankAccountNumber: '1234567890',
        bankName: 'Test Bank'
      });
    }
  }, [role, user]);

  const userType = role === 'seller' ? 'seller' : role === 'admin' ? 'admin' : 'buyer';

  const updateProfile = async (data: any) => {
    // Mock update - in real implementation, call API
    console.log('Updating profile:', data);
    return Promise.resolve();
  };

  return {
    seller,
    staff,
    userType,
    updateProfile
  };
}