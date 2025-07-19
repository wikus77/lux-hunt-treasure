
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { navigate } = useWouterNavigation();
  const [userRoles, setUserRoles] = useState<string[]>([]);
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
            navigate('/home');
          }, 1000);
        }
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        setUserRoles([]);
        setIsRoleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Rimuovo navigate dalle dipendenze

  // Fetch user roles when user changes
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!auth.user?.id || auth.isLoading) {
        setUserRoles([]);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching roles for user:", auth.user.id, auth.user.email);
        
        // Check user_roles table for all roles - FIXED: remove .single()
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', auth.user.id);

        if (rolesData && rolesData.length > 0) {
          const roles = rolesData.map(r => r.role);
          setUserRoles(roles);
          console.log("✅ User roles found:", roles);
        } else {
          // Check profiles table as fallback
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', auth.user.id)
            .single();

          setUserRoles(profileData?.role ? [profileData.role] : ['user']);
          console.log("✅ User role from profiles:", [profileData?.role || 'user']);
        }
      } catch (error) {
        console.error('❌ Error fetching user roles:', error);
        setUserRoles(['user']); // Default to user role
      } finally {
        setIsRoleLoading(false);
      }
    };

    if (auth.user?.id) {
      fetchUserRoles();
    } else {
      setUserRoles([]);
      setIsRoleLoading(false);
    }
    
  }, [auth.user?.id]);

  // Check if user has a specific role - FIXED: check array of roles
  const hasRole = (role: string): boolean => {
    console.log('🔍 Panel Button Debug hasRole check:', { 
      searchingForRole: role, 
      userRoles,
      hasRoleResult: userRoles.includes(role)
    });
    return userRoles.includes(role);
  };

  // Create the complete context value
  const authContextValue: AuthContextType = {
    ...auth,
    userRole: userRoles.length > 0 ? userRoles[0] : null, // Per compatibilità
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
