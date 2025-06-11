
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the base authentication functionality from our useAuth hook
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // SIMPLIFIED: No retry, no infinite loops - just one check
  useEffect(() => {
    const fetchUserRoleOnce = async () => {
      if (!auth.user?.id || auth.isLoading) {
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching role for user:", auth.user.id, auth.user.email);
        
        // First try with user ID
        const { data: dataById } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', auth.user.id)
          .maybeSingle();

        if (dataById?.role) {
          console.log("✅ User role found:", dataById.role);
          setUserRole(dataById.role);
          setIsRoleLoading(false);
          return;
        }

        // If not found and user is developer, set admin role
        if (auth.user.email === 'wikus77@hotmail.it') {
          console.log("🔓 Developer access - setting admin role");
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user role:', error);
        
        // Fallback for developer
        if (auth.user.email === 'wikus77@hotmail.it') {
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } finally {
        setIsRoleLoading(false);
      }
    };

    // CRITICAL: Only run once when user changes, no retries
    if (auth.user?.id) {
      fetchUserRoleOnce();
    } else {
      setUserRole(null);
      setIsRoleLoading(false);
    }
    
  }, [auth.user?.id]); // SIMPLIFIED: Only depend on user ID

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    // Special case for developer - always treated as admin
    if (auth.user?.email === 'wikus77@hotmail.it') {
      return role === 'admin';
    }
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
