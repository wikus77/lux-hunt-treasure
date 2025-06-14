
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSessionManager = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🔄 SESSION MANAGER: Initializing authentication system');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 AUTH STATE CHANGE:', { event, hasSession: !!session, userEmail: session?.user?.email });
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        
        // Only set loading to false after we have a definitive auth state
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log('🔍 SESSION MANAGER: Checking existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ SESSION CHECK ERROR:', error);
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          console.log('📊 EXISTING SESSION:', { 
            hasSession: !!session, 
            userEmail: session?.user?.email,
            isValid: !!session?.access_token 
          });
          
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);
        }
      } catch (error) {
        console.error('💥 SESSION CHECK EXCEPTION:', error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log('🧹 SESSION MANAGER: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const forceSessionFromTokens = async (accessToken: string, refreshToken: string) => {
    try {
      console.log('🔧 FORCE SESSION: Setting session from tokens');
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('❌ FORCE SESSION ERROR:', error);
        return false;
      }

      console.log('✅ FORCE SESSION SUCCESS:', { userEmail: data.user?.email });
      return true;
    } catch (error) {
      console.error('💥 FORCE SESSION EXCEPTION:', error);
      return false;
    }
  };

  const clearSession = async () => {
    console.log('🧹 CLEARING SESSION');
    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear any stored tokens
    localStorage.removeItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
  };

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    forceSessionFromTokens,
    clearSession
  };
};
