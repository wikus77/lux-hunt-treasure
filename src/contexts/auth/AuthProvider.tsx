import { getSupabaseClient } from "@/integrations/supabase/getClient"
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { useNavigate } from 'react-router-dom';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Enhanced session monitoring with Capacitor iOS fix
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const checkSessionWithRetry = async () => {
  const client = await getSupabaseClient();
      try {
        const { data: { session } } = await client.auth.getSession();
        console.log("🔄 Session check #" + (retryCount + 1) + ":", !!session);
        
        if (!session && retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkSessionWithRetry, 500);
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
      }
    };

    checkSessionWithRetry();

    const setupAuthStateChange = async () => {
      const client = await getSupabaseClient();
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      console.log('🔍 ENHANCED AUTH STATE CHANGE:', event, 'Session exists:', !!session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ User signed in successfully:", session.user.email);
        
        if (typeof window !== 'undefined' && window.location.protocol === 'capacitor:') {
          console.log("📱 Capacitor detected: forcing session refresh");
          client.auth.refreshSession();
        }

        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/auth' || currentPath === '/') {
          console.log("🏠 Redirecting authenticated user to /home");
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        setUserRole(null);
        setIsRoleLoading(false);
      }
      });

      return () => subscription.unsubscribe();
    };

    setupAuthStateChange();
  }, [navigate]);

  useEffect(() => {
    const fetchUserRole = async () => {
  const client = await getSupabaseClient();
      if (!auth.user?.id || auth.isLoading) {
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching role for user:", auth.user.id, auth.user.email);
        
        const { data: roleData } = await client
          .from('user_roles')
          .select('role')
          .eq('user_id', auth.user.id)
          .single();

        if (roleData?.role) {
          setUserRole(roleData.role);
          console.log("✅ User role found:", roleData.role);
        } else {
          const { data: profileData } = await client
            .from('profiles')
            .select('role')
            .eq('id', auth.user.id)
            .single();

          setUserRole(profileData?.role || 'user');
          console.log("✅ User role from profiles:", profileData?.role || 'user');
        }
      } catch (error) {
        console.error('❌ Error fetching user role:', error);
        setUserRole('user');
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

  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

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
