
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedAuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  userRole: string | null;
  isRoleLoading: boolean;
  hasRole: (role: string) => boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);

  // Fetch user role from Supabase (table: user_roles)
  const loadUserRole = useCallback(async (userId: string) => {
    setIsRoleLoading(true);
    try {
      console.log('🔍 Loading role for user:', userId);
      
      // Special handling for developer user
      if (user?.email === 'wikus77@hotmail.it') {
        console.log('🎯 Developer user detected, setting role to developer');
        setUserRole('developer');
        setIsRoleLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('❌ Role loading error:', error);
        setUserRole('user'); // fallback default
      } else if (data?.role) {
        console.log('✅ Role loaded:', data.role);
        setUserRole(data.role);
      } else {
        console.log('⚠️ No role found, using default');
        setUserRole('user'); // fallback default
      }
    } catch (err) {
      console.error('💥 Role loading exception:', err);
      setUserRole('user');
    }
    setIsRoleLoading(false);
  }, [user?.email]);

  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Checking initial session...');
      const { data } = await supabase.auth.getSession();
      
      console.log('📊 Initial session check:', { 
        hasSession: !!data.session, 
        userEmail: data.session?.user?.email 
      });
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session?.user);

      // Load role if possible
      if (data.session?.user?.id) {
        await loadUserRole(data.session.user.id);
      } else {
        setUserRole(null);
        setIsRoleLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 AUTH STATE CHANGE:', { event, hasSession: !!session, userEmail: session?.user?.email });
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      // Load role if possible
      if (session?.user?.id) {
        await loadUserRole(session.user.id);
      } else {
        setUserRole(null);
        setIsRoleLoading(false);
      }
    });

    checkSession();
    return () => listener?.subscription.unsubscribe();
  }, [loadUserRole]);

  // Make userRole null if the user logs out
  useEffect(() => {
    if (!user) {
      setUserRole(null);
    }
  }, [user]);

  // Provide hasRole() function with enhanced logic for developer/admin
  const hasRole = useCallback(
    (role: string) => {
      // Special handling for developer user
      if (user?.email === 'wikus77@hotmail.it') {
        if (role === 'developer' || role === 'admin' || role === 'user') {
          return true;
        }
      }
      
      if (!userRole) return false;
      if (userRole === 'admin' && role === 'developer') return true; // allow admin = dev
      if (role === 'user') return true; // everyone at least user
      return userRole === role;
    },
    [userRole, user?.email]
  );

  return (
    <UnifiedAuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        userRole,
        isRoleLoading,
        hasRole
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuthContext = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) throw new Error('useUnifiedAuthContext deve essere usato all\'interno di UnifiedAuthProvider');
  return context;
};
