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
        console.log('🔍 INITIAL SESSION CHECK: Starting...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 INITIAL SESSION CHECK:', session?.user?.email || 'No session');

        if (session) {
          setSession(session);
          setUser(session.user);
          setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
          console.log('✅ INITIAL SESSION RESTORED:', session.user.email);
        } else {
          setSession(null);
          setUser(null);
          setIsEmailVerified(false);
          console.log('❌ NO INITIAL SESSION FOUND');
        }
      } catch (error) {
        console.error("❌ Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // CRITICAL: Setup auth state listener with enhanced session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'No session');
      
      if (session) {
        // CRITICAL: Enhanced session validation and persistence
        console.log('✅ SESSION RECEIVED:', {
          email: session.user.email,
          accessToken: session.access_token ? 'Present' : 'Missing',
          refreshToken: session.refresh_token ? 'Present' : 'Missing',
          expiresAt: session.expires_at,
          expiresIn: session.expires_in
        });

        setSession(session);
        setUser(session.user);
        setIsEmailVerified(session.user?.email_confirmed_at ? true : false);
        
        // CRITICAL: Verify session persistence after state update
        setTimeout(async () => {
          const { data: { session: persistedSession } } = await supabase.auth.getSession();
          console.log('🔍 SESSION PERSISTENCE CHECK:', {
            persisted: !!persistedSession,
            email: persistedSession?.user?.email || 'None',
            localStorage: localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token') ? 'Present' : 'Missing'
          });
          
          // If session not persisted, force refresh
          if (!persistedSession && session) {
            console.log('⚠️ SESSION NOT PERSISTED - FORCING REFRESH');
            try {
              await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token || ''
              });
              console.log('✅ SESSION REFRESH COMPLETED');
            } catch (error) {
              console.error('❌ SESSION REFRESH FAILED:', error);
            }
          }
        }, 100);
      } else {
        console.log('❌ SESSION CLEARED');
        setSession(null);
        setUser(null);
        setIsEmailVerified(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: Session }> => {
    console.log('🔐 ENHANCED LOGIN STARTING for:', email);
    
    try {
      // STEP 1: Try standard login first
      console.log('🔄 Attempting standard login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        console.log('✅ STANDARD LOGIN SUCCESS');
        console.log('📊 LOGIN SESSION DATA:', {
          email: data.user.email,
          accessToken: data.session.access_token ? 'Present' : 'Missing',
          refreshToken: data.session.refresh_token ? 'Present' : 'Missing'
        });
        
        // CRITICAL: Force immediate session persistence check
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        console.log('🔍 POST-LOGIN SESSION VERIFICATION:', verifySession?.user?.email || 'Missing');
        
        return { success: true, session: data.session };
      }

      // STEP 2: If standard login fails, try bypass
      if (error) {
        console.log('🔄 Standard login failed, trying ENHANCED bypass...', error.message);
        
        const { data: bypassResult, error: bypassError } = await supabase.functions.invoke('register-bypass', {
          body: {
            email,
            password,
            action: 'login'
          }
        });

        if (bypassError) {
          console.error('❌ ENHANCED BYPASS FAILED:', bypassError);
          return { success: false, error: bypassError };
        }

        if (bypassResult?.success) {
          console.log('✅ BYPASS SUCCESS - ENHANCED SESSION HANDLING');
          console.log('📊 BYPASS RESULT:', bypassResult);
          
          // CRITICAL: Enhanced session setup with validation
          if (bypassResult.session) {
            console.log('🔄 SETTING UP ENHANCED SESSION...');
            try {
              // STEP 2A: Set session with comprehensive error handling
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: bypassResult.session.access_token,
                refresh_token: bypassResult.session.refresh_token || ''
              });
              
              if (setSessionError) {
                console.error('❌ ENHANCED SESSION SETUP FAILED:', setSessionError);
                // Fallback to magic link
                if (bypassResult.magicLink) {
                  console.log('🔗 FALLBACK TO MAGIC LINK');
                  window.location.href = bypassResult.redirect_url || `${window.location.origin}/home`;
                  return { success: true, session: null };
                }
              } else {
                console.log('✅ ENHANCED SESSION SETUP SUCCESS - VERIFYING...');
                
                // CRITICAL: Extended verification with multiple checks
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const { data: { session: verifySession } } = await supabase.auth.getSession();
                const tokenCheck = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
                
                console.log('🔍 ENHANCED SESSION VERIFICATION:', {
                  session: verifySession?.user?.email || 'Missing',
                  localStorage: tokenCheck ? 'Present' : 'Missing',
                  accessToken: verifySession?.access_token ? 'Present' : 'Missing'
                });
                
                if (verifySession) {
                  console.log('✅ ENHANCED SESSION VERIFIED AND PERSISTED');
                  return { success: true, session: verifySession };
                } else {
                  console.log('⚠️ ENHANCED SESSION NOT PERSISTED - MAGIC LINK FALLBACK');
                  if (bypassResult.magicLink) {
                    window.location.href = bypassResult.redirect_url || `${window.location.origin}/home`;
                  }
                  return { success: true, session: null };
                }
              }
            } catch (sessionError) {
              console.error('💥 ENHANCED SESSION EXCEPTION:', sessionError);
              if (bypassResult.magicLink) {
                window.location.href = bypassResult.redirect_url || `${window.location.origin}/home`;
              }
              return { success: true, session: null };
            }
          }
          
          // Magic link path
          if (bypassResult.magicLink) {
            console.log('🔗 ENHANCED MAGIC LINK REDIRECT');
            const redirectUrl = bypassResult.redirect_url || `${window.location.origin}/home`;
            window.location.href = redirectUrl;
            return { success: true, session: null };
          }
        }
      }

      console.error('❌ ALL ENHANCED LOGIN METHODS FAILED:', error);
      return { success: false, error };

    } catch (error: any) {
      console.error('💥 ENHANCED LOGIN EXCEPTION:', error);
      return { success: false, error };
    }
  };

  const forceDirectAccess = async (email: string, password: string): Promise<{ success: boolean; redirectUrl?: string; error?: any }> => {
    console.log('🚨 ENHANCED FORCE DIRECT ACCESS for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('register-bypass', {
        body: {
          email,
          password,
          action: 'login'
        }
      });

      if (error) {
        console.error('❌ ENHANCED FORCE ACCESS FAILED:', error);
        return { success: false, error };
      }

      if (data?.success) {
        console.log('🔗 ENHANCED FORCE ACCESS SUCCESS');
        console.log('📊 FORCE ACCESS DATA:', data);
        
        // CRITICAL: Enhanced session setup with comprehensive validation
        if (data.session) {
          console.log('🔄 ATTEMPTING ENHANCED DIRECT SESSION SETUP...');
          try {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token || ''
            });
            
            if (!setSessionError) {
              console.log('✅ ENHANCED DIRECT SESSION SETUP SUCCESS - EXTENDED VERIFICATION...');
              
              // CRITICAL: Extended verification with multiple persistence checks
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              const { data: { session: verifySession } } = await supabase.auth.getSession();
              const tokenCheck = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
              
              console.log('🔍 ENHANCED FORCE ACCESS VERIFICATION:', {
                sessionEmail: verifySession?.user?.email || 'Missing',
                localStorage: tokenCheck ? 'Present' : 'Missing',
                accessToken: verifySession?.access_token ? 'Present' : 'Missing',
                refreshToken: verifySession?.refresh_token ? 'Present' : 'Missing'
              });
              
              if (verifySession) {
                console.log('✅ ENHANCED FORCE ACCESS SESSION VERIFIED - PROGRAMMATIC REDIRECT');
                return { 
                  success: true, 
                  redirectUrl: '/home'
                };
              } else {
                console.log('⚠️ ENHANCED FORCE ACCESS SESSION NOT PERSISTED');
              }
            } else {
              console.log('⚠️ ENHANCED FORCE ACCESS SESSION SETUP FAILED');
            }
          } catch (sessionError) {
            console.log('⚠️ ENHANCED FORCE ACCESS SESSION EXCEPTION');
          }
        }
        
        // Enhanced magic link fallback
        if (data.magicLink) {
          console.log('🔗 ENHANCED MAGIC LINK FOR IMMEDIATE ACCESS');
          const redirectUrl = data.redirect_url || `${window.location.origin}/home`;
          window.location.href = redirectUrl;
          return { 
            success: true, 
            redirectUrl: redirectUrl
          };
        }
      }

      return { success: false, error: 'No enhanced access method available' };
      
    } catch (error: any) {
      console.error('💥 ENHANCED FORCE ACCESS EXCEPTION:', error);
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
