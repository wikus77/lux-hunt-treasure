
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We get the base authentication functionality from our useAuth hook
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fetch user role when auth state changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!auth.isAuthenticated || !auth.user) {
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', auth.user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else {
          setUserRole(data?.role || null);
        }
      } catch (error) {
        console.error('Exception fetching user role:', error);
        setUserRole(null);
      } finally {
        setIsRoleLoading(false);
      }
    };

    fetchUserRole();
    
    // Mark auth as initialized after first load
    if (!authInitialized && !auth.isLoading) {
      setAuthInitialized(true);
    }
    
  }, [auth.isAuthenticated, auth.user, auth.isLoading]);

  // Show loading state on first initialization
  useEffect(() => {
    if (auth.isLoading && !authInitialized) {
      console.log('Auth is initializing...');
    } else if (authInitialized) {
      console.log('Auth initialization complete');
    }
  }, [auth.isLoading, authInitialized]);

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  // Create the complete context value by combining auth hook values with role information
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

export default AuthProvider;
