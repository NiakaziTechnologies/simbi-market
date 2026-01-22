// @ts-nocheck
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { isTokenExpired } from '@/lib/tokenUtils';

interface SellerProfile {
  id: string;
  email: string;
  businessName: string;
  tradingName?: string;
  businessAddress: string;
  contactNumber: string;
  tin: string;
  registrationNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  status: string;
  sriScore: number;
  isEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffProfile {
  id: string;
  sellerId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: string;
  status: string;
  businessName?: string;
  userType: 'staff';
}

interface SellerAuthContextType {
  seller: SellerProfile | null;
  staff: StaffProfile | null;
  userType: 'seller' | 'staff' | null;
  role: string | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (sellerData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<SellerProfile>) => Promise<boolean>;
  getProfile: () => Promise<boolean>;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined);

export function SellerAuthProvider({ children }: { children: ReactNode }) {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [userType, setUserType] = useState<'seller' | 'staff' | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setSeller(null);
    setStaff(null);
    setUserType(null);
    setRole(null);
    setAccessToken(null);
    // Clear localStorage
    localStorage.removeItem('sellerAccessToken');
    localStorage.removeItem('sellerProfile');
    localStorage.removeItem('sellerRefreshToken');
    localStorage.removeItem('staffProfile');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
  }, []);

  const getProfile = useCallback(async (token: string | null): Promise<boolean> => {
    if (!token) {
      return false;
    }

    // Check if token is expired before making request
    if (isTokenExpired(token)) {
      console.log('Token expired before profile fetch');
      logout();
      return false;
    }

    try {
      const data = await apiClient.request<{ success: boolean; message: string; data?: SellerProfile }>(
        '/api/seller/auth/profile',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (data.success && data.data) {
        setSeller(data.data);
        // Update localStorage with fresh profile data
        localStorage.setItem('sellerProfile', JSON.stringify(data.data));
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Get profile error:', error);
      // If token is invalid, logout
      if (error?.status === 401) {
        logout();
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
          router.push('/login');
        }
      }
      return false;
    }
  }, [logout, router]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem('sellerRefreshToken');
    if (!refreshTokenValue) {
      console.log('No refresh token available');
      logout();
      return false;
    }

    try {
      const data = await apiClient.post<{ success: boolean; message: string; data?: { accessToken: string; refreshToken: string } }>(
        '/api/seller/auth/refresh',
        {
          refreshToken: refreshTokenValue
        }
      );

      if (data.success && data.data) {
        const { accessToken: newToken, refreshToken: newRefreshToken } = data.data;

        setAccessToken(newToken);
        localStorage.setItem('sellerAccessToken', newToken);

        if (newRefreshToken) {
          localStorage.setItem('sellerRefreshToken', newRefreshToken);
        }

        return true;
      } else {
        console.log('Token refresh failed:', data.message);
        logout();
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
          router.push('/login');
        }
        return false;
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      logout();
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
        router.push('/login');
      }
      return false;
    }
  }, [logout, router]);

  // Initialize authentication state from localStorage if available
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('sellerAccessToken');
      const storedSeller = localStorage.getItem('sellerProfile');
      const storedStaff = localStorage.getItem('staffProfile');
      const storedUserType = localStorage.getItem('userType') as 'seller' | 'staff' | null;
      const storedRole = localStorage.getItem('userRole');

      // Check if token exists and is not expired
      if (storedToken) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.log('Token expired, clearing auth data');
          logout();
          setLoading(false);
          
          // Redirect to login if not already on auth pages
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
            router.push('/login');
          }
          return;
        }

        // Token is valid, set it
        setAccessToken(storedToken);
        setUserType(storedUserType);
        setRole(storedRole);
        
        // Restore user data from localStorage
        if (storedUserType === 'staff' && storedStaff) {
          try {
            const staffData = JSON.parse(storedStaff);
            setStaff(staffData);
          } catch (error) {
            console.error('Error parsing stored staff data:', error);
          }
        } else if (storedUserType === 'seller' && storedSeller) {
          try {
            const sellerData = JSON.parse(storedSeller);
            setSeller(sellerData);
          } catch (error) {
            console.error('Error parsing stored seller data:', error);
          }
        }
        
        // Try to validate token by fetching profile (only for sellers)
        if (storedUserType === 'seller') {
          try {
            const profileValid = await getProfile(storedToken);
            if (!profileValid) {
              // Profile fetch failed (401 or other error), token is invalid
              console.log('Token validation failed, clearing auth data');
              logout();
              setLoading(false);
              
              // Redirect to login if not already on auth pages
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
                router.push('/login');
              }
              return;
            }
          } catch (error) {
            console.error('Error validating token:', error);
            logout();
            
            // Redirect to login if not already on auth pages
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
              router.push('/login');
            }
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [router, getProfile, logout]);

  // Listen for unauthorized events from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Received unauthorized event, logging out');
      logout();
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
        router.push('/login');
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, router]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken) return;

    // Check token expiration periodically
    const checkInterval = setInterval(() => {
      if (isTokenExpired(accessToken)) {
        console.log('Token expired during session, attempting refresh');
        refreshToken().catch(() => {
          // Refresh failed, logout
          logout();
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password')) {
            router.push('/login');
          }
        });
      }
    }, 60 * 1000); // Check every minute

    const refreshInterval = setInterval(async () => {
      await refreshToken();
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => {
      clearInterval(checkInterval);
      clearInterval(refreshInterval);
    };
  }, [accessToken, router, refreshToken, logout]);

  const login = async (email: string, password: string) => {
    try {
      // Try seller login first
      const sellerData = await apiClient.post<{ 
        success: boolean; 
        message: string; 
        data?: { 
          seller?: SellerProfile; 
          user?: StaffProfile;
          accessToken: string; 
          refreshToken?: string;
          userType?: 'seller' | 'staff';
        } 
      }>(
        '/api/seller/auth/login',
        { email, password }
      );

      if (sellerData.success && sellerData.data) {
        const { seller: sellerProfile, user: staffProfile, accessToken: newToken, refreshToken: newRefreshToken, userType: responseUserType } = sellerData.data;

        // Determine user type from response
        const detectedUserType = responseUserType || (sellerProfile ? 'seller' : 'staff');
        
        if (detectedUserType === 'seller' && sellerProfile) {
          setSeller(sellerProfile);
          setStaff(null);
          setUserType('seller');
          setRole(null);
          setAccessToken(newToken);

          // Store in localStorage for persistence
          localStorage.setItem('sellerAccessToken', newToken);
          localStorage.setItem('sellerProfile', JSON.stringify(sellerProfile));
          localStorage.setItem('userType', 'seller');
          localStorage.removeItem('staffProfile');
          localStorage.removeItem('userRole');
          if (newRefreshToken) {
            localStorage.setItem('sellerRefreshToken', newRefreshToken);
          }
        } else if (detectedUserType === 'staff' && staffProfile) {
          setStaff(staffProfile);
          setSeller(null);
          setUserType('staff');
          setRole(staffProfile.role);
          setAccessToken(newToken);

          // Store in localStorage for persistence
          localStorage.setItem('sellerAccessToken', newToken);
          localStorage.setItem('staffProfile', JSON.stringify(staffProfile));
          localStorage.setItem('userType', 'staff');
          localStorage.setItem('userRole', staffProfile.role);
          localStorage.removeItem('sellerProfile');
          if (newRefreshToken) {
            localStorage.setItem('sellerRefreshToken', newRefreshToken);
          }
        }

        return { success: true, message: 'Login successful' };
      }

      // If seller login fails, try staff login
      try {
        const staffData = await apiClient.post<{ 
          success: boolean; 
          message: string; 
          data?: { 
            user: StaffProfile;
            accessToken: string; 
            refreshToken?: string;
            userType?: 'staff';
          } 
        }>(
          '/api/staff/login',
          { email, password }
        );

        if (staffData.success && staffData.data) {
          const { user: staffProfile, accessToken: newToken, refreshToken: newRefreshToken } = staffData.data;

          setStaff(staffProfile);
          setSeller(null);
          setUserType('staff');
          setRole(staffProfile.role);
          setAccessToken(newToken);

          // Store in localStorage for persistence
          localStorage.setItem('sellerAccessToken', newToken);
          localStorage.setItem('staffProfile', JSON.stringify(staffProfile));
          localStorage.setItem('userType', 'staff');
          localStorage.setItem('userRole', staffProfile.role);
          localStorage.removeItem('sellerProfile');
          if (newRefreshToken) {
            localStorage.setItem('sellerRefreshToken', newRefreshToken);
          }

          return { success: true, message: 'Login successful' };
        } else {
          return { success: false, message: staffData.message || 'Login failed' };
        }
      } catch (staffError: any) {
        // Both logins failed
        if (sellerData.message) {
          return { success: false, message: sellerData.message };
        }
        if (staffError?.data?.message) {
          return { success: false, message: staffError.data.message };
        }
        return { success: false, message: 'Login failed. Please check your credentials and try again.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);

      if (error?.data?.message) {
        return { success: false, message: error.data.message };
      }

      return { success: false, message: 'Login failed. Please check your connection and try again.' };
    }
  };

  const register = async (sellerData: any) => {
    try {
      const data = await apiClient.post<{ success: boolean; message: string }>(
        '/api/seller/auth/register',
        sellerData
      );

      if (data.success) {
        return { success: true, message: 'Seller registered successfully. Awaiting admin approval.' };
      }

      return { success: false, message: data.message };
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error?.data?.message) {
        return { success: false, message: error.data.message };
      }

      return { success: false, message: 'Registration failed. Please check your connection and try again.' };
    }
  };

  // Public getProfile that uses current accessToken
  const getProfilePublic = async (): Promise<boolean> => {
    return getProfile(accessToken);
  };

  const updateProfile = async (updates: Partial<SellerProfile>): Promise<boolean> => {
    if (!accessToken || !seller) return false;

    try {
      const data = await apiClient.request<{ success: boolean; message: string; data?: SellerProfile }>(
        '/api/seller/auth/profile',
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (data.success && data.data) {
        const updatedSeller = { ...seller, ...updates };
        setSeller(updatedSeller);
        // Update localStorage with new profile data
        localStorage.setItem('sellerProfile', JSON.stringify(updatedSeller));
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <SellerAuthContext.Provider value={{
      seller,
      staff,
      userType,
      role,
      accessToken,
      loading,
      login,
      register,
      logout,
      refreshToken,
      updateProfile,
      getProfile: getProfilePublic
    }}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    console.warn('useSellerAuth used without SellerAuthProvider - returning fallback');
    return {
      seller: null,
      staff: null,
      userType: null,
      role: null,
      accessToken: null,
      loading: false,
      login: async () => ({ success: false, message: 'Auth provider not available' }),
      register: async () => ({ success: false, message: 'Auth provider not available' }),
      logout: () => {},
      refreshToken: async () => false,
      updateProfile: async () => false,
      getProfile: async () => false
    };
  }
  return context;
}