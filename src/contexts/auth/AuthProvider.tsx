
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { useNavigate } from 'react-router-dom';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the base authentication functionality from our useAuth hook
  const auth = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Enhanced session monitoring for developer auto-login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state change:', event, 'Session exists:', !!session);
      
      // Force redirect for developer auto-login
      if (event === 'SIGNED_IN' && session?.user?.email === 'wikus77@hotmail.it') {
        console.log("🧪 Developer session detected, forcing redirect to /home");
        setTimeout(() => {
          navigate('/home');
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Monitor session changes for developer auto-login redirect
  useEffect(() => {
    if (auth.session?.user?.email === 'wikus77@hotmail.it' && !auth.isLoading) {
      console.log("🧪 Developer session active, checking current location...");
      
      // Only redirect if not already on a protected page
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/') {
        console.log("🧪 Sessione attiva, redirect forzato a /home...");
        navigate('/home');
      }
    }
  }, [auth.session, auth.isLoading, navigate]);

  // Simplified role fetching - no special cases
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
        
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', auth.user.id)
          .maybeSingle();

        setUserRole(data?.role || 'user');
        console.log("✅ User role found:", data?.role || 'user');
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
