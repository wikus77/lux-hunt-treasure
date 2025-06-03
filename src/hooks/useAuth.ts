
import { useState, useEffect, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from '@/contexts/auth/types';

/**
 * Hook for authentication functionality using Supabase Auth.
 * Handles login, registration, session management, and email verification.
 */
export function useAuth(): Omit<AuthContextType, 'userRole' | 'hasRole' | 'isRoleLoading'> {
  // Developer bypass - always return valid session for wikus77@hotmail.it
  const developerUser = {
    id: "dev-user-id",
    email: "wikus77@hotmail.it",
    role: "developer",
    aud: "authenticated",
    app_metadata: { provider: "email" },
    user_metadata: { name: "Wikus Developer" },
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
  } as User;

  const developerSession = {
    access_token: "dev-token",
    refresh_token: "dev-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user: developerUser
  } as Session;

  // For developer, return mocked auth state immediately
  return {
    session: developerSession,
    isLoading: false,
    loading: false,
    error: null,
    isEmailVerified: true,
    isAuthenticated: true,
    login: async (email: string, password: string, captchaToken?: string) => {
      return { success: true, data: { user: developerUser, session: developerSession } };
    },
    logout: async () => {
      console.log("Developer logout - no action needed");
    },
    getCurrentUser: () => developerUser,
    getAccessToken: () => "dev-token",
    resendVerificationEmail: async (email: string) => {
      return { success: true };
    },
    resetPassword: async (email: string) => {
      return { success: true };
    },
    user: developerUser,
  };
}
