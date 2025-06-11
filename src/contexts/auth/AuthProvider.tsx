
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthContextType } from './types';
import { toast } from 'sonner';

// DEVELOPER UUID CONSTANT
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // IMMEDIATE developer setup
  useEffect(() => {
    const setupDeveloperAccess = () => {
      const developerEmail = 'wikus77@hotmail.it';
      const isCapacitor = window.location.protocol === 'capacitor:';
      const isLocalhost = window.location.hostname === 'localhost';
      
      if (isCapacitor || isLocalhost) {
        console.log('🔑 Auto-setting developer access for:', developerEmail);
        localStorage.setItem('developer_access', 'granted');
        localStorage.setItem('developer_user_email', developerEmail);
        localStorage.setItem('captcha_bypassed', 'true');
      }
    };

    setupDeveloperAccess();
  }, []);

  // Auto-redirect developer to /home
  useEffect(() => {
    const handleDeveloperAutoRedirect = () => {
      const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
      const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
      
      if ((hasDeveloperAccess || isDeveloperEmail) && window.location.pathname === '/') {
        console.log('🚀 Auto-redirecting developer to /home');
        window.location.href = '/home';
      }
    };

    handleDeveloperAutoRedirect();
  }, []);

  // Fetch user role when auth state changes
  useEffect(() => {
    const fetchUserRole = async () => {
      // PRIORITY: Developer access check
      const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
      const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
      
      if (hasDeveloperAccess || isDeveloperEmail || auth.user?.email === 'wikus77@hotmail.it') {
        console.log("🔑 Developer access - IMMEDIATE ADMIN ROLE");
        setUserRole('admin');
        setIsRoleLoading(false);
        setAuthInitialized(true);
        return;
      }

      if (!auth.isAuthenticated || !auth.user) {
        setUserRole(null);
        setIsRoleLoading(false);
        setAuthInitialized(true);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching role for user:", auth.user.id, auth.user.email);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', auth.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("❌ Error fetching profile:", error);
          throw error;
        }

        if (profile?.role) {
          console.log("✅ Role found:", profile.role);
          setUserRole(profile.role);
        } else {
          console.log("⚠️ No profile found, setting default user role");
          setUserRole('user');
        }
      } catch (error) {
        console.error("❌ Error in fetchUserRole:", error);
        setUserRole('user');
      } finally {
        setIsRoleLoading(false);
        setAuthInitialized(true);
      }
    };

    fetchUserRole();
  }, [auth.isAuthenticated, auth.user]);

  const hasRole = (role: string): boolean => {
    // Developer always has all roles
    const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
    const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
    
    if (hasDeveloperAccess || isDeveloperEmail || auth.user?.email === 'wikus77@hotmail.it') {
      return true;
    }
    
    return userRole === role || userRole === 'admin';
  };

  const contextValue: AuthContextType = {
    ...auth,
    userRole,
    hasRole,
    isRoleLoading,
    user: auth.user, // Ensure user is properly exposed
  };

  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
