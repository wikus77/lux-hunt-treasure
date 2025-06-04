
import { useState, useEffect, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from '@/contexts/auth/types';

/**
 * Hook for authentication functionality using Supabase Auth.
 * Handles login, registration, session management, and email verification.
 * Enhanced for iOS WebView compatibility.
 */
export function useAuth(): Omit<AuthContextType, 'userRole' | 'hasRole' | 'isRoleLoading'> {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // Initialize auth state with iOS WebView compatibility
  useEffect(() => {
    console.log("🔍 useAuth: Initializing auth state");
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const initializeAuth = async () => {
      try {
        // First set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("🔄 useAuth: Auth state changed:", event, !!currentSession);
            
            // Handle session updates
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // Update email verification status
            if (currentSession?.user) {
              setIsEmailVerified(!!currentSession.user.email_confirmed_at);
              console.log("📧 useAuth: Email verification status:", !!currentSession.user.email_confirmed_at);
            } else {
              setIsEmailVerified(false);
            }
            
            // Mark loading as complete after auth state changes
            setIsLoading(false);
          }
        );
        
        // Then check for existing session with iOS WebView enhancement
        const checkSession = async () => {
          try {
            console.log("🔍 useAuth: Checking for existing session...");
            const { data: { session: initialSession }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error("❌ useAuth: Error getting session:", error);
              throw error;
            }
            
            console.log("📊 useAuth: Initial session check:", initialSession ? "Found session" : "No session");
            
            // iOS WebView fix: If we have a session, ensure it's properly set
            if (initialSession) {
              console.log("🍎 useAuth: iOS WebView session fix - ensuring session persistence");
              
              // Force session persistence in iOS WebView
              try {
                // Store session data in localStorage as backup for iOS
                const sessionData = {
                  access_token: initialSession.access_token,
                  refresh_token: initialSession.refresh_token,
                  user: initialSession.user
                };
                localStorage.setItem('supabase.session', JSON.stringify(sessionData));
                
                // Explicitly set the session to ensure it's properly recognized
                await supabase.auth.setSession({
                  access_token: initialSession.access_token,
                  refresh_token: initialSession.refresh_token,
                });
                
                console.log("✅ useAuth: iOS session persistence enforced");
              } catch (sessionError) {
                console.error("❌ useAuth: Error enforcing session persistence:", sessionError);
              }
            }
            
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            
            // Update email verification status
            if (initialSession?.user) {
              setIsEmailVerified(!!initialSession.user.email_confirmed_at);
              console.log("📧 useAuth: Initial email verification status:", !!initialSession.user.email_confirmed_at);
            }
            
            setIsLoading(false);
            retryCount = 0; // Reset retry count on success
            
          } catch (error) {
            console.error("❌ useAuth: Session check failed:", error);
            
            // Retry logic for iOS WebView issues
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 useAuth: Retrying session check (${retryCount}/${maxRetries})`);
              setTimeout(checkSession, 1000 * retryCount); // Exponential backoff
            } else {
              console.log("❌ useAuth: Max retries reached, marking as not loading");
              setIsLoading(false);
            }
          }
        };
        
        // Start session check
        await checkSession();
        
        // Clean up subscription on unmount
        return () => {
          console.log("🧹 useAuth: Cleaning up subscription");
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error("❌ useAuth: Initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function using email and password
   */
  const login = async (email: string, password: string, captchaToken?: string) => {
    console.log("🔐 useAuth: Login attempt for email:", email);
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
        console.error("❌ useAuth: Login error:", error.message);
        return { success: false, error };
      }

      console.log("✅ useAuth: Login successful for:", email);
      
      return { success: true, data };
    } catch (error) {
      console.error("❌ useAuth: Unexpected login error:", error);
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
    console.log("🚪 useAuth: Logging out user");
    try {
      // Clear localStorage backup for iOS
      localStorage.removeItem('supabase.session');
      
      await supabase.auth.signOut();
      toast.success("Logout effettuato");
    } catch (error) {
      console.error("❌ useAuth: Logout error:", error);
      toast.error("Errore durante il logout");
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    const result = !!user && !!session;
    console.log("🔍 useAuth: isAuthenticated check:", result);
    return result;
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
        console.error("❌ useAuth: Error sending verification email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("❌ useAuth: Exception sending verification email:", error);
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
        console.error("❌ useAuth: Error sending password reset email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("❌ useAuth: Exception sending password reset email:", error);
      return { success: false, error: error.message };
    }
  };

  console.log("📊 useAuth: Current state:", { 
    hasUser: !!user, 
    hasSession: !!session, 
    isLoading, 
    isAuthenticated: isAuthenticated() 
  });

  return {
    session,
    isLoading,
    isEmailVerified,
    isAuthenticated: isAuthenticated(), 
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail,
    resetPassword,
    user,
  };
}
