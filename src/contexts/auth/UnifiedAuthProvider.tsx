
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

  // Enhanced session persistence for iOS WebView
  const persistSessionForIOS = useCallback(async (session: Session | null) => {
    const isCapacitor = !!(window as any).Capacitor;
    
    if (isCapacitor && session?.access_token) {
      console.log('🍎 iOS: Persisting session data for WebView');
      localStorage.setItem('hasStoredAccess', 'true');
      localStorage.setItem('developer_access_granted', 'true');
      localStorage.setItem('ios_session_token', session.access_token);
      localStorage.setItem('ios_user_email', session.user?.email || '');
      
      // Force a small delay for iOS to ensure session is properly set
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }, []);

  // Fetch user role from Supabase (table: user_roles)
  const loadUserRole = useCallback(async (userId: string) => {
    setIsRoleLoading(true);
    try {
      console.log('🔍 Loading role for user:', userId);
      
      // Special handling for developer user with iOS persistence check
      if (user?.email === 'wikus77@hotmail.it') {
        console.log('🎯 Developer user detected, setting role to developer');
        setUserRole('developer');
        
        // Ensure iOS persistence
        const isCapacitor = !!(window as any).Capacitor;
        if (isCapacitor) {
          localStorage.setItem('developer_user_email', 'wikus77@hotmail.it');
          localStorage.setItem('unlimited_access', 'true');
          localStorage.setItem('bypass_all_restrictions', 'true');
        }
        
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
        userEmail: data.session?.user?.email,
        hasAccessToken: !!data.session?.access_token
      });
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsAuthenticated(!!data.session?.user);

      // Enhanced iOS session persistence
      if (data.session) {
        await persistSessionForIOS(data.session);
      }

      // Load role if possible
      if (data.session?.user?.id) {
        await loadUserRole(data.session.user.id);
      } else {
        setUserRole(null);
        setIsRoleLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 AUTH STATE CHANGE:', { 
        event, 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.access_token
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      // Enhanced iOS session persistence
      if (session) {
        await persistSessionForIOS(session);
      }

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
  }, [loadUserRole, persistSessionForIOS]);

  // Make userRole null if the user logs out
  useEffect(() => {
    if (!user) {
      setUserRole(null);
      
      // Clear iOS persistence on logout
      const isCapacitor = !!(window as any).Capacitor;
      if (isCapacitor) {
        localStorage.removeItem('hasStoredAccess');
        localStorage.removeItem('developer_access_granted');
        localStorage.removeItem('ios_session_token');
        localStorage.removeItem('ios_user_email');
        localStorage.removeItem('developer_user_email');
        localStorage.removeItem('unlimited_access');
        localStorage.removeItem('bypass_all_restrictions');
      }
    }
  }, [user]);

  // Provide hasRole() function with enhanced logic for developer/admin
  const hasRole = useCallback(
    (role: string) => {
      // Special handling for developer user with iOS fallback check
      if (user?.email === 'wikus77@hotmail.it') {
        if (role === 'developer' || role === 'admin' || role === 'user') {
          return true;
        }
      }
      
      // iOS fallback check using localStorage
      const isCapacitor = !!(window as any).Capacitor;
      if (isCapacitor && localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it') {
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
