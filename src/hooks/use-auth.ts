
import React from 'react';
import { useAuthSessionManager } from './use-auth-session-manager';
import { supabase } from '@/integrations/supabase/client';

// Mask email for secure logging (show first 2 chars + domain)
const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

export const useAuth = () => {
  const sessionManager = useAuthSessionManager();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: any }> => {
    console.log('🔐 LOGIN STARTING');
    
    try {
      console.log('🔄 Attempting Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ LOGIN FAILED');
        return { success: false, error };
      }

      if (data.session) {
        console.log('✅ LOGIN SUCCESS');
        await sessionManager.forceSessionFromTokens(
          data.session.access_token,
          data.session.refresh_token
        );
        return { success: true, session: data.session };
      }

      console.error('❌ LOGIN FAILED - no session');
      return { success: false, error: { message: 'No session created' } };

    } catch (error: any) {
      console.error('💥 LOGIN EXCEPTION');
      return { success: false, error };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: any; data?: any }> => {
    console.log('📝 REGISTRATION STARTING');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ REGISTRATION FAILED');
        return { success: false, error };
      }

      console.log('✅ REGISTRATION SUCCESS');
      return { success: true, data };

    } catch (error: any) {
      console.error('💥 REGISTRATION EXCEPTION');
      return { success: false, error };
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 LOGOUT STARTING');
    
    // 🧹 LOGOUT CACHE CLEANUP - Clear storage but preserve important keys
    const keysToPreserve = [
      'm1_quiz_last_skip',
      'm1ssion_legal_consent',
      'm1ssion_legal_consent_date'
    ];
    
    const preserved: Record<string, string | null> = {};
    keysToPreserve.forEach(key => {
      preserved[key] = localStorage.getItem(key);
    });
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore preserved keys
    keysToPreserve.forEach(key => {
      if (preserved[key]) {
        localStorage.setItem(key, preserved[key]!);
      }
    });
    console.log('🛡️ Preserved keys after logout:', keysToPreserve.filter(k => preserved[k]));
    
    // Reset any existing state stores
    try {
      const mapStoreModule = await import("@/stores/mapStore").catch(() => null);
      if (mapStoreModule?.useMapStore) {
        const store = mapStoreModule.useMapStore.getState();
        store.resetMapState?.();
      }
    } catch (e) {
      console.log("⚠️ Map store not found, skipping reset");
    }
    
    await supabase.auth.signOut();
    await sessionManager.clearSession();
    console.log('✅ LOGOUT COMPLETED');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔄 PASSWORD RESET REQUEST');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`
      });

      if (error) {
        console.error('❌ PASSWORD RESET FAILED');
        return { success: false, error: error.message };
      }

      console.log('✅ PASSWORD RESET EMAIL SENT');
      return { success: true };

    } catch (error: any) {
      console.error('💥 PASSWORD RESET EXCEPTION');
      return { success: false, error: error.message };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('📧 RESEND VERIFICATION REQUEST');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ RESEND VERIFICATION FAILED');
        return { success: false, error: error.message };
      }

      console.log('✅ VERIFICATION EMAIL SENT');
      return { success: true };

    } catch (error: any) {
      console.error('💥 RESEND VERIFICATION EXCEPTION');
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (data: any): Promise<void> => {
    console.log('📝 UPDATE PROFILE');
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
    updateProfile,
    getCurrentUser: () => sessionManager.user,
    getAccessToken: () => sessionManager.session?.access_token || '',
  };
};

export default useAuth;
