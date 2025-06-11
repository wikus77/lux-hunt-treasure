
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
        console.log('🔍 INITIAL SESSION CHECK:', session?.user?.email || 'No session');

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

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'No session');
      
      // Don't update loading state immediately - wait for session to be processed
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        
        // Log session persistence check
        setTimeout(async () => {
          const { data: { session: persistedSession } } = await supabase.auth.getSession();
          console.log('✅ SESSION PERSISTED:', !!persistedSession, persistedSession?.user?.email);
          console.log('📦 LOCAL STORAGE TOKEN:', localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token') ? 'Present' : 'Missing');
        }, 100);
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
          
          // CRITICAL FIX: If we have session data, set it properly with await
          if (bypassResult.session) {
            console.log('🔄 Setting session from bypass data...');
            try {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: bypassResult.session.access_token,
                refresh_token: bypassResult.session.refresh_token
              });
              
              if (setSessionError) {
                console.error('❌ Error setting session:', setSessionError);
                // Fallback: use magic link redirect
                if (bypassResult.magicLink) {
                  console.log('🔗 Fallback to magic link redirect');
                  window.location.href = bypassResult.redirect_url || `${window.location.origin}/home`;
                  return { success: true, session: null };
                }
              } else {
                console.log('✅ Session set successfully - waiting for persistence...');
                
                // CRITICAL: Wait for session to be persisted before returning
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Verify session was persisted
                const { data: { session: verifySession } } = await supabase.auth.getSession();
                console.log('🔍 VERIFICATION SESSION:', verifySession?.user?.email || 'Missing');
                
                if (verifySession) {
                  console.log('✅ Session verified and persisted');
                  return { success: true, session: verifySession };
                } else {
                  console.log('⚠️ Session not persisted, using magic link fallback');
                  if (bypassResult.magicLink) {
                    window.location.href = bypassResult.redirect_url || `${window.location.origin}/home`;
                  }
                  return { success: true, session: null };
                }
              }
            } catch (sessionError) {
              console.error('💥 Session setting exception:', sessionError);
              // Ultimate fallback: redirect to magic link
              if (bypassResult.magicLink) {
                const redirectUrl = bypassResult.redirect_url || `${window.location.origin}/home`;
                window.location.href = redirectUrl;
              }
              return { success: true, session: null };
            }
          }
          
          // MODALITÀ MAGIC LINK: Se abbiamo magic link, reindirizza immediatamente
          if (bypassResult.magicLink) {
            console.log('🔗 Redirecting to magic link:', bypassResult.redirect_url || '/home');
            const redirectUrl = bypassResult.redirect_url || `${window.location.origin}/home`;
            window.location.href = redirectUrl;
            return { 
              success: true, 
              session: null,
              error: null 
            };
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

      if (data?.success) {
        console.log('🔗 FORCE ACCESS SUCCESS');
        
        // CRITICAL FIX: Try session first, then magic link
        if (data.session) {
          console.log('🔄 Attempting direct session setup...');
          try {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            });
            
            if (!setSessionError) {
              console.log('✅ Direct session setup successful - waiting for persistence...');
              
              // CRITICAL: Wait for session persistence
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Verify session is persisted
              const { data: { session: verifySession } } = await supabase.auth.getSession();
              console.log('🔍 SESSION VERIFICATION:', verifySession?.user?.email || 'Missing');
              console.log('📦 LOCAL STORAGE CHECK:', localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token') ? 'Present' : 'Missing');
              
              if (verifySession) {
                // Success - redirect to /home without using window.location
                console.log('✅ Session verified - programmatic redirect to /home');
                return { 
                  success: true, 
                  redirectUrl: '/home'
                };
              }
            } else {
              console.log('⚠️ Session setup failed, using magic link fallback');
            }
          } catch (sessionError) {
            console.log('⚠️ Session setup exception, using magic link fallback');
          }
        }
        
        // Magic link fallback
        if (data.magicLink) {
          console.log('🔗 Using magic link for immediate access');
          const redirectUrl = data.redirect_url || `${window.location.origin}/home`;
          
          // Use window.location for magic link as it's external
          window.location.href = redirectUrl;
          
          return { 
            success: true, 
            redirectUrl: redirectUrl
          };
        }
      }

      return { success: false, error: 'No access method available' };
      
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
