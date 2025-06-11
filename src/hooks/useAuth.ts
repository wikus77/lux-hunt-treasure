
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AUTENTICAZIONE REALE ONLY - NO FALLBACK FAKE
    const getInitialSession = async () => {
      try {
        console.log('🔄 Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
        }
        
        if (session?.user) {
          console.log('✅ Active session found:', {
            userId: session.user.id,
            email: session.user.email
          });
          setUser(session.user);
        } else {
          console.log('⚠️ No active session - user must login');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Session initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Auth state listener - REAL SESSIONS ONLY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};
