import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Enhanced session monitoring - NO AUTOMATIC REDIRECTS FROM LANDING
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state change:', event, 'Session exists:', !!session, 'Current path:', location.pathname);
      
      // Handle successful authentication - ONLY from login/auth pages
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ User signed in successfully:", session.user.email);
        
        // CRITICAL: Only redirect from login/auth pages, NOT from landing page
        const currentPath = location.pathname;
        if (currentPath === '/login' || currentPath === '/auth') {
          console.log("🏠 Redirecting authenticated user from auth page to /home");
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        }
        // NO redirect if user is on landing page (/)
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        setUserRole(null);
        setIsRoleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

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
