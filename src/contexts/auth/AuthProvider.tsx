import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  user: User | null;
  userId: string | undefined;
  userRole: string | null;
  isRoleLoading: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; data?: any; error?: Error }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isEmailVerified: false,
  user: null,
  userId: undefined,
  userRole: null,
  isRoleLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  signup: async () => ({ success: false })
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      setSession(session);

      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        fetchUserRole(session.user.id);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);

        setSession(session);

        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string, captchaToken?: string) => {
    try {
      console.log(`Login attempt for email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { 
          captchaToken // Pass the turnstile token as captchaToken
        } : undefined
      });

      if (error) {
        console.error('Login error:', error.message);
        return { success: false, error };
      }

      // Update auth state
      setSession(data.session);
      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);

      // After login, also fetch user role
      fetchUserRole(data.user.id);

      return { success: true, data };
    } catch (err) {
      console.error('Errore login:', err);
      return { success: false, error: err as Error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Update auth state
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  // Signup function
  const signup = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth'
        }
      });

      if (error) {
        console.error('Signup error:', error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Errore durante la registrazione:', err);
      return { success: false, error: err as Error };
    }
  };

  const fetchUserRole = async (userId: string) => {
    setIsRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
      }

      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setIsRoleLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isEmailVerified,
        user,
        userId: user?.id,
        userRole,
        isRoleLoading,
        login,
        logout,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
