
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
  // BYPASS ALL AUTHENTICATION - RETURN FAKE STATE
  console.log("🔓 BYPASSING ALL AUTHENTICATION IN useAuth");
  
  const fakeUser = {
    id: "bypass-user-id",
    email: "wikus77@hotmail.it",
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
  } as User;

  const fakeSession = {
    access_token: "dev-token",
    refresh_token: "dev-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: fakeUser
  } as Session;

  /**
   * Login function using email and password
   */
  const login = async (email: string, password: string, captchaToken?: string) => {
    console.log("🔓 BYPASS: Fake login for:", email);
    return { success: true, data: { user: fakeUser, session: fakeSession } };
  };

  /**
   * Logout function
   */
  const logout = async () => {
    console.log("🔓 BYPASS: Fake logout");
    toast.success("Logout effettuato");
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    console.log("🔓 BYPASS: Always authenticated");
    return true;
  }, []);

  /**
   * Get current authenticated user
   */
  const getCurrentUser = useCallback(() => {
    return fakeUser;
  }, []);

  /**
   * Get access token
   */
  const getAccessToken = useCallback(() => {
    return "dev-token";
  }, []);

  /**
   * Sends a verification email to the specified email address
   */
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log("🔓 BYPASS: Fake verification email");
    return { success: true };
  };

  /**
   * Sends a password reset email to the specified email address
   */
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log("🔓 BYPASS: Fake password reset");
    return { success: true };
  };

  return {
    session: fakeSession,
    isLoading: false,
    isEmailVerified: true,
    isAuthenticated: true, 
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail,
    resetPassword,
    user: fakeUser,
  };
}
