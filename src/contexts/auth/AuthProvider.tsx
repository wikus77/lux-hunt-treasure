
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
// IPHONE-REGRESSION-FORENSIC: Sanitized logging for regression diagnosis
import { logAuthForensic, logForensicTimeline } from '@/utils/authForensicLog';
import { logAuditEvent } from '@/utils/auditLog';
import { isAdminEmail } from '@/config/adminConfig';
// 🔐 Sync prize intro state with user
import { setPrizeIntroUserId } from '@/stores/prizeIntroStore';
// 📊 M1SSION Analytics
import { track, setAnalyticsUserId } from '@/lib/analytics';
// 🔐 Face ID: Import both clear (for expired tokens) and reset (for logout guards)
import { clearFaceIDCredentials, resetFaceIDRuntimeGuards } from '@/hooks/useFaceIDLogin';

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

// APPLE-LOGIN-LOOP-PATCH: sessionStorage key for silentAutoUpdate reload guard (can't import AuthProvider)
export const JUST_SIGNED_IN_STORAGE_KEY = 'm1_just_signed_in_at';

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
  // APPLE-LOGIN-LOOP-PATCH: prevent redirect during hydration; grace period after SIGNED_IN
  const [authHydrated, setAuthHydrated] = useState<boolean>(!!cachedAuth.user);
  const [justSignedInAt, setJustSignedInAt] = useState<number | null>(null);
  
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

  // 🔐 Sync prize intro & onboarding state with user ID
  useEffect(() => {
    setPrizeIntroUserId(user?.id);
  }, [user?.id]);

  // INIZIALIZZAZIONE SESSIONE - PWA Safari iOS Optimized with Cache Clear + AbortController
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

  const initializeAuth = async () => {
    try {
      // IPHONE-REGRESSION-FORENSIC: T0 launch
      logForensicTimeline('T0_launch', { isLoading, authHydrated, isAuthenticated: !!cachedAuth.user, justSignedInAt });
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
            // APPLE-LOGIN-LOOP-PATCH: fallback to getUser when getSession fails (iPad WKWebView resilience)
            try {
              const { data: { user: fallbackUser } } = await supabase.auth.getUser();
              if (fallbackUser && isMounted) {
                log("Fallback getUser OK - user recovered");
                const { data: { session: fallbackSession } } = await supabase.auth.getSession();
                if (fallbackSession) {
                  setSession(fallbackSession);
                  setUser(fallbackUser);
                  cacheSession(fallbackUser, fallbackSession);
                  if (isMounted) {
                    setAuthHydrated(true);
                    setIsLoading(false);
                  }
                  return;
                }
              }
            } catch (_) { /* ignore */ }
            if (isMounted) {
              setAuthHydrated(true);
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
      // APPLE-LOGIN-LOOP-PATCH: mark hydrated only after first getSession attempt completes
      if (isMounted) {
        setAuthHydrated(true);
        setIsLoading(false);
        console.log('[AUTH] hydrated=true isLoading=false isAuthenticated=', !!session);
        // IPHONE-REGRESSION-FORENSIC: post-init state
        logAuthForensic('AUTH_init_done', { isLoading: false, authHydrated: true, isAuthenticated: !!session, justSignedInAt: null });
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
        // 🔬 FORENSIC: Detailed auth event logging
        const timestamp = new Date().toISOString();
        console.log('🔐 [AuthProvider] ══════════════════════════════════════════');
        console.log(`🔐 [AuthProvider] AUTH EVENT: ${event} @ ${timestamp}`);
        console.log('🔐 [AuthProvider] Session:', {
          hasSession: !!newSession,
          userId: newSession?.user?.id || 'none',
          email: newSession?.user?.email || 'none',
          expiresAt: newSession?.expires_at || 'none'
        });
        console.log('🔐 [AuthProvider] ══════════════════════════════════════════');
        
        log(`Auth event: ${event}`, newSession?.user?.email || 'NO USER');
        
        // CRITICAL FIX: Use functional updates to prevent setState during render
        setSession(prevSession => newSession);
        setUser(prevUser => newSession?.user ?? null);
        
        // 🚀 Update cache for instant load
        cacheSession(newSession?.user ?? null, newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          // APPLE-LOGIN-LOOP-PATCH: set justSignedInAt for grace period (router + silentAutoUpdate)
          const ts = Date.now();
          setJustSignedInAt(ts);
          try {
            sessionStorage.setItem(JUST_SIGNED_IN_STORAGE_KEY, String(ts));
          } catch (_) { /* ignore */ }
          console.log('[AUTH] SIGNED_IN at', ts);

          log("Utente autenticato", newSession.user.email);
          
          // 📊 M1SSION Analytics - Set user ID and track login
          setAnalyticsUserId(newSession.user.id);
          track('login_success', {
            provider: newSession.user.app_metadata?.provider || 'email',
          });
          
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
          // APPLE-LOGIN-LOOP-PATCH: clear justSignedInAt on logout
          setJustSignedInAt(null);
          try {
            sessionStorage.removeItem(JUST_SIGNED_IN_STORAGE_KEY);
          } catch (_) { /* ignore */ }

          log("Utente disconnesso");
          
          // 🔐 FIX: Reset Face ID runtime guards on SIGNED_OUT event
          // This is a BACKUP - use-auth.ts also resets, but this catches edge cases
          resetFaceIDRuntimeGuards();
          log("Face ID runtime guards reset on SIGNED_OUT");
          
          // 📊 M1SSION Analytics - Track logout
          track('logout', {});
          setAnalyticsUserId(null);
          
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

  // 🔐 FACE ID SESSION RESTORE HANDLER
  // Listens for m1ssion:session-restored event from Face ID hook
  // Re-fetches user data to ensure profile is fully hydrated
  useEffect(() => {
    const handleSessionRestored = async (event: CustomEvent) => {
      log("🔐 Face ID session restored event received", event.detail);
      
      try {
        // Re-fetch current session to ensure state is synced
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          log("🔐 Re-hydrating user data after Face ID restore");
          
          // Update state
          setSession(currentSession);
          setUser(currentSession.user);
          cacheSession(currentSession.user, currentSession);
          
          // 📊 Analytics
          setAnalyticsUserId(currentSession.user.id);
          
          // Sync prize intro state
          setPrizeIntroUserId(currentSession.user.id);
          
          // Fetch user roles
          setIsRoleLoading(true);
          try {
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id);
            
            const roles = rolesData?.map(r => r.role) || [];
            setUserRoles(roles);
            log("🔐 User roles loaded after Face ID:", roles);
          } catch (roleErr) {
            log("⚠️ Failed to load roles after Face ID:", roleErr);
          } finally {
            setIsRoleLoading(false);
          }
          
          setIsLoading(false);
          log("✅ Face ID session restore complete - user data hydrated");
        }
      } catch (err) {
        log("❌ Error handling Face ID session restore:", err);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('m1ssion:session-restored', handleSessionRestored as EventListener);
    
    return () => {
      window.removeEventListener('m1ssion:session-restored', handleSessionRestored as EventListener);
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
    // IPHONE-REGRESSION-FORENSIC: T1 login submit
    logForensicTimeline('T1_login_submit', { isLoading, authHydrated, isAuthenticated: !!user, justSignedInAt });
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
      
      // 🔐 FIX: Use scope: 'local' to preserve Face ID tokens!
      // signOut() without scope REVOKES the refresh_token server-side,
      // which breaks Face ID auto-login after logout.
      // With scope: 'local', only the JS session is cleared, but the
      // Keychain tokens remain valid for Face ID restore.
      console.log('🔐 [AuthProvider] signOut({ scope: "local" }) - preserving Face ID tokens');
      await supabase.auth.signOut({ scope: 'local' });
      
      // Cleanup stato locale IMMEDIATO + sessionStorage
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setIsRoleLoading(false);
      
      // 🚀 Clear auth cache
      cacheSession(null, null);
      
      // 🔐 Face ID credentials: DO NOT CLEAR on logout!
      // Credentials are protected by biometrics and should persist.
      // They will only be cleared if session restoration fails (expired tokens).
      // This allows Face ID to work immediately after logout+login.
      // clearFaceIDCredentials(); // REMOVED - see useFaceIDLogin.ts for auto-clear on invalid session
      
      // Clear mission intro session to force replay on next login
      sessionStorage.removeItem('hasSeenPostLoginIntro');
      // APPLE-LOGIN-LOOP-PATCH: clear just-signed-in flag on logout
      sessionStorage.removeItem(JUST_SIGNED_IN_STORAGE_KEY);
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
    authHydrated,
    justSignedInAt,
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
