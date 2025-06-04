
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isEmailVerified = user?.email_confirmed_at != null;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          // Fetch user role
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!error && data) {
              setUserRole(data.role);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setError(error as Error);
          }
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, captchaToken?: string) => {
    try {
      const options: any = {};
      
      if (captchaToken) {
        options.options = {
          captchaToken: captchaToken
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        ...options
      });

      if (error) {
        setError(error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      const authError = { message: "Si è verificato un errore imprevisto durante l'accesso." } as Error;
      setError(authError);
      return {
        success: false,
        error: authError
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setError(error as Error);
    }
  };

  const getCurrentUser = () => user;

  const getAccessToken = () => {
    return session?.access_token || null;
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Errore imprevisto' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const hasRole = (role: string) => {
    return userRole === role;
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    loading: isLoading,
    error,
    isAuthenticated,
    isEmailVerified,
    userRole,
    getCurrentUser,
    getAccessToken,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    hasRole,
    isRoleLoading: isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
