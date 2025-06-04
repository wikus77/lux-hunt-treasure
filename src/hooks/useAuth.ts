
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // ✅ ACCESSO AUTOMATICO IMMEDIATO per sviluppatore
    const setupDeveloperAuth = async () => {
      const developerEmail = 'wikus77@hotmail.it';
      
      console.log('🔑 Setting up automatic developer authentication');
      
      try {
        const { data, error } = await supabase.functions.invoke('login-no-captcha', {
          body: { email: developerEmail }
        });

        if (error) throw error;

        if (data?.session) {
          console.log('✅ Setting developer session automatically');
          const { error: setSessionError } = await supabase.auth.setSession(data.session);
          
          if (setSessionError) {
            console.error('❌ Error setting session:', setSessionError);
          } else {
            console.log('✅ Developer session set successfully');
            setAuthState({
              user: data.session.user,
              session: data.session,
              loading: false,
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error in automatic auth setup:', error);
      }
      
      // Fallback to normal session check
      checkExistingSession();
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
        
        setAuthState({
          user,
          session,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error checking session:", error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    // Start automatic developer auth
    setupDeveloperAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: null,
        });
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
      // ✅ ACCESSO IMMEDIATO per email sviluppatore
      if (email === 'wikus77@hotmail.it') {
        console.log('🔑 DEVELOPER LOGIN: Direct access');
        
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
          return;
        }
      }

      // For other users, standard login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Login successful");
      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login error", {
        description: error.message || "Check your credentials and try again",
      });
      throw error;
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

  return {
    ...authState,
    login,
    logout,
  };
}
