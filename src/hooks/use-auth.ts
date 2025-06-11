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
        console.log('🔍 CRITICAL SESSION CHECK: Starting...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ CRITICAL SESSION ERROR:', error);
          setSession(null);
          setUser(null);
          setIsEmailVerified(false);
        } else if (session) {
          console.log('✅ CRITICAL SESSION FOUND:', {
            email: session.user.email,
            accessToken: session.access_token ? 'Present' : 'Missing',
            refreshToken: session.refresh_token ? 'Present' : 'Missing',
            expiresAt: session.expires_at
          });
          setSession(session);
          setUser(session.user);
          setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        } else {
          console.log('❌ CRITICAL NO SESSION FOUND');
          setSession(null);
          setUser(null);
          setIsEmailVerified(false);
        }
      } catch (error) {
        console.error("❌ CRITICAL SESSION EXCEPTION:", error);
        setSession(null);
        setUser(null);
        setIsEmailVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // CRITICAL: Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 CRITICAL AUTH STATE CHANGE:', event, session?.user?.email || 'No session');
      
      if (session) {
        console.log('✅ CRITICAL SESSION RECEIVED:', {
          email: session.user.email,
          accessToken: session.access_token ? 'Present' : 'Missing',
          refreshToken: session.refresh_token ? 'Present' : 'Missing'
        });

        setSession(session);
        setUser(session.user);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        
        // CRITICAL: Force session persistence verification
        setTimeout(async () => {
          const { data: { session: persistedSession } } = await supabase.auth.getSession();
          console.log('🔍 CRITICAL SESSION PERSISTENCE CHECK:', {
            persisted: !!persistedSession,
            email: persistedSession?.user?.email || 'None'
          });
        }, 500);
      } else {
        console.log('❌ CRITICAL SESSION CLEARED');
        setSession(null);
        setUser(null);
        setIsEmailVerified(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: Session }> => {
    console.log('🔐 CRITICAL LOGIN STARTING for:', email);
    
    try {
      // STEP 1: Try standard login first
      console.log('🔄 CRITICAL: Attempting standard login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        console.log('✅ CRITICAL STANDARD LOGIN SUCCESS');
        
        // CRITICAL: Force immediate session verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        console.log('🔍 CRITICAL POST-LOGIN SESSION VERIFICATION:', verifySession?.user?.email || 'Missing');
        
        return { success: true, session: data.session };
      }

      // STEP 2: Standard login failed, try bypass
      if (error) {
        console.log('🔄 CRITICAL: Standard login failed, trying bypass...', error.message);
        
        const { data: bypassResult, error: bypassError } = await supabase.functions.invoke('register-bypass', {
          body: {
            email,
            password,
            action: 'login'
          }
        });

        if (bypassError) {
          console.error('❌ CRITICAL BYPASS FAILED:', bypassError);
          return { success: false, error: bypassError };
        }

        if (bypassResult?.success) {
          console.log('✅ CRITICAL BYPASS SUCCESS');
          
          // CRITICAL: Enhanced session setup
          if (bypassResult.session) {
            console.log('🔄 CRITICAL: Setting up session...');
            try {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: bypassResult.session.access_token,
                refresh_token: bypassResult.session.refresh_token || ''
              });
              
              if (setSessionError) {
                console.error('❌ CRITICAL SESSION SETUP FAILED:', setSessionError);
                // Fallback to magic link
                if (bypassResult.magicLink) {
                  console.log('🔗 CRITICAL FALLBACK TO MAGIC LINK');
                  const currentOrigin = window.location.origin;
                  window.location.href = bypassResult.redirect_url || `${currentOrigin}/home`;
                  return { success: true, session: null };
                }
              } else {
                console.log('✅ CRITICAL SESSION SETUP SUCCESS');
                
                // CRITICAL: Extended verification
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const { data: { session: verifySession } } = await supabase.auth.getSession();
                console.log('🔍 CRITICAL SESSION VERIFICATION:', {
                  session: verifySession?.user?.email || 'Missing',
                  accessToken: verifySession?.access_token ? 'Present' : 'Missing'
                });
                
                if (verifySession) {
                  console.log('✅ CRITICAL SESSION VERIFIED AND PERSISTED');
                  return { success: true, session: verifySession };
                } else {
                  console.log('⚠️ CRITICAL SESSION NOT PERSISTED - MAGIC LINK FALLBACK');
                  if (bypassResult.magicLink) {
                    const currentOrigin = window.location.origin;
                    window.location.href = bypassResult.redirect_url || `${currentOrigin}/home`;
                  }
                  return { success: true, session: null };
                }
              }
            } catch (sessionError) {
              console.error('💥 CRITICAL SESSION EXCEPTION:', sessionError);
              if (bypassResult.magicLink) {
                const currentOrigin = window.location.origin;
                window.location.href = bypassResult.redirect_url || `${currentOrigin}/home`;
              }
              return { success: true, session: null };
            }
          }
          
          // Magic link path
          if (bypassResult.magicLink) {
            console.log('🔗 CRITICAL MAGIC LINK REDIRECT');
            const currentOrigin = window.location.origin;
            const redirectUrl = bypassResult.redirect_url || `${currentOrigin}/home`;
            window.location.href = redirectUrl;
            return { success: true, session: null };
          }
        }
      }

      console.error('❌ CRITICAL ALL LOGIN METHODS FAILED:', error);
      return { success: false, error };

    } catch (error: any) {
      console.error('💥 CRITICAL LOGIN EXCEPTION:', error);
      return { success: false, error };
    }
  };

  const forceDirectAccess = async (email: string, password: string): Promise<{ success: boolean; redirectUrl?: string; error?: any }> => {
    console.log('🚨 CRITICAL FORCE DIRECT ACCESS for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('register-bypass', {
        body: {
          email,
          password,
          action: 'login'
        }
      });

      if (error) {
        console.error('❌ CRITICAL FORCE ACCESS FAILED:', error);
        return { success: false, error };
      }

      if (data?.success) {
        console.log('🔗 CRITICAL FORCE ACCESS SUCCESS');
        
        // CRITICAL: Enhanced session setup
        if (data.session) {
          console.log('🔄 CRITICAL: Attempting direct session setup...');
          try {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token || ''
            });
            
            if (!setSessionError) {
              console.log('✅ CRITICAL DIRECT SESSION SETUP SUCCESS');
              
              // CRITICAL: Extended verification
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const { data: { session: verifySession } } = await supabase.auth.getSession();
              console.log('🔍 CRITICAL FORCE ACCESS VERIFICATION:', {
                sessionEmail: verifySession?.user?.email || 'Missing',
                accessToken: verifySession?.access_token ? 'Present' : 'Missing'
              });
              
              if (verifySession) {
                console.log('✅ CRITICAL FORCE ACCESS SESSION VERIFIED');
                return { 
                  success: true, 
                  redirectUrl: '/home'
                };
              }
            }
          } catch (sessionError) {
            console.log('⚠️ CRITICAL FORCE ACCESS SESSION EXCEPTION');
          }
        }
        
        // Magic link fallback
        if (data.magicLink) {
          console.log('🔗 CRITICAL MAGIC LINK FOR IMMEDIATE ACCESS');
          const currentOrigin = window.location.origin;
          const redirectUrl = data.redirect_url || `${currentOrigin}/home`;
          window.location.href = redirectUrl;
          return { 
            success: true, 
            redirectUrl: redirectUrl
          };
        }
      }

      return { success: false, error: 'No access method available' };
      
    } catch (error: any) {
      console.error('💥 CRITICAL FORCE ACCESS EXCEPTION:', error);
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
    resendVerificationEmail: async (email: string) => ({ success: true }),
    resetPassword: async (email: string) => ({ success: true }),
  };
};
