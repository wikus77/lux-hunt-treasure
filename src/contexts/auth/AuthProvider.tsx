
/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * AuthProvider - Sistema unificato di autenticazione per M1SSION™
 * PWA Safari iOS ottimizzato con persistenza nativa Supabase
 * UNIFIED SYSTEM - Unica fonte di verità per l'auth
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType } from './types';

interface AuthProviderProps {
  children: ReactNode;
}

// Debug toggle per sviluppo - ABILITATO per troubleshooting
const DEBUG_UNIFIED_AUTH = true;

const log = (message: string, data?: any) => {
  if (DEBUG_UNIFIED_AUTH) {
    console.log(`🔐 [UNIFIED AUTH] ${message}`, data || '');
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // UNIFIED STATE - Unico stato per tutta l'app
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);

  // INIZIALIZZAZIONE SESSIONE - PWA Safari iOS Optimized
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        log("Inizializzazione sistema unified auth");
        
        // STEP 1: Verifica sessione corrente - nativo Supabase SOLO
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          log("Errore getSession", error);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        if (currentSession && isMounted) {
          log("Sessione trovata", currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          log("Nessuna sessione attiva");
        }
      } catch (error) {
        log("Errore init auth", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);

  // LISTENER STATO AUTH - Gestione eventi Supabase
  useEffect(() => {
    log("Setup auth state listener");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        log(`Auth event: ${event}`, newSession?.user?.email || 'NO USER');
        
        // Update stato sincrono
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession) {
          log("Utente autenticato", newSession.user.email);
        } else if (event === 'SIGNED_OUT') {
          log("Utente disconnesso");
          setUserRoles([]);
          setIsRoleLoading(false);
        }
        
        // Auth completata
        setIsLoading(false);
      }
    );

    // Cleanup
    return () => {
      log("Cleanup auth listener");
      subscription.unsubscribe();
    };
  }, []);

  // PWA VISIBILITY HANDLER - Safari iOS ottimizzato
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isLoading) {
        log("PWA tornata attiva - verifica sessione");
        
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          // Verifica se sessione è cambiata
          if (currentSession && (!session || session.expires_at !== currentSession.expires_at)) {
            log("Sessione aggiornata da visibility change");
            setSession(currentSession);
            setUser(currentSession.user);
          }
        } catch (error) {
          log("Errore verifica sessione visibility", error);
        }
      }
    };

    // Solo per PWA installate
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [session, isLoading]);

  // FETCH USER ROLES - Sistema unificato
  const fetchUserRoles = async (userId: string) => {
    if (!userId) return;
    
    setIsRoleLoading(true);
    log("Fetch roles per user", userId);
    
    try {
      // Prima: user_roles table
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesData && rolesData.length > 0) {
        const roles = rolesData.map(r => r.role);
        log("Roles da user_roles", roles);
        setUserRoles(roles);
        return;
      }

      // Fallback: profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileData?.role) {
        log("Role da profiles", [profileData.role]);
        setUserRoles([profileData.role]);
      } else {
        log("Nessun role trovato");
        setUserRoles([]);
      }
    } catch (error) {
      log("Errore fetch roles", error);
      setUserRoles([]);
    } finally {
      setIsRoleLoading(false);
    }
  };

  // EFFECT: Fetch roles quando cambia user
  useEffect(() => {
    if (user?.id) {
      fetchUserRoles(user.id);
    } else {
      setUserRoles([]);
      setIsRoleLoading(false);
    }
  }, [user?.id]);

  // HAS ROLE - Check con developer bypass
  const hasRole = (role: string): boolean => {
    // Developer bypass
    if (user?.email === 'wikus77@hotmail.it') {
      log(`Forced hasRole(${role}) = true per developer`);
      return true;
    }
    
    const result = userRoles.includes(role);
    log(`hasRole(${role}) = ${result}`, { userRoles, userEmail: user?.email });
    return result;
  };

  // LOGIN FUNCTION - Unified
  const login = async (email: string, password: string) => {
    log("Login attempt", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        log("Login error", error.message);
        return { success: false, error };
      }

      log("Login success", data.user?.email);
      return { success: true, session: data.session };
    } catch (error) {
      log("Login exception", error);
      return { success: false, error };
    }
  };

  // REGISTER FUNCTION - Unified with Email Verification
  const register = async (email: string, password: string) => {
    log("Register attempt", email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/email-verified`
        }
      });

      if (error) {
        log("Register error", error.message);
        return { success: false, error };
      }

      log("Register success - email verification required", data.user?.email);
      return { success: true, data, needsEmailVerification: !data.user?.email_confirmed_at };
    } catch (error) {
      log("Register exception", error);
      return { success: false, error };
    }
  };

  // RESET PASSWORD FUNCTION - Unified
  const resetPassword = async (email: string) => {
    log("Reset password attempt", email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        log("Reset password error", error.message);
        return { success: false, error: error.message };
      }

      log("Reset password success");
      return { success: true };
    } catch (error: any) {
      log("Reset password exception", error);
      return { success: false, error: error.message };
    }
  };

  // RESEND VERIFICATION FUNCTION - Unified
  const resendVerificationEmail = async (email: string) => {
    log("Resend verification attempt", email);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        log("Resend verification error", error.message);
        return { success: false, error: error.message };
      }

      log("Resend verification success");
      return { success: true };
    } catch (error: any) {
      log("Resend verification exception", error);
      return { success: false, error: error.message };
    }
  };
  const logout = async (): Promise<void> => {
    log("Logout iniziato");
    
    try {
      // Supabase signOut - NO localStorage cleanup manuale
      await supabase.auth.signOut();
      
      // Cleanup stato locale
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setIsLoading(false);
      setIsRoleLoading(false);
      
      log("Logout completato");
    } catch (error) {
      log("Errore logout", error);
    }
  };

  // CHECK MISSION STARTED - Unified
  const checkMissionStarted = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_mission_started');
      if (error) {
        log("Error checking mission start", error);
        return false;
      }
      log("Mission started check", data);
      return data || false;
    } catch (error) {
      log("Exception checking mission start", error);
      return false;
    }
  };

  // CONTEXT VALUE - Unified interface
  const authContextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    isEmailVerified: user?.email_confirmed_at ? true : false,
    userRole: userRoles[0] || null,
    isRoleLoading,
    getCurrentUser: () => user,
    getAccessToken: () => session?.access_token || null,
    hasRole,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    checkMissionStarted,
  };

  // Debug context state
  log("Context value", {
    isAuthenticated: authContextValue.isAuthenticated,
    isLoading: authContextValue.isLoading,
    userEmail: user?.email,
    rolesCount: userRoles.length,
    isRoleLoading
  });

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
