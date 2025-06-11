import { useState, useEffect, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    console.log("useAuth: Initializing authentication");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const isDeveloper = currentSession.user.email === 'wikus77@hotmail.it';
          setIsEmailVerified(isDeveloper || !!currentSession.user.email_confirmed_at);
          
          if (event === 'SIGNED_IN') {
            console.log("✅ User successfully signed in:", currentSession.user.email);
          }
        } else {
          setIsEmailVerified(false);
        }
        
        setIsLoading(false);
      }
    );
    
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession ? "Found session" : "No session");
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        const isDeveloper = initialSession.user.email === 'wikus77@hotmail.it';
        setIsEmailVerified(isDeveloper || !!initialSession.user.email_confirmed_at);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      console.log("useAuth: Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError; session?: Session }> => {
    console.log("Login attempt for email:", email);
    
    try {
      // Emergency login for developer
      if (email === 'wikus77@hotmail.it') {
        console.log("🔓 DEVELOPER LOGIN - Using emergency function");
        console.log("📤 Calling edge function with body:", JSON.stringify({ email }));
        
        const { data, error } = await supabase.functions.invoke('login-no-captcha', {
          body: { email }
        });

        console.log("📥 Edge function response:", { data, error });

        if (error) {
          console.error("❌ Emergency login error:", error);
          return { success: false, error: error as AuthError };
        }

        if (data?.access_token && data?.refresh_token) {
          console.log("✅ Emergency tokens received");
          console.log("🎫 Access token length:", data.access_token.length);
          console.log("🎫 Refresh token length:", data.refresh_token.length);
          
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          });

          if (setSessionError) {
            console.error("❌ Session setting error:", setSessionError);
            return { success: false, error: setSessionError };
          }

          console.log("✅ Emergency session set successfully");
          return { success: true, session: data };
        } else {
          console.error("❌ No tokens in response:", data);
          return { success: false, error: { message: "No tokens received" } as AuthError };
        }
      }
      
      // Regular login for other users
      console.log("🔑 Regular login attempt for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("✅ Login completed successfully for:", email);
      return { success: true, session: data.session };
    } catch (error: any) {
      console.error("Error during login:", error);
      return { success: false, error: error as AuthError };
    }
  };

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
