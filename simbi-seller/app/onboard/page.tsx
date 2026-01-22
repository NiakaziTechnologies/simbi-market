// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSellerAuth } from '@/hooks/useSellerAuth';

// Client-side only component - no server-side logic


export default function Page() {
  const { seller, loading: sellerLoading } = useSellerAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('Onboard page - Seller auth state:', {
      seller: !!seller,
      sellerLoading,
      fromLogin: sessionStorage.getItem('fromLogin')
    });

    // Prevent redirect loop by checking if we're coming from login
    const fromLogin = sessionStorage.getItem('fromLogin');
    if (fromLogin) {
      console.log('Onboard page - From login, removing flag and staying');
      sessionStorage.removeItem('fromLogin');
      setAuthChecked(true);
      return; // Don't redirect back to login
    }

    // Check if seller is authenticated
    if (!sellerLoading) {
      if (!seller) {
        console.log('Onboard page - No authenticated seller, redirecting to login');
        window.location.href = '/login';
      } else {
        console.log('Onboard page - Seller authenticated, staying on onboard');
        setAuthChecked(true);
      }
    }
  }, [seller, sellerLoading]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    console.log('Onboard submit - Seller state:', {
      seller: !!seller,
      sellerEmail: seller?.email
    });

    if (!seller) {
      console.log('Onboard submit - No authenticated seller');
      return;
    }

    setLoading(true);
    try {
      const sellerId = seller.id;
      console.log('Onboard submit - Creating store for seller:', sellerId);

      // Update seller profile using API
      const updatedProfile = {
        businessName: storeName,
        businessAddress: address,
        contactNumber: phoneNumber,
        tin: nationalId,
        tradingName: storeName,
      };

      // Save profile to localStorage (simulating database save)
      localStorage.setItem(`user_profile_${sellerId}`, JSON.stringify({
        uid: sellerId,
        email: seller.email,
        displayName: `${firstName} ${lastName}`,
        storeName,
        phoneNumber,
        nationalId,
        vatNumber,
        storeCountry: country,
        storeCity: city,
        storeAddress1: address,
        businessOwnerName: `${firstName} ${lastName}`,
        businessOwnerEmail: seller.email,
        businessOwnerPhone: phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      console.log('✅ Profile saved to localStorage:', sellerId);

      console.log('Onboard submit - Store created and profile saved, redirecting to dashboard');
      toast({
        title: "Store Created Successfully!",
        description: "Welcome to your new store dashboard. You can now start managing your business.",
        variant: "default",
      });

      // Set a flag to indicate we're coming from onboarding to prevent redirect loop
      sessionStorage.setItem('fromOnboard', 'true');

      // go to dashboard with a longer delay to ensure profile is saved
      setTimeout(() => {
        console.log('Onboard submit - Redirecting to dashboard after delay');
        window.location.href = '/';
      }, 2000); // Longer delay to ensure profile is fully saved
    } catch (e) {
      console.error('Onboard submit - Failed to save:', e);
      toast({
        title: "Setup Failed",
        description: "Failed to create your store. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Luxury background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl animate-luxury-float"></div>
          <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-luxury-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-md mx-auto py-12 relative">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-indigo-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold luxury-gradient-text">Verifying Access</h1>
              <p className="text-slate-600">Authenticating your seller account...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luxury background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl animate-luxury-float"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-luxury-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-violet-200/15 to-purple-200/15 rounded-full blur-3xl animate-luxury-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Enhanced Header */}
        <div className="text-center mb-12 animate-luxury-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl luxury-hover-lift relative group">
            <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-4xl font-bold luxury-gradient-text mb-3">Create Your Store</h1>
          <p className="text-lg text-slate-600 font-medium">Set up your business profile to get started</p>
        </div>

        {/* Premium Form Container */}
        <div className="premium-card shadow-2xl p-10 space-y-10 relative overflow-hidden group animate-luxury-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-xl"></div>

          <form onSubmit={submit} className="space-y-10 relative">
            {/* Business Owner Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-purple-200">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold luxury-gradient-text">Business Owner Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e)=>setPhoneNumber(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  National ID / Business Registration Number
                </label>
                <Input
                  value={nationalId}
                  onChange={(e)=>setNationalId(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                  placeholder="Enter national ID or business registration number"
                  required
                />
              </div>
            </div>

            {/* Store Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-purple-200">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold luxury-gradient-text">Store Information</h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Store Name
                </label>
                <Input
                  value={storeName}
                  onChange={(e)=>setStoreName(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                  placeholder="Enter your store name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  VAT / Tax Number
                </label>
                <Input
                  value={vatNumber}
                  onChange={(e)=>setVatNumber(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                  placeholder="Enter VAT or tax number (optional)"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Business Address
                </label>
                <Input
                  value={address}
                  onChange={(e)=>setAddress(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                  placeholder="Enter your business address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e)=>setCity(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Country
                  </label>
                  <Input
                    value={country}
                    onChange={(e)=>setCountry(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 hover:bg-white focus:bg-white text-base"
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full luxury-button text-white font-semibold py-5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden group/btn"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <div className="absolute inset-0 rounded-full h-5 w-5 border-2 border-transparent border-r-purple-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                  <span>Creating your store...</span>
                </div>
              ) : (
                <span className="flex items-center gap-3">
                  Launch Store
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
