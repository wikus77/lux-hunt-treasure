
import React from 'react';
import { useAuthSessionManager } from './use-auth-session-manager';
import { supabase } from '@/integrations/supabase/client';
import { resetFaceIDRuntimeGuards } from './useFaceIDLogin';

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
    
    // 🔐 FIX: Reset Face ID runtime guards BEFORE anything else
    // This ensures Face ID can trigger immediately on next login (no cooldown block)
    resetFaceIDRuntimeGuards();
    console.log('✅ [Logout] Face ID runtime guards reset');
    
    // 🔐 FIX: Set logout reason BEFORE clearing sessionStorage
    // Login.tsx will check this and skip 'opening' screen → go straight to 'login'
    sessionStorage.setItem('m1ssion_login_reason', 'logout');
    console.log('✅ [Logout] Login reason set: logout');
    
    // 🧹 SELECTIVE LOGOUT - Clear ONLY auth-related keys, preserve everything else
    // This is more robust than localStorage.clear() + restore
    
    const authKeysToRemove = [
      // Supabase auth keys (usually start with 'sb-')
      'sb-',
      'supabase.',
      // Our auth cache
      'm1ssion_auth_cache',
      'm1ssion_session_cache',
      // Session-specific flags (should reset on logout)
      'auth_reload_done',
      'hasSeenPostLoginIntro',
    ];
    
    // Keys that MUST be preserved (for safety, list explicitly what to keep)
    const criticalKeysToPreserve = [
      // Legal consent - never reset
      'm1ssion_legal_consent',
      
      // 🔑 BONUSES: Prevent re-granting
      'm1ssion_welcome_bonus_shown',
      'm1ssion_hasSeenPrizeIntro',
      'm1ssion_lastPrizeIntroMissionId', 
      'm1ssion_prizeIntroSeenAt',
      
      // 🎰 M1U Cache: Prevent fake slot machine animation
      'm1ssion_m1u_cache',
      
      // Onboarding states
      'm1ssion_onboarding',
      'm1ssion_first_session',
      'm1_micro_missions',
      
      // Quiz/streak
      'm1_quiz_last_skip',
      'm1ssion_streak',
      'm1_streak',
    ];
    
    // Backup critical keys first
    const backup: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Check if this key matches any critical prefix
        const isCritical = criticalKeysToPreserve.some(prefix => key.startsWith(prefix));
        if (isCritical) {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    
    console.log('🛡️ Backing up critical keys:', Object.keys(backup).length);
    
    // Remove only auth-related keys (safer than clear())
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && authKeysToRemove.some(prefix => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Removed auth keys:', keysToRemove.length);
    
    // Clear sessionStorage (it's session-specific anyway)
    // BUT preserve the login_reason flag we just set!
    const loginReason = sessionStorage.getItem('m1ssion_login_reason');
    sessionStorage.clear();
    if (loginReason) {
      sessionStorage.setItem('m1ssion_login_reason', loginReason);
      console.log('✅ [Logout] Preserved login_reason in sessionStorage');
    }
    
    // Restore any critical keys that might have been accidentally removed
    Object.entries(backup).forEach(([key, value]) => {
      if (value && !localStorage.getItem(key)) {
        localStorage.setItem(key, value);
      }
    });
    
    console.log('✅ Critical keys preserved:', Object.keys(backup).filter(k => backup[k]));
    
    // Reset map store if exists
    try {
      const mapStoreModule = await import("@/stores/mapStore").catch(() => null);
      if (mapStoreModule?.useMapStore) {
        const store = mapStoreModule.useMapStore.getState();
        store.resetMapState?.();
      }
    } catch (e) {
      console.log("⚠️ Map store not found, skipping reset");
    }
    
    // Sign out from Supabase
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
