// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
// M1SSION™ Enhanced AuthProvider with Custom Navigation

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@/hooks/useNavigation';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  userRole: string | null;
  hasRole: (role: string) => boolean;
  isRoleLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true
  });
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const { navigate } = useNavigation();

  // SINGLE AUTH STATE LISTENER TO PREVENT INFINITE LOOPS
  useEffect(() => {
    let mounted = true;
    let initialCheckDone = false;

    console.log('🔍 INITIALIZING SESSION (Enhanced Diagnostics)...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 ENHANCED AUTH STATE CHANGE:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email || 'No session',
          timestamp: new Date().toISOString()
        });

        setAuth({
          user: session?.user ?? null,
          session,
          isLoading: false
        });

        // Handle navigation ONLY for specific events, not all auth changes
        if (event === 'SIGNED_IN' && session?.user && !initialCheckDone) {
          const currentPath = window.location.pathname;
          if (currentPath === '/login' || currentPath === '/auth') {
            console.log("🏠 Redirecting authenticated user to /home");
            setTimeout(() => {
              navigate('/home');
            }, 1000);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          console.log("🚪 User signed out");
          setUserRole(null);
          setIsRoleLoading(false);
        }
      }
    );

    // Get initial session ONCE
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setAuth({
        user: session?.user ?? null,
        session,
        isLoading: false
      });
      
      initialCheckDone = true;
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // NO DEPENDENCIES TO PREVENT INFINITE LOOPS

  // Fetch user role when user changes (DEBOUNCED)
  useEffect(() => {
    if (!auth.user?.id || auth.isLoading) {
      setUserRole(null);
      setIsRoleLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching role for user:", auth.user.id);
        
        // Check user_roles table first
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', auth.user.id)
          .single();

        if (roleData?.role) {
          setUserRole(roleData.role);
        } else {
          // Fallback to profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', auth.user.id)
            .single();

          setUserRole(profileData?.role || 'user');
        }
      } catch (error) {
        console.error('❌ Error fetching user role:', error);
        setUserRole('user'); // Default fallback
      } finally {
        setIsRoleLoading(false);
      }
    };

    // Debounce the role fetch to prevent excessive calls
    const timer = setTimeout(fetchUserRole, 300);
    return () => clearTimeout(timer);
    
  }, [auth.user?.id]); // ONLY depend on user ID

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  // Create the complete context value
  const authContextValue: AuthContextType = {
    ...auth,
    userRole,
    hasRole,
    isRoleLoading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * AuthProvider ottimizzato per evitare loop infiniti e session check multipli
 * Implementazione Capacitor iOS stabile con custom navigation
 */