
/**
 * M1SSION™ — AuthProvider Memory Leak Fix & PWA Optimizations
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * AuthProvider - Sistema unificato di autenticazione per M1SSION™
 * PWA Safari iOS ottimizzato con persistenza nativa Supabase
 * UNIFIED SYSTEM - Unica fonte di verità per l'auth
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// getAuthTokenKey removed - no longer clearing auth cache automatically
import AuthContext from './AuthContext';
import { AuthContextType } from './types';
import { authHealthLogger } from '@/utils/AuthHealthCheckLog';
import { logAuditEvent } from '@/utils/auditLog';
import { isAdminEmail } from '@/config/adminConfig';

interface AuthProviderProps {
  children: ReactNode;
}

// Debug COMPLETAMENTE disabilitato in produzione per sicurezza
const DEBUG_UNIFIED_AUTH = false;

const log = (message: string, data?: any) => {
  // Completamente silenziato in produzione
  if (process.env.NODE_ENV === 'development' && DEBUG_UNIFIED_AUTH) {
    console.log(`🔐 [UNIFIED AUTH] ${message}`, data || '');
  }
};

// Cache key for instant auth state
const AUTH_SESSION_CACHE = 'm1ssion_session_cache';

// Get cached session for instant display
const getCachedSession = (): { user: User | null; session: Session | null } => {
  try {
    const cached = localStorage.getItem(AUTH_SESSION_CACHE);
    if (cached) {
      const { user, session, timestamp } = JSON.parse(cached);
      // Cache valid for 1 hour
      if (user && session && (Date.now() - timestamp) < 60 * 60 * 1000) {
        return { user, session };
      }
    }
  } catch {}
  return { user: null, session: null };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 🚀 INSTANT INIT: Use cached session immediately
  const cachedAuth = getCachedSession();
  
  // UNIFIED STATE - Unico stato per tutta l'app
  const [user, setUser] = useState<User | null>(cachedAuth.user);
  const [session, setSession] = useState<Session | null>(cachedAuth.session);
  // 🚀 Start as NOT loading if we have cached auth
  const [isLoading, setIsLoading] = useState<boolean>(!cachedAuth.user);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);
  
  // Cache session for instant load next time
  const cacheSession = (user: User | null, session: Session | null) => {
    try {
      if (user && session) {
        localStorage.setItem(AUTH_SESSION_CACHE, JSON.stringify({
          user,
          session,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem(AUTH_SESSION_CACHE);
      }
    } catch {}
  };

  // INIZIALIZZAZIONE SESSIONE - PWA Safari iOS Optimized with Cache Clear + AbortController
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

  const initializeAuth = async () => {
    try {
      log("Inizializzazione sistema unified auth");
      authHealthLogger.log('AuthProvider_Init', true, { timestamp: new Date().toISOString() });
      
      // 🚫 REMOVED: Unregistering service workers on every init was causing issues
      // with push notifications and PWA functionality.
      // The service worker should remain active for proper PWA operation.
      
      // 🚫 REMOVED: This was causing users to be logged out every hour!
      // The auth token should NEVER be cleared automatically.
      // Supabase handles token refresh via autoRefreshToken: true in client config.
      // Only manual logout should clear the auth token.
      
      // STEP 1: Verifica sessione corrente con retry
      let session = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !session) {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            log(`Errore getSession (tentativo ${attempts + 1})`, error);
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            if (isMounted) {
              setIsLoading(false);
            }
            return;
          }
          
          session = currentSession;
          break;
        } catch (error) {
          log(`Errore getSession exception (tentativo ${attempts + 1})`, error);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (session && isMounted) {
        log("Sessione trovata", session.user.email);
        setSession(session);
        setUser(session.user);
        // 🚀 Cache for instant load next time
        cacheSession(session.user, session);
      } else {
        log("Nessuna sessione attiva");
        cacheSession(null, null);
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

  // Cleanup - MEMORY LEAK FIX
  return () => {
    isMounted = false;
    abortController.abort();
  };
  }, []);

  // LISTENER STATO AUTH - Gestione eventi Supabase + MEMORY LEAK FIX
  useEffect(() => {
    log("Setup auth state listener");
    let timeoutId: NodeJS.Timeout | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        log(`Auth event: ${event}`, newSession?.user?.email || 'NO USER');
        
        // CRITICAL FIX: Use functional updates to prevent setState during render
        setSession(prevSession => newSession);
        setUser(prevUser => newSession?.user ?? null);
        
        // 🚀 Update cache for instant load
        cacheSession(newSession?.user ?? null, newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          log("Utente autenticato", newSession.user.email);
          
          // 🔐 Audit log for login
          logAuditEvent({
            event_type: 'LOGIN_SUCCESS',
            user_id: newSession.user.id,
            user_email: newSession.user.email,
            severity: 'info',
          });
          
          // 🚨 ADMIN NO AUTO-REDIRECT - Let routing handle it
          if (isAdminEmail(newSession.user.email)) {
            log("🚀 ADMIN DETECTED - No auto redirect, let routing handle");
            
            // 🔐 Audit log for admin access
            logAuditEvent({
              event_type: 'ADMIN_ACCESS',
              user_id: newSession.user.id,
              user_email: newSession.user.email,
              severity: 'warning',
              details: { action: 'login' },
            });
            // Don't auto-redirect admin - let normal routing take over
          }
          
          // 🔇 DISABLED: Was causing unwanted reloads after BUZZ (profile update triggered auth event)
          // PWA iOS: Force reload once after login to stabilize - MEMORY LEAK FIX
          // if ((window as any).Capacitor || navigator.userAgent.includes('Safari')) {
          //   log("🔄 PWA iOS: Post-login cache refresh");
          //   timeoutId = setTimeout(() => {
          //     if (!sessionStorage.getItem('auth_reload_done')) {
          //       sessionStorage.setItem('auth_reload_done', 'true');
          //       window.location.reload();
          //     }
          //   }, 1000);
          // }
        } else if (event === 'SIGNED_OUT') {
          log("Utente disconnesso");
          
          // 🔐 Audit log for logout
          logAuditEvent({
            event_type: 'LOGOUT',
            severity: 'info',
          });
          
          setUserRoles([]);
          setIsRoleLoading(false);
          sessionStorage.removeItem('auth_reload_done');
        }
        
        // Auth completata
        setIsLoading(false);
      }
    );

    // Cleanup - MEMORY LEAK FIX
    return () => {
      log("Cleanup auth listener");
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // PWA VISIBILITY HANDLER - Safari iOS ottimizzato + MEMORY LEAK FIX
  useEffect(() => {
    const abortController = new AbortController();
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isLoading && !abortController.signal.aborted) {
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
          if (!abortController.signal.aborted) {
            log("Errore verifica sessione visibility", error);
          }
        }
      }
    };

    // Solo per PWA installate
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      document.addEventListener('visibilitychange', handleVisibilityChange, { signal: abortController.signal });
      
      return () => {
        abortController.abort();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    return () => {
      abortController.abort();
    };
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

  // HAS ROLE - Check con sicurezza migliorata
  const hasRole = (role: string): boolean => {
    // Controllo sicuro basato sui ruoli nel database
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

  // REGISTER FUNCTION - Unified
  const register = async (email: string, password: string) => {
    log("Register attempt", email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        log("Register error", error.message);
        return { success: false, error };
      }

      log("Register success", data.user?.email);
      return { success: true, data };
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
        redirectTo: `${window.location.origin}/auth/reset`
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
      // 🔄 FORCE LOADING STATE per evitare race conditions
      setIsLoading(true);
      
      // Supabase signOut - NO localStorage cleanup manuale
      await supabase.auth.signOut();
      
      // Cleanup stato locale IMMEDIATO + sessionStorage
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setIsRoleLoading(false);
      
      // 🚀 Clear auth cache
      cacheSession(null, null);
      
      // Clear mission intro session to force replay on next login
      sessionStorage.removeItem('hasSeenPostLoginIntro');
      console.log('🧹 [AuthProvider] Cleared hasSeenPostLoginIntro on logout');
      
      // 🚨 CRITICAL: Force redirect to login after logout + PWA iOS stability
      setTimeout(() => {
        setIsLoading(false);
        
        // PWA iOS compatibility: clear all caches before redirect
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
            });
          });
        }
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          log("Force redirect to login after logout");
          
          // Enhanced PWA iOS redirect with fallback
          const redirectToLogin = () => {
            try {
              window.location.href = '/login';
            } catch (error) {
              log("Fallback redirect method", error);
              window.location.replace('/login');
            }
          };
          
          redirectToLogin();
        }
      }, 150);
      
      log("Logout completato");
    } catch (error) {
      log("Errore logout", error);
      setIsLoading(false);
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
