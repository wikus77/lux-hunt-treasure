
import { useState, useEffect, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from '@/contexts/auth/types';

/**
 * Hook for authentication functionality using Supabase Auth.
 * Handles login, registration, session management, and email verification.
 */
export function useAuth(): AuthContextType {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
          setIsEmailVerified(!!currentSession.user.email_confirmed_at);
          console.log("Email verification status:", !!currentSession.user.email_confirmed_at);
        } else {
          setIsEmailVerified(false);
          // Clear role when logging out
          setUserRole(null);
          localStorage.removeItem('userRole');
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
        setIsEmailVerified(!!initialSession.user.email_confirmed_at);
        console.log("Initial email verification status:", !!initialSession.user.email_confirmed_at);
        
        // Get user role from localStorage
        const savedRole = localStorage.getItem('userRole');
        if (savedRole) {
          setUserRole(savedRole);
        }
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
   * Login function using email and password
   */
  const login = async (email: string, password: string) => {
    console.log("Login attempt for email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error.message);
        return { success: false, error };
      }

      console.log("Login successful for:", email);
      
      // Fetch user role
      if (data.user) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
            
          if (profileData?.role) {
            setUserRole(profileData.role);
            localStorage.setItem('userRole', profileData.role);
          } else {
            // Default to 'user' role if not specified
            setUserRole('user');
            localStorage.setItem('userRole', 'user');
          }
        } catch (e) {
          console.error("Error fetching user role:", e);
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
      // Clear role when logging out
      setUserRole(null);
      localStorage.removeItem('userRole');
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
  
  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    if (!userRole) return false;
    
    // Admin has access to everything
    if (userRole === 'admin') return true;
    
    // Exact role match
    return userRole === role;
  };

  return {
    session,
    isLoading,
    isEmailVerified,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail,
    resetPassword,
    userRole,
    hasRole,
  };
}
