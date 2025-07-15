
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { useNavigation } from '@/hooks/useNavigation';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { navigateTo } = useNavigation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Enhanced session monitoring
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state change:', event, 'Session exists:', !!session);
      
      // Handle successful authentication
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ User signed in successfully:", session.user.email);
        
        // Check if user should be redirected to home
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/auth' || currentPath === '/') {
          console.log("🏠 Redirecting authenticated user to /home");
          setTimeout(() => {
            navigateTo('/home');
          }, 1000);
        }
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        setUserRole(null);
        setIsRoleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigateTo]);

  // Fetch user role when user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!auth.user?.id || auth.isLoading) {
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching role for user:", auth.user.id, auth.user.email);
        
        // Check user_roles table for developer role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', auth.user.id)
          .single();

        if (roleData?.role) {
          setUserRole(roleData.role);
          console.log("✅ User role found:", roleData.role);
        } else {
          // Check profiles table as fallback
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', auth.user.id)
            .single();

          setUserRole(profileData?.role || 'user');
          console.log("✅ User role from profiles:", profileData?.role || 'user');
        }
      } catch (error) {
        console.error('❌ Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } finally {
        setIsRoleLoading(false);
      }
    };

    if (auth.user?.id) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setIsRoleLoading(false);
    }
    
  }, [auth.user?.id]);

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

export default AuthProvider;
