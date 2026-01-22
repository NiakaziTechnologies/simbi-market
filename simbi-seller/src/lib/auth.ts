// @ts-nocheck

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  storeName?: string;
  phoneNumber?: string;
  nationalId?: string;
  businessOwnerName?: string;
  businessOwnerEmail?: string;
  businessOwnerPhone?: string;
  storeCountry?: string;
  storeCity?: string;
  storeAddress1?: string;
  storeAddress2?: string;
  postalCode?: string;
  profileImage?: string;
  createdAt?: any;
  updatedAt?: any;
  vatNumber?: string;
}
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  storeName?: string;
  phoneNumber?: string;
  nationalId?: string;
  businessOwnerName?: string;
  businessOwnerEmail?: string;
  businessOwnerPhone?: string;
  storeCountry?: string;
  storeCity?: string;
  storeAddress1?: string;
  storeAddress2?: string;
  postalCode?: string;
  vatNumber?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  storeName?: string;
  phoneNumber?: string;
  nationalId?: string;
  businessOwnerName?: string;
  businessOwnerEmail?: string;
  businessOwnerPhone?: string;
  storeCountry?: string;
  storeCity?: string;
  storeAddress1?: string;
  storeAddress2?: string;
  postalCode?: string;
  vatNumber?: string;
}

// Authentication service class - API-based (no Firebase)
export class AuthService {
  // Register new user - API-based
  static async registerUser(userData: RegisterData): Promise<AuthUser> {
    console.log('🔄 Starting API registration for:', userData.email);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        // Convert API response to AuthUser format
        const user: AuthUser = {
          uid: data.data.id || data.data.uid,
          email: data.data.email,
          displayName: data.data.displayName,
          storeName: data.data.storeName,
          phoneNumber: data.data.phoneNumber,
          nationalId: data.data.nationalId,
          businessOwnerName: data.data.businessOwnerName,
          businessOwnerEmail: data.data.businessOwnerEmail,
          businessOwnerPhone: data.data.businessOwnerPhone,
          storeCountry: data.data.storeCountry,
          storeCity: data.data.storeCity,
          storeAddress1: data.data.storeAddress1,
          storeAddress2: data.data.storeAddress2,
          postalCode: data.data.postalCode,
          vatNumber: data.data.vatNumber,
          profileImage: data.data.profileImage,
          createdAt: data.data.createdAt || new Date().toISOString(),
          updatedAt: data.data.updatedAt || new Date().toISOString(),
        };

        console.log('🎉 Registration completed successfully for user:', user.uid);
        return user;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user - API-based
  static async loginUser(credentials: LoginCredentials): Promise<AuthUser> {
    console.log('🔄 Starting API login for:', credentials.email);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        // Convert API response to AuthUser format
        const user: AuthUser = {
          uid: data.data.user.id || data.data.user.uid,
          email: data.data.user.email,
          displayName: data.data.user.displayName,
          storeName: data.data.user.storeName,
          phoneNumber: data.data.user.phoneNumber,
          nationalId: data.data.user.nationalId,
          businessOwnerName: data.data.user.businessOwnerName,
          businessOwnerEmail: data.data.user.businessOwnerEmail,
          businessOwnerPhone: data.data.user.businessOwnerPhone,
          storeCountry: data.data.user.storeCountry,
          storeCity: data.data.user.storeCity,
          storeAddress1: data.data.user.storeAddress1,
          storeAddress2: data.data.user.storeAddress2,
          postalCode: data.data.user.postalCode,
          vatNumber: data.data.user.vatNumber,
          profileImage: data.data.user.profileImage,
          createdAt: data.data.user.createdAt || new Date().toISOString(),
          updatedAt: data.data.user.updatedAt || new Date().toISOString(),
        };

        console.log('🎉 Login completed successfully for user:', user.uid);
        return user;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Logout (API-based cleanup)
  static async logout(): Promise<void> {
    try {
      // Call logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ API logout successful');
      }
    } catch (error) {
      console.log('API logout failed or not available:', error);
    }
  }

  // Get current user from API token (for API routes)
  static async getCurrentUserFromToken(token: string): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            uid: data.data.id || data.data.uid,
            email: data.data.email,
            displayName: data.data.displayName,
            storeName: data.data.storeName,
            phoneNumber: data.data.phoneNumber,
            nationalId: data.data.nationalId,
            businessOwnerName: data.data.businessOwnerName,
            businessOwnerEmail: data.data.businessOwnerEmail,
            businessOwnerPhone: data.data.businessOwnerPhone,
            storeCountry: data.data.storeCountry,
            storeCity: data.data.storeCity,
            storeAddress1: data.data.storeAddress1,
            storeAddress2: data.data.storeAddress2,
            postalCode: data.data.postalCode,
            vatNumber: data.data.vatNumber,
            profileImage: data.data.profileImage,
            createdAt: data.data.createdAt || new Date().toISOString(),
            updatedAt: data.data.updatedAt || new Date().toISOString(),
          };
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Error getting current user from token:', error);
      return null;
    }
  }
}

// Utility functions for API routes
export async function authenticateRequest(request: Request): Promise<AuthUser> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required. Please provide a valid Bearer token.');
  }

  const token = authHeader.substring(7);
  if (!token || token === '') {
    throw new Error('Authentication token is missing or empty.');
  }

  const user = await AuthService.getCurrentUserFromToken(token);

  if (!user) {
    throw new Error('Invalid or expired authentication token.');
  }

  return user;
}