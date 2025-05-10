
export interface AuthContextType {
  user: any | null;
  signIn?: (email: string, password: string) => Promise<void>;
  signUp?: (email: string, password: string, data?: any) => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updateUserProfile?: (data: any) => Promise<void>;
  loading?: boolean;
  logout?: () => void;
  signOut?: () => void;
  
  // Add missing properties
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  getCurrentUser: () => any;
  getAccessToken?: () => string | null;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  session?: any;
  
  // Role-related properties
  userRole?: string | null;
  hasRole?: (role: string) => boolean;
  isRoleLoading?: boolean;
  
  // Login method
  login?: (email: string, password: string) => Promise<any>;
}

// Add User type needed by AuthProvider
export interface User {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: any;
}
