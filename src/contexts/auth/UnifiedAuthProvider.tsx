
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

  // --- Role logic additions ---
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);

  // Fetch user role from Supabase (table: user_roles)
  const loadUserRole = useCallback(async (userId: string) => {
    setIsRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        setUserRole(null);
      } else if (data?.role) {
        setUserRole(data.role);
      } else {
        setUserRole('user'); // fallback default
      }
    } catch {
      setUserRole(null);
    }
    setIsRoleLoading(false);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session?.user);

      // Load role if possible
      if (data.session?.user?.id) {
        loadUserRole(data.session.user.id);
      } else {
        setUserRole(null);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      // Load role if possible
      if (session?.user?.id) {
        loadUserRole(session.user.id);
      } else {
        setUserRole(null);
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

  // Provide hasRole() function
  const hasRole = useCallback(
    (role: string) => {
      if (!userRole) return false;
      if (userRole === 'admin' && role === 'developer') return true; // allow admin = dev
      if (role === 'user') return true; // everyone at least user
      return userRole === role;
    },
    [userRole]
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
  if (!context) throw new Error('useUnifiedAuthContext deve essere usato all’interno di UnifiedAuthProvider');
  return context;
};
