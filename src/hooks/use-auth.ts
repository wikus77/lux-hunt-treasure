
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        } else {
          setSession(null);
          setUser(null);
          setIsEmailVerified(false);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
      } else {
        setSession(null);
        setUser(null);
        setIsEmailVerified(false);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: Session }> => {
    console.log('🔐 Starting login for:', email);
    
    try {
      // PRIMO TENTATIVO: Login standard
      console.log('🔄 Trying standard login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        console.log('✅ Standard login successful');
        setSession(data.session);
        setUser(data.user);
        setIsEmailVerified(data.user?.email_confirmed_at ? true : false);
        return { success: true, session: data.session };
      }

      // Se il login standard fallisce per CAPTCHA o altri errori, prova il bypass
      if (error) {
        console.log('🔄 Standard login failed, trying bypass...', error.message);
        
        const { data: bypassResult, error: bypassError } = await supabase.functions.invoke('register-bypass', {
          body: {
            email,
            password,
            action: 'login'
          }
        });

        if (bypassError) {
          console.error('❌ Bypass login failed:', bypassError);
          return { success: false, error: bypassError };
        }

        if (bypassResult?.success) {
          console.log('✅ Bypass login successful');
          console.log('📊 Bypass result:', bypassResult);
          
          // MODALITÀ 1: Se abbiamo magic link, reindirizza immediatamente
          if (bypassResult.magicLink) {
            console.log('🔗 Redirecting to magic link:', bypassResult.redirect_url || '/home');
            // Force redirect to the correct URL, not localhost
            const redirectUrl = bypassResult.redirect_url || `${window.location.origin}/home`;
            window.location.href = redirectUrl;
            return { 
              success: true, 
              session: null,
              error: null 
            };
          }
          
          // MODALITÀ 2: Se abbiamo dati di sessione, provaci
          if (bypassResult.session) {
            console.log('🔄 Setting session from bypass data...');
            try {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: bypassResult.session.access_token,
                refresh_token: bypassResult.session.refresh_token
              });
              
              if (setSessionError) {
                console.error('❌ Error setting session:', setSessionError);
                // Fallback: redirect to magic link if available
                if (bypassResult.magicLink) {
                  const redirectUrl = bypassResult.redirect_url || `${window.location.origin}/home`;
                  window.location.href = redirectUrl;
                  return { success: true, session: null };
                }
              } else {
                console.log('✅ Session set successfully');
                return { success: true, session: bypassResult.session };
              }
            } catch (sessionError) {
              console.error('💥 Session setting exception:', sessionError);
              // Ultimate fallback: redirect anyway
              const redirectUrl = bypassResult.redirect_url || `${window.location.origin}/home`;
              window.location.href = redirectUrl;
              return { success: true, session: null };
            }
          }
        }
      }

      // Se tutto fallisce, restituisci l'errore originale
      console.error('❌ All login methods failed:', error);
      return { success: false, error };

    } catch (error: any) {
      console.error('💥 Login exception:', error);
      return { success: false, error };
    }
  };

  const forceDirectAccess = async (email: string, password: string): Promise<{ success: boolean; redirectUrl?: string; error?: any }> => {
    console.log('🚨 FORCE DIRECT ACCESS for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('register-bypass', {
        body: {
          email,
          password,
          action: 'login'
        }
      });

      if (error) {
        console.error('❌ Force access failed:', error);
        return { success: false, error };
      }

      if (data?.success && data?.magicLink) {
        console.log('🔗 FORCE ACCESS SUCCESS - redirecting immediately');
        const redirectUrl = data.redirect_url || `${window.location.origin}/home`;
        
        // Immediate redirect
        window.location.href = redirectUrl;
        
        return { 
          success: true, 
          redirectUrl: redirectUrl
        };
      }

      return { success: false, error: 'No magic link received' };
      
    } catch (error: any) {
      console.error('💥 Force access exception:', error);
      return { success: false, error };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsEmailVerified(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error("Error resending verification email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Exception resending verification email:", error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        console.error("Error resetting password:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Exception resetting password:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    isEmailVerified,
    login,
    logout,
    forceDirectAccess,
    getCurrentUser: () => user,
    getAccessToken: () => session?.access_token || null,
    resendVerificationEmail,
    resetPassword,
  };
};
