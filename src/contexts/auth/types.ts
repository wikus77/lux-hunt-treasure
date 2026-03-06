
// APPLE-LOGIN-LOOP-PATCH: authHydrated + justSignedInAt for grace period anti-loop
export const JUST_SIGNED_IN_GRACE_MS = 15000;

export interface AuthContextType {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any; session?: any }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: any; data?: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  authHydrated: boolean;
  /** True after bootstrap getSession (success or failure); gate realtime/fetch to avoid lock contention. */
  authReady: boolean;
  justSignedInAt: number | null;
  isEmailVerified: boolean;
  getCurrentUser: () => User | null;
  getAccessToken: () => string | null;
  session: Session | null;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  userRole: string | null;
  hasRole: (role: string) => boolean;
  isRoleLoading: boolean;
  user: User | null;
}

export interface User {
  id: string;
  email?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  email_confirmed_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user: User;
}
