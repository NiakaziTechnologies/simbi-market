// @ts-nocheck
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId: string;
  storeName: string;
  createdAt: string;
  updatedAt: string;
}

interface UserAuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Placeholder for user authentication
      return { success: false, message: 'User authentication not implemented' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    // Placeholder implementation
    return false;
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      profile: user,
      loading,
      login,
      logout,
      updateProfile
    }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    console.warn('useUser used without UserAuthProvider - returning fallback');
    return {
      user: null,
      profile: null,
      loading: false,
      login: async () => ({ success: false, message: 'Auth provider not available' }),
      logout: () => {},
      updateProfile: async () => false
    };
  }
  return context;
}