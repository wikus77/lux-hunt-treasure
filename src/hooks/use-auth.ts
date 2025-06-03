
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    console.log("useAuth: Initializing auth state");
    
    // Check for developer bypass first
    const checkDeveloperBypass = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      const developerBypassActive = sessionStorage.getItem('developer_bypass_active') === 'true';
      const developerUser = sessionStorage.getItem('developer_bypass_user');
      
      if (isCapacitorApp && developerBypassActive && developerUser) {
        console.log("🔓 DEVELOPER BYPASS: Using session storage user");
        const fakeUser = JSON.parse(developerUser) as User;
        setUser(fakeUser);
        setIsEmailVerified(true);
        setIsLoading(false);
        return true;
      }
      return false;
    };
    
    // If developer bypass is active, skip normal auth
    if (checkDeveloperBypass()) {
      return;
    }
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
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
            console.log("Email verification status:", !!currentUser.email_confirmed_at);
          } else {
            setIsEmailVerified(false);
          }
        }
        
        // Mark loading as complete after auth state changes
        setIsLoading(false);
      }
    );
    
    // Then check for existing session with forced fetch
    const checkSession = async () => {
      try {
        console.log("🔍 Force checking existing session...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", initialSession ? "Found session" : "No session");
        
        setSession(initialSession);
        const initialUser = initialSession?.user ?? null;
        
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
        console.error("Error checking session:", error);
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
      const options: any = {};
      
      if (captchaToken) {
        options.options = {
          captchaToken: captchaToken
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        ...options
      });

      if (error) {
        console.error("Login error:", error.message);
        return { success: false, error };
      }

      console.log("Login successful for:", email);
      
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
      // Clear developer bypass if active
      sessionStorage.removeItem('developer_bypass_user');
      sessionStorage.removeItem('developer_bypass_active');
      
      await supabase.auth.signOut();
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
    // Check for developer bypass first
    const isCapacitorApp = !!(window as any).Capacitor;
    const developerBypassActive = sessionStorage.getItem('developer_bypass_active') === 'true';
    
    if (isCapacitorApp && developerBypassActive) {
      console.log("🔓 Developer bypass: always authenticated in Capacitor");
      return true;
    }
    
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
