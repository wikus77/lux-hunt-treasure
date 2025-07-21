
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType } from './types';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // DIRECT STATE MANAGEMENT - NO EXTERNAL HOOKS
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const { navigate } = useWouterNavigation();

  // INITIAL SESSION CHECK
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔧 AuthProvider: DIRECT initialization starting...");
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 Initial session check:', {
          hasError: !!error,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        });
        
        if (!error && session && session.user) {
          console.log('✅ EXISTING SESSION FOUND:', session.user.email);
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('❌ INIT AUTH ERROR:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // CENTRALIZED AUTH STATE HANDLER - DIRECT STATE UPDATES
  useEffect(() => {
    console.log("🔧 AuthProvider: Setting up DIRECT auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 DIRECT AUTH EVENT:', {
        event,
        pathname: window.location.pathname,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        visibility: document.visibilityState,
        timestamp: new Date().toISOString()
      });
      
      // DIRECT STATE UPDATES
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ SIGNED_IN event received - UPDATING STATE DIRECTLY:", session.user.email);
        
        // PWA VISIBILITY CHECK
        if (document.visibilityState === 'hidden') {
          console.log("🔄 PWA is hidden, waiting for visibility...");
          const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
              console.log("👁️ PWA visible again, processing login...");
              setSession(session);
              setUser(session.user);
              document.removeEventListener("visibilitychange", handleVisibilityChange);
            }
          };
          document.addEventListener("visibilitychange", handleVisibilityChange);
          return;
        }
        
        // IMMEDIATE STATE UPDATE
        setSession(session);
        setUser(session.user);
        setIsLoading(false);
        
        // CONDITIONAL REDIRECT
        const currentPath = window.location.pathname;
        if (currentPath === "/login" || currentPath === "/register") {
          console.log(`🏠 Redirecting from ${currentPath} to / after login success`);
          setTimeout(() => navigate('/', { replace: true }), 100);
        }
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out - CLEARING STATE DIRECTLY");
        setSession(null);
        setUser(null);
        setUserRoles([]);
        setIsRoleLoading(false);
      }
    });

    return () => {
      console.log("🧹 AuthProvider: Cleaning up DIRECT auth state listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch user roles when user changes
  useEffect(() => {
    const fetchUserRoles = async () => {
      console.log("🔍 Fetch user roles called:", { 
        userId: user?.id, 
        userEmail: user?.email,
        isLoading 
      });

      if (!user?.id || isLoading) {
        console.log("⚠️ No user or still loading, setting empty roles");
        setUserRoles([]);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching roles for user:", user.id, user.email);
        
        // Check user_roles table for all roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        console.log("🔍 Roles query result:", { rolesData, rolesError });

        if (rolesError) {
          console.error("❌ Error fetching from user_roles:", rolesError);
          throw rolesError;
        }

        let finalRoles: string[] = [];

        if (rolesData && rolesData.length > 0) {
          finalRoles = rolesData.map(r => r.role);
          console.log("✅ User roles found:", finalRoles);
        } else {
          console.log("⚠️ No roles found in user_roles, checking profiles as fallback");
          // Check profiles table as fallback
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          console.log("🔍 Profile query result:", { profileData, profileError });

          if (profileError && profileError.code !== 'PGRST116') {
            console.error("❌ Error fetching from profiles:", profileError);
          }

          finalRoles = profileData?.role ? [profileData.role] : ['user'];
          console.log("✅ User role from profiles:", finalRoles);
        }

        // 🔐 CLEARANCE FORZATA PER SVILUPPATORE REGISTRATO
        // Override permanente per wikus77@hotmail.it
        if (user.email === "wikus77@hotmail.it") {
          if (!finalRoles.includes("developer")) {
            finalRoles.push("developer");
          }
          if (!finalRoles.includes("admin")) {
            finalRoles.push("admin");  
          }
          console.log("🔐 FORCED CLEARANCE APPLIED for developer:", finalRoles);
        }

        setUserRoles(finalRoles);
      } catch (error) {
        console.error("❌ Error fetching user roles:", error);
        
        // 🔐 CLEARANCE FORZATA anche in caso di errore
        let fallbackRoles = ['user'];
        if (user?.email === "wikus77@hotmail.it") {
          fallbackRoles = ["developer", "admin"];
          console.log("🔐 FORCED CLEARANCE APPLIED (fallback) for developer:", fallbackRoles);
        }
        
        setUserRoles(fallbackRoles);
      } finally {
        setIsRoleLoading(false);
      }
    };

    if (user?.id) {
      fetchUserRoles();
    } else {
      console.log("⚠️ No user, setting empty roles");
      setUserRoles([]);
      setIsRoleLoading(false);
    }
    
  }, [user?.id]);

  // Check if user has a specific role - ENHANCED with forced clearance
  const hasRole = (role: string): boolean => {
    // 🔐 CLEARANCE FORZATA PER SVILUPPATORE REGISTRATO
    if (user?.email === "wikus77@hotmail.it") {
      if (role === "developer" || role === "admin") {
        console.log(`🔐 FORCED hasRole(${role}) = true for developer`);
        return true;
      }
    }
    
    const result = userRoles.includes(role);
    console.log(`🔍 hasRole(${role}) = ${result}, userRoles:`, userRoles);
    return result;
  };

  // AUTH METHODS - Direct Supabase integration
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any; session?: any }> => {
    console.log('🔐 DIRECT LOGIN STARTING for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error };
      }
      return { success: true, session: data.session };
    } catch (error) {
      return { success: false, error };
    }
  };

  const logout = async () => {
    console.log('🚪 DIRECT LOGOUT STARTING');
    await supabase.auth.signOut();
    // State will be cleared by onAuthStateChange listener
  };

  // Create the complete context value with DIRECT state
  const authContextValue: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    isEmailVerified: user?.email_confirmed_at ? true : false,
    userRole: userRoles.length > 0 ? userRoles[0] : null,
    hasRole,
    isRoleLoading,
    login,
    logout,
    register: async () => { throw new Error('Registration disabled'); },
    resetPassword: async () => { throw new Error('Password reset disabled'); },
    resendVerificationEmail: async () => { throw new Error('Email verification disabled'); },
    getCurrentUser: () => user,
    getAccessToken: () => session?.access_token || '',
  };

  console.log('🔍 AuthProvider rendering with state:', {
    hasUser: !!user,
    hasSession: !!session,
    isAuthenticated: !!session && !!user,
    isLoading,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
