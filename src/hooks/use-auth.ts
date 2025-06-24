
import { useAuthSessionManager } from './use-auth-session-manager';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const sessionManager = useAuthSessionManager();
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: any }> => {
    console.log('🔐 STANDARD LOGIN STARTING for:', email);
    
    try {
      // Standard Supabase login
      console.log('🔄 Attempting standard Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ LOGIN FAILED:', error.message);
        return { success: false, error };
      }

      if (data.session) {
        console.log('✅ LOGIN SUCCESS - session created');
        await sessionManager.forceSessionFromTokens(
          data.session.access_token,
          data.session.refresh_token
        );
        return { success: true, session: data.session };
      }

      console.error('❌ LOGIN FAILED - no session created');
      return { success: false, error: { message: 'No session created' } };

    } catch (error: any) {
      console.error('💥 LOGIN EXCEPTION:', error);
      return { success: false, error };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: any; data?: any }> => {
    console.log('📝 REGISTRATION STARTING for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ REGISTRATION FAILED:', error.message);
        return { success: false, error };
      }

      console.log('✅ REGISTRATION SUCCESS');
      return { success: true, data };

    } catch (error: any) {
      console.error('💥 REGISTRATION EXCEPTION:', error);
      return { success: false, error };
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 LOGOUT STARTING');
    await supabase.auth.signOut();
    await sessionManager.clearSession();
    console.log('✅ LOGOUT COMPLETE');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔄 PASSWORD RESET for:', email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('❌ PASSWORD RESET FAILED:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ PASSWORD RESET EMAIL SENT');
      return { success: true };

    } catch (error: any) {
      console.error('💥 PASSWORD RESET EXCEPTION:', error);
      return { success: false, error: error.message };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('📧 RESEND VERIFICATION for:', email);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ RESEND VERIFICATION FAILED:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ VERIFICATION EMAIL SENT');
      return { success: true };

    } catch (error: any) {
      console.error('💥 RESEND VERIFICATION EXCEPTION:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    user: sessionManager.user,
    session: sessionManager.session,
    isAuthenticated: sessionManager.isAuthenticated,
    isLoading: sessionManager.isLoading,
    isEmailVerified: sessionManager.user?.email_confirmed_at ? true : false,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    getCurrentUser: () => sessionManager.user,
    getAccessToken: () => sessionManager.session?.access_token || null,
  };
};
