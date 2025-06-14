
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuthContext } from '@/contexts/auth/UnifiedAuthProvider';

interface UnifiedAuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
}

export const useUnifiedAuth = () => {
  // Get role properties from UnifiedAuthProvider
  const { userRole, hasRole, isRoleLoading } = useUnifiedAuthContext();
  
  const [authState, setAuthState] = useState<UnifiedAuthState>({
    session: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isEmailVerified: false
  });

  useEffect(() => {
    console.log('🔧 UNIFIED AUTH: Initializing auth system - NO AUTO REDIRECTS');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 UNIFIED AUTH STATE CHANGE:', { event, hasSession: !!session, userEmail: session?.user?.email });
        
        setAuthState({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
          isEmailVerified: !!session?.user?.email_confirmed_at
        });
      }
    );

    // CHECK EXISTING SESSION ONCE - NO REDIRECTS
    const checkInitialSession = async () => {
      try {
        console.log('🔍 UNIFIED AUTH: Checking initial session - NO REDIRECTS');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ UNIFIED AUTH: Session check error:', error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        console.log('📊 UNIFIED AUTH: Initial session result:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email,
          isValid: !!session?.access_token 
        });
        
        setAuthState({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
          isEmailVerified: !!session?.user?.email_confirmed_at
        });
      } catch (error) {
        console.error('💥 UNIFIED AUTH: Exception during session check:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkInitialSession();

    return () => {
      console.log('🧹 UNIFIED AUTH: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const forceSessionFromTokens = async (accessToken: string, refreshToken: string): Promise<boolean> => {
    try {
      console.log('🔧 UNIFIED AUTH: Forcing session from tokens');
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('❌ UNIFIED AUTH: Force session error:', error);
        return false;
      }

      console.log('✅ UNIFIED AUTH: Session forced successfully:', { userEmail: data.user?.email });
      
      // Force a small delay for iOS to ensure session is properly set
      if ((window as any).Capacitor) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return true;
    } catch (error) {
      console.error('💥 UNIFIED AUTH: Force session exception:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: any }> => {
    console.log('🔐 UNIFIED AUTH: Standard login starting for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ UNIFIED AUTH: Login failed:', error.message);
        return { success: false, error };
      }

      if (data.session) {
        console.log('✅ UNIFIED AUTH: Login success - session created - NO AUTO REDIRECT');
        await forceSessionFromTokens(
          data.session.access_token,
          data.session.refresh_token
        );
        return { success: true, session: data.session };
      }

      console.error('❌ UNIFIED AUTH: Login failed - no session created');
      return { success: false, error: { message: 'No session created' } };

    } catch (error: any) {
      console.error('💥 UNIFIED AUTH: Login exception:', error);
      return { success: false, error };
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 UNIFIED AUTH: Logout starting - NO AUTO REDIRECT');
    await supabase.auth.signOut();
    localStorage.removeItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
    console.log('✅ UNIFIED AUTH: Logout complete');
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: any; data?: any }> => {
    console.log('📝 UNIFIED AUTH: Registration starting for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ UNIFIED AUTH: Registration failed:', error.message);
        return { success: false, error };
      }

      console.log('✅ UNIFIED AUTH: Registration success');
      return { success: true, data };

    } catch (error: any) {
      console.error('💥 UNIFIED AUTH: Registration exception:', error);
      return { success: false, error };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('📧 UNIFIED AUTH: Resend verification for:', email);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ UNIFIED AUTH: Resend verification failed:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ UNIFIED AUTH: Verification email sent');
      return { success: true };

    } catch (error: any) {
      console.error('💥 UNIFIED AUTH: Resend verification exception:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    ...authState,
    // Role properties from UnifiedAuthProvider
    userRole,
    hasRole,
    isRoleLoading,
    // Auth methods
    login,
    logout,
    register,
    resendVerificationEmail,
    forceSessionFromTokens,
    getCurrentUser: () => authState.user,
    getAccessToken: () => authState.session?.access_token || null,
  };
};
