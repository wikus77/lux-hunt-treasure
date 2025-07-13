import { getSupabaseClient } from "@/integrations/supabase/getClient"

import { useAuthSession } from './use-auth-session';

import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { session, user, isLoading } = useAuthSession();
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: any }> => {
    const client = await getSupabaseClient();
    console.log('🔐 STANDARD LOGIN STARTING for:', email);
    
    try {
      // Standard Supabase login
      console.log('🔄 Attempting standard Supabase login...');
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ LOGIN FAILED:', error.message);
        return { success: false, error };
      }

      if (data.session) {
        console.log('✅ LOGIN SUCCESS - session created');
        console.log('✅ Session tokens stored successfully');
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
    const client = await getSupabaseClient();
    console.log('📝 REGISTRATION STARTING for:', email);
    
    try {
      const { data, error } = await client.auth.signUp({
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
    const client = await getSupabaseClient();
    console.log('🚪 LOGOUT STARTING');
    await client.auth.signOut();
    console.log('🧹 Session cleared');
    console.log('✅ LOGOUT COMPLETE');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const client = await getSupabaseClient();
    console.log('🔄 PASSWORD RESET for:', email);
    
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
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
    const client = await getSupabaseClient();
    console.log('📧 RESEND VERIFICATION for:', email);
    
    try {
      const { error } = await client.auth.resend({
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

  const updateProfile = async (data: any): Promise<void> => {
    const client = await getSupabaseClient();
    console.log('📝 UPDATE PROFILE:', data);
    // Implementazione updateProfile se necessaria
  };

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    isEmailVerified: user?.email_confirmed_at ? true : false,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateProfile,
    getCurrentUser: () => user,
    getAccessToken: () => session?.access_token || '',
  };
};
