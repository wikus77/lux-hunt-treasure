
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
      console.log("🔍 Fetch user roles called:", { 
        userId: auth.user?.id, 
        userEmail: auth.user?.email,
        isLoading: auth.isLoading,
        authObj: auth 
      });

      if (!auth.user?.id || auth.isLoading) {
        console.log("⚠️ No user or still loading, setting empty roles");
        setUserRoles([]);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Fetching roles for user:", auth.user.id, auth.user.email);
        
        // Check user_roles table for all roles - FIXED: remove .single()
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', auth.user.id);

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
            .eq('id', auth.user.id)
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
        if (auth.user.email === "wikus77@hotmail.it") {
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
        if (auth.user?.email === "wikus77@hotmail.it") {
          fallbackRoles = ["developer", "admin"];
          console.log("🔐 FORCED CLEARANCE APPLIED (fallback) for developer:", fallbackRoles);
        }
        
        setUserRoles(fallbackRoles);
      } finally {
        setIsRoleLoading(false);
      }
    };

    if (auth.user?.id) {
      fetchUserRoles();
    } else {
      console.log("⚠️ No auth.user, setting empty roles");
      setUserRoles([]);
      setIsRoleLoading(false);
    }
    
  }, [auth.user?.id]);

  // Check if user has a specific role - ENHANCED with forced clearance
  const hasRole = (role: string): boolean => {
    // 🔐 CLEARANCE FORZATA PER SVILUPPATORE REGISTRATO
    if (auth.user?.email === "wikus77@hotmail.it") {
      if (role === "developer" || role === "admin") {
        console.log(`🔐 FORCED hasRole(${role}) = true for developer`);
        return true;
      }
    }
    
    const result = userRoles.includes(role);
    console.log(`🔍 hasRole(${role}) = ${result}, userRoles:`, userRoles);
    return result;
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
