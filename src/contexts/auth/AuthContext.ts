
import { createContext } from 'react';

interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  userRole: string | null;
  getCurrentUser: () => any | null;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

// FIX APPLICATO MANUALMENTE - Create context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
