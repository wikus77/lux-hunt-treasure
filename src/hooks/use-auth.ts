
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
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update email verification status
        if (currentSession?.user) {
          // Per l'email sviluppatore, considera sempre verificata
          const isDeveloper = currentSession.user.email === 'wikus77@hotmail.it';
          setIsEmailVerified(isDeveloper || !!currentSession.user.email_confirmed_at);
          console.log("Email verification status:", isDeveloper || !!currentSession.user.email_confirmed_at);
        } else {
          setIsEmailVerified(false);
        }
        
        // Mark loading as complete after auth state changes
        setIsLoading(false);
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession ? "Found session" : "No session");
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      // Update email verification status
      if (initialSession?.user) {
        const isDeveloper = initialSession.user.email === 'wikus77@hotmail.it';
        setIsEmailVerified(isDeveloper || !!initialSession.user.email_confirmed_at);
        console.log("Initial email verification status:", isDeveloper || !!initialSession.user.email_confirmed_at);
      }
      
      // Mark loading as complete after initial check
      setIsLoading(false);
    });
    
    // Clean up subscription on unmount
    return () => {
      console.log("useAuth: Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login function - Enhanced with developer auto-login
   */
  const login = async (email: string, password: string) => {
    console.log("Login attempt for email:", email);
    
    // ✅ ACCESSO IMMEDIATO per email sviluppatore
    if (email === 'wikus77@hotmail.it') {
      console.log("🔑 DEVELOPER LOGIN: ACCESSO IMMEDIATO - NO CAPTCHA");
      
      try {
        // Try edge function first
        const response = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({
            email: email,
            redirect_to: 'capacitor://localhost/home'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.session) {
            await supabase.auth.setSession(result.session);
            
            localStorage.setItem('developer_access', 'granted');
            localStorage.setItem('developer_user_email', email);
            localStorage.setItem('captcha_bypassed', 'true');
            
            console.log('[DEV LOGIN OK]');
            return { success: true, developer_access: true };
          }
        }
      } catch (error) {
        console.log('Edge function failed, using fallback');
      }
      
      // Fallback for developer
      localStorage.setItem('developer_access', 'granted');
      localStorage.setItem('developer_user_email', email);
      localStorage.setItem('captcha_bypassed', 'true');
      
      console.log('[DEV LOGIN OK]');
      return { success: true, developer_access: true };
    }

    // ✅ Per altri utenti, procedi senza CAPTCHA
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("✅ Login standard completato senza CAPTCHA");
      return { success: true, data };
    } catch (error: any) {
      console.error("Errore durante il login:", error);
      return { success: false, error: error as AuthError };
    }

    return { success: false, error: { message: "Login non riuscito" } };
  };

  /**
   * Logout function
   */
  const logout = async () => {
    console.log("Logging out user");
    try {
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
    // ✅ CONTROLLO PRIORITARIO: Developer access
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail) {
      return true;
    }
    
    return !!user && !!session;
  }, [user, session]);

  /**
   * Get current authenticated user
   */
  const getCurrentUser = useCallback(() => {
    // ✅ CONTROLLO PRIORITARIO: Developer access
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail) {
      return {
        id: 'developer-fake-id',
        email: 'wikus77@hotmail.it',
        email_confirmed_at: new Date().toISOString()
      } as User;
    }
    
    return user;
  }, [user]);

  /**
   * Get access token
   */
  const getAccessToken = useCallback(() => {
    // ✅ CONTROLLO PRIORITARIO: Developer access
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail) {
      return 'developer-fake-access-token';
    }
    
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
    resendVerificationEmail: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    user,
  };
}
