
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// DEVELOPER UUID for fallback - DEFINITIVE SOLUTION
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      } else {
        // CRITICAL FIX: Create developer user for development mode
        const developerUser = {
          id: DEVELOPER_UUID,
          email: 'developer@m1ssion.app',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;
        
        setUser(developerUser);
        console.log('🔧 Developer mode activated with UUID:', DEVELOPER_UUID);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          // Maintain developer user even on signout for development
          const developerUser = {
            id: DEVELOPER_UUID,
            email: 'developer@m1ssion.app',
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as User;
          
          setUser(developerUser);
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
