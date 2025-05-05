
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  logout: () => Promise<void>;
  getCurrentUser: () => any;
  getAccessToken: () => string | null;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: any }>;
}
