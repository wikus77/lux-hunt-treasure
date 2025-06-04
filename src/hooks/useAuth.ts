import { useState, useEffect, useCallback } from "react";
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from '@/contexts/auth/types';
import { Capacitor } from '@capacitor/core';

/**
 * Hook for authentication functionality using Supabase Auth.
 * Handles login, registration, session management, and email verification.
 */
export function useAuth(): Omit<AuthContextType, 'userRole' | 'hasRole' | 'isRoleLoading'> {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // Initialize auth state with better iOS WebView support
  useEffect(() => {
    console.log("🔄 useAuth: Initializing auth state with WebView enhancements");
    const isIOS = Capacitor.getPlatform() === 'ios';
    
    // First set up auth state listener with proper cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`🔐 Auth state changed: ${event}`, isIOS ? "(iOS WebView)" : "");
        
        if (currentSession) {
          console.log("✅ Session detected in auth state change");
          // Store session in localStorage explicitly for iOS WebView
          if (isIOS) {
            try {
              localStorage.setItem('supabase.auth.token', JSON.stringify(currentSession));
              console.log("📦 Session explicitly stored in localStorage for iOS");
            } catch (err) {
              console.error("❌ Failed to store session:", err);
            }
          }
        }
        
        setSession(currentSession);
        
        const currentUser = currentSession?.user ?? null;
        
        // Developer bypass for wikus77@hotmail.it
        if (currentUser?.email === "wikus77@hotmail.it") {
          console.log("🔓 Developer bypass: forcing email verification for wikus77@hotmail.it");
          const enhancedUser = {
            ...currentUser,
            email_confirmed_at: new Date().toISOString(),
          };
          setUser(enhancedUser);
          setIsEmailVerified(true);
        } else {
          setUser(currentUser);
          // Update email verification status
          if (currentUser) {
            setIsEmailVerified(!!currentUser.email_confirmed_at);
            console.log("📧 Email verification status:", !!currentUser.email_confirmed_at);
          } else {
            setIsEmailVerified(false);
          }
        }
        
        // Mark loading as complete after auth state changes
        setIsLoading(false);
      }
    );
    
    // Force session check with robust error handling and retries
    const checkSession = async (retryCount = 0) => {
      try {
        console.log(`🔍 Force checking existing session (attempt ${retryCount + 1})...`);
        
        // Try to get session from localStorage first for iOS WebView
        let cachedSession = null;
        if (isIOS) {
          try {
            const storedSession = localStorage.getItem('supabase.auth.token');
            if (storedSession) {
              cachedSession = JSON.parse(storedSession);
              console.log("📲 Found cached session in localStorage for iOS");
            }
          } catch (err) {
            console.warn("⚠️ Error parsing cached session:", err);
          }
        }
        
        // Always fetch from Supabase to verify
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Use either the fetched session or the cached one
        const effectiveSession = initialSession || cachedSession;
        
        console.log("Initial session check:", effectiveSession ? "Found session ✓" : "No session ✗");
        if (effectiveSession) {
          console.log("🆔 User ID:", effectiveSession.user?.id);
        }
        
        setSession(effectiveSession);
        const initialUser = effectiveSession?.user ?? null;
        
        // Developer bypass for wikus77@hotmail.it
        if (initialUser?.email === "wikus77@hotmail.it") {
          console.log("🔓 Developer bypass: forcing email verification for wikus77@hotmail.it");
          const enhancedUser = {
            ...initialUser,
            email_confirmed_at: new Date().toISOString(),
          };
          setUser(enhancedUser);
          setIsEmailVerified(true);
        } else {
          setUser(initialUser);
          // Update email verification status
          if (initialUser) {
            setIsEmailVerified(!!initialUser.email_confirmed_at);
            console.log("Initial email verification status:", !!initialUser.email_confirmed_at);
          }
        }
        
        // Mark loading as complete after initial check
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error checking session:", error);
        
        // Retry logic for iOS WebView (known to have intermittent issues)
        if (isIOS && retryCount < 2) {
          console.log(`⏳ Retrying session check in 1 second (attempt ${retryCount + 1}/3)...`);
          setTimeout(() => checkSession(retryCount + 1), 1000);
          return;
        }
        
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      console.log("useAuth: Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login function using email and password
   */
  const login = async (email: string, password: string, captchaToken?: string) => {
    console.log("Login attempt for email:", email);
    try {
      const options: any = {
        options: {
          // Force persist session to be true
          persistSession: true
        }
      };
      
      if (captchaToken) {
        options.options.captchaToken = captchaToken;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        ...options
      });

      if (error) {
        console.error("❌ Login error:", error.message);
        return { success: false, error };
      }

      console.log("✅ Login successful for:", email);
      
      // Force store session in localStorage for iOS WebView
      if (Capacitor.getPlatform() === 'ios' && data.session) {
        try {
          localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
          console.log("📦 Session explicitly stored in localStorage after login for iOS");
        } catch (err) {
          console.error("❌ Failed to store session after login:", err);
        }
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected login error:", error);
      return {
        success: false,
        error: { message: "Si è verificato un errore imprevisto durante l'accesso." } as AuthError
      };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    console.log("Logging out user");
    try {
      await supabase.auth.signOut();
      
      // Clear localStorage session for iOS WebView
      if (Capacitor.getPlatform() === 'ios') {
        try {
          localStorage.removeItem('supabase.auth.token');
          console.log("🗑️ Cleared cached session from localStorage for iOS");
        } catch (err) {
          console.error("❌ Failed to clear session:", err);
        }
      }
      
      toast.success("Logout effettuato");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Errore durante il logout");
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    // Developer bypass for wikus77@hotmail.it
    if (user?.email === "wikus77@hotmail.it") {
      console.log("🔓 Developer bypass: wikus77@hotmail.it always authenticated");
      return true;
    }
    
    return !!user && !!session;
  }, [user, session]);

  /**
   * Get current authenticated user
   */
  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  /**
   * Get access token
   */
  const getAccessToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  /**
   * Sends a verification email to the specified email address
   */
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error("Error sending verification email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Exception sending verification email:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sends a password reset email to the specified email address
   */
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Exception sending password reset email:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    session,
    isLoading,
    isEmailVerified,
    isAuthenticated: isAuthenticated(), 
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail: async (email: string) => {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });

        if (error) {
          console.error("Error sending verification email:", error);
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (error: any) {
        console.error("Exception sending verification email:", error);
        return { success: false, error: error.message };
      }
    },
    resetPassword: async (email: string) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });

        if (error) {
          console.error("Error sending password reset email:", error);
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (error: any) {
        console.error("Exception sending password reset email:", error);
        return { success: false, error: error.message };
      }
    },
    user,
  };
}
