
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
    console.log("🔑 Setting up automatic developer authentication");
    
    // AUTOMATIC DEVELOPER ACCESS - NO CAPTCHA, NO VERIFICATION
    const setupDeveloperAuth = async () => {
      const developerEmail = 'wikus77@hotmail.it';
      
      try {
        console.log('🔑 Attempting automatic developer login');
        
        // Call the login-no-captcha function directly
        const { data, error } = await supabase.functions.invoke('login-no-captcha', {
          body: { email: developerEmail }
        });

        if (error) {
          console.error('❌ Developer auth error:', error);
          // Fallback to normal session check
          await checkExistingSession();
          return;
        }

        if (data?.session) {
          console.log('✅ Setting developer session automatically');
          
          // Set the session directly - NO CAPTCHA REQUIRED
          const { error: setSessionError } = await supabase.auth.setSession(data.session);
          
          if (setSessionError) {
            console.error('❌ Error setting session:', setSessionError);
            await checkExistingSession();
          } else {
            console.log('✅ Developer session set successfully');
            setSession(data.session);
            setUser(data.session.user);
            setIsEmailVerified(true); // Developer always verified
            setIsLoading(false);
            
            // Force redirect to /home
            if (window.location.pathname === '/' || window.location.pathname === '/login') {
              window.location.href = '/home';
            }
            return;
          }
        }
      } catch (error) {
        console.error('❌ Exception in developer auth setup:', error);
        await checkExistingSession();
      }
    };

    const checkExistingSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const session = data?.session;
        const user = session?.user || null;
        
        console.log("Session check:", user ? "Authenticated" : "Not authenticated");
        
        setSession(session);
        setUser(user);
        setIsEmailVerified(user?.email === 'wikus77@hotmail.it' || !!user?.email_confirmed_at);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
        setUser(null);
        setIsEmailVerified(false);
        setIsLoading(false);
      }
    };

    // Start automatic developer auth immediately
    setupDeveloperAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        
        setSession(session);
        setUser(session?.user || null);
        setIsEmailVerified(session?.user?.email === 'wikus77@hotmail.it' || !!session?.user?.email_confirmed_at);
        setIsLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // IMMEDIATE ACCESS for developer email - NO CAPTCHA, NO VERIFICATION
      if (email === 'wikus77@hotmail.it') {
        console.log('🔑 DEVELOPER LOGIN: Direct access - NO CAPTCHA');
        
        const { data, error } = await supabase.functions.invoke('login-no-captcha', {
          body: { email }
        });

        if (error) throw error;

        if (data?.session) {
          const { error: setSessionError } = await supabase.auth.setSession(data.session);
          
          if (setSessionError) throw setSessionError;
          
          toast.success("Developer login successful");
          
          // Immediate redirect to /home
          window.location.href = '/home';
          return { success: true, developer_access: true };
        }
      }

      // For other users, standard login WITHOUT CAPTCHA
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Login successful");
      return { success: true, data };
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login error", {
        description: error.message || "Check your credentials and try again",
      });
      return { success: false, error: error as AuthError };
    }
  };

  const logout = async () => {
    try {
      console.log('🔒 Logging out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logout successful");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout error", {
        description: error.message || "An error occurred during logout",
      });
      throw error;
    }
  };

  const isAuthenticated = useCallback(() => {
    return !!user && !!session;
  }, [user, session]);

  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  const getAccessToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

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
    resendVerificationEmail,
    resetPassword,
    user,
  };
}
