// M1SSION™ - Supabase Session Restoration Hook for iOS Capacitor
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface SessionState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isRestored: boolean;
  error: string | null;
}

export const useSupabaseSessionRestorer = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    user: null,
    isLoading: true,
    isRestored: false,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const restoreSession = async () => {
      try {
        console.log('🔄 Restoring Supabase session for iOS...');

        // First, check for existing session with retry logic
        const attemptSessionRestore = async (): Promise<Session | null> => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.warn('⚠️ Session restore attempt failed:', error.message);
              
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`🔄 Retrying session restore (${retryCount}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                return attemptSessionRestore();
              }
              
              throw error;
            }

            return session;
          } catch (error) {
            console.error('❌ Session restore error:', error);
            return null;
          }
        };

        const session = await attemptSessionRestore();

        if (!isMounted) return;

        if (session?.user) {
          console.log('✅ Session restored successfully:', session.user.email);
          setSessionState({
            session,
            user: session.user,
            isLoading: false,
            isRestored: true,
            error: null
          });
        } else {
          console.log('📱 No existing session found');
          setSessionState({
            session: null,
            user: null,
            isLoading: false,
            isRestored: true,
            error: null
          });
        }

      } catch (error) {
        console.error('❌ Session restoration failed:', error);
        
        if (!isMounted) return;
        
        setSessionState({
          session: null,
          user: null,
          isLoading: false,
          isRestored: false,
          error: error instanceof Error ? error.message : 'Session restoration failed'
        });
      }
    };

    // Set up auth state change listener with iOS-specific handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change detected:', event, session?.user?.email || 'no user');
        
        if (!isMounted) return;

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            setSessionState({
              session,
              user: session?.user || null,
              isLoading: false,
              isRestored: true,
              error: null
            });
            break;

          case 'SIGNED_OUT':
            setSessionState({
              session: null,
              user: null,
              isLoading: false,
              isRestored: true,
              error: null
            });
            break;

          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed for iOS');
            setSessionState(prev => ({
              ...prev,
              session,
              user: session?.user || null,
              error: null
            }));
            break;

          case 'USER_UPDATED':
            setSessionState(prev => ({
              ...prev,
              session,
              user: session?.user || null
            }));
            break;

          default:
            // For any other events, update the session
            setSessionState(prev => ({
              ...prev,
              session,
              user: session?.user || null,
              isLoading: false
            }));
        }
      }
    );

    // Start session restoration
    restoreSession();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced login function with iOS-specific handling
  const loginWithRetry = async (email: string, password: string) => {
    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Login successful for iOS');
      return { success: true, data };

    } catch (error) {
      console.error('❌ iOS login error:', error);
      setSessionState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
      return { success: false, error };
    }
  };

  // Enhanced logout function
  const logoutWithCleanup = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear any cached data specific to iOS
      if (typeof window !== 'undefined') {
        localStorage.removeItem('m1ssion_supabase_auth');
        sessionStorage.clear();
      }
      
      console.log('✅ Logout completed for iOS');
      return { success: true };

    } catch (error) {
      console.error('❌ iOS logout error:', error);
      return { success: false, error };
    }
  };

  return {
    ...sessionState,
    loginWithRetry,
    logoutWithCleanup,
    refreshSession: () => supabase.auth.refreshSession()
  };
};