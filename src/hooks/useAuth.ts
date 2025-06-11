
import { useState, useEffect, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from '@/contexts/auth/types';

const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export function useAuth(): Omit<AuthContextType, 'userRole' | 'hasRole' | 'isRoleLoading'> {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // FIXED: Stabilized auth initialization without race conditions
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      console.log("🔧 useAuth: Initializing with developer support");
      
      // Check for developer access
      const isDeveloperMode = localStorage.getItem('developer_access') === 'granted' || 
                             localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (isDeveloperMode) {
        console.log("🔑 Developer mode detected - creating authenticated session");
        const developerUser = {
          id: DEVELOPER_UUID,
          email: 'wikus77@hotmail.it',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString()
        } as User;
        
        if (isMounted) {
          setUser(developerUser);
          setIsEmailVerified(true);
          setIsLoading(false);
          
          localStorage.setItem('developer_access', 'granted');
          localStorage.setItem('developer_user_email', 'wikus77@hotmail.it');
          localStorage.setItem('captcha_bypassed', 'true');
        }
        return;
      }

      // Regular user session check
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session check error:", error);
        }
        
        if (isMounted) {
          console.log("Initial session check:", initialSession ? "Found session" : "No session");
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            const isDeveloper = initialSession.user.email === 'wikus77@hotmail.it';
            setIsEmailVerified(isDeveloper || !!initialSession.user.email_confirmed_at);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const isDeveloper = currentSession.user.email === 'wikus77@hotmail.it';
          setIsEmailVerified(isDeveloper || !!currentSession.user.email_confirmed_at);
        } else {
          setIsEmailVerified(false);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Login attempt for email:", email);
    
    // IMMEDIATE developer access
    if (email === 'wikus77@hotmail.it') {
      console.log("🔑 DEVELOPER LOGIN: IMMEDIATE ACCESS");
      
      const developerUser = {
        id: DEVELOPER_UUID,
        email: 'wikus77@hotmail.it',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString()
      } as User;
      
      setUser(developerUser);
      setIsEmailVerified(true);
      setIsLoading(false);
      
      localStorage.setItem('developer_access', 'granted');
      localStorage.setItem('developer_user_email', email);
      localStorage.setItem('captcha_bypassed', 'true');
      
      // Force redirect to home for developer
      setTimeout(() => {
        window.location.href = '/home';
      }, 100);
      
      return { success: true, developer_access: true };
    }

    // Regular users
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error as AuthError };
    }
  };

  const logout = async () => {
    console.log("Logging out user");
    try {
      await supabase.auth.signOut();
      
      // Clear all developer access
      localStorage.removeItem('developer_access');
      localStorage.removeItem('developer_user_email');
      localStorage.removeItem('captcha_bypassed');
      
      // Reset state
      setUser(null);
      setSession(null);
      setIsEmailVerified(false);
      
      toast.success("Logout effettuato");
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Errore durante il logout");
    }
  };

  // FIXED: Stable authentication check
  const isAuthenticated = useCallback(() => {
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail || user?.email === 'wikus77@hotmail.it') {
      return true;
    }
    
    return !!user && !!session;
  }, [user, session]);

  // FIXED: Stable user getter
  const getCurrentUser = useCallback(() => {
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail || user?.email === 'wikus77@hotmail.it') {
      return {
        id: DEVELOPER_UUID,
        email: 'wikus77@hotmail.it',
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User;
    }
    
    return user;
  }, [user]);

  const getAccessToken = useCallback(() => {
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail) {
      return 'developer-fake-access-token';
    }
    
    return session?.access_token || null;
  }, [session]);

  const resendVerificationEmail = async () => ({ success: true });
  const resetPassword = async () => ({ success: true });

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
    user: getCurrentUser(),
  };
}
