
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the base authentication functionality from our useAuth hook
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Function to automatically create admin profile
  const createAdminProfile = async (userId: string, userEmail: string) => {
    console.log("⚠️ Attempting to create admin profile for:", userEmail);
    
    try {
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userEmail,
          role: 'admin',
          full_name: 'Admin User'
        })
        .select('role')
        .single();
        
      if (error) {
        console.error("❌ Error creating admin profile:", error);
        return false;
      }
      
      console.log("✅ Admin profile created successfully:", newProfile?.role);
      setUserRole(newProfile?.role || 'admin');
      return true;
    } catch (err) {
      console.error("❌ Exception during admin profile creation:", err);
      return false;
    }
  };

  // CRITICAL: Evita cicli infiniti con useEffect ottimizzato
  useEffect(() => {
    // Previeni esecuzioni multiple simultanee
    if (isRoleLoading && authInitialized) return;

    const fetchUserRole = async () => {
      // If not authenticated, set role to null
      if (!auth.isAuthenticated || !auth.user) {
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 Searching for profile for user:", auth.user.id, auth.user.email);
        
        // First try with user ID
        const { data: dataById, error: errorById } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', auth.user.id)
          .maybeSingle();

        if (dataById && dataById.role) {
          console.log("✅ User role found via ID:", dataById.role);
          setUserRole(dataById.role);
          setIsRoleLoading(false);
          setRetryCount(0);
          return;
        }
        
        if (errorById) {
          console.error('❌ Error fetching user role by ID:', errorById);
        }

        // If not found via ID, try with email
        if (auth.user.email) {
          const { data: dataByEmail, error: errorByEmail } = await supabase
            .from('profiles')
            .select('role, id')
            .eq('email', auth.user.email)
            .maybeSingle();

          if (dataByEmail && dataByEmail.role) {
            console.log("✅ User role found via email:", dataByEmail.role);
            setUserRole(dataByEmail.role);
            setIsRoleLoading(false);
            setRetryCount(0);
            return;
          }
          
          if (errorByEmail) {
            console.error('❌ Error fetching user role by email:', errorByEmail);
          }
        }

        // If not found and user is wikus77@hotmail.it, create admin profile
        if (auth.user.email === 'wikus77@hotmail.it') {
          const success = await createAdminProfile(auth.user.id, auth.user.email);
          if (success) {
            setIsRoleLoading(false);
            setRetryCount(0);
            return;
          }
        }
        
        // If we're here, no profile was found
        if (retryCount < maxRetries) {
          console.log(`⚠️ No profile found, retrying (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          
          // Retry after a brief delay
          setTimeout(() => {
            fetchUserRole();
          }, 1000);
          return;
        }
        
        // Default fallback after all attempts
        console.log("⚠️ No profile found after multiple attempts");
        
        // If user is the admin email but no profile exists, force create one as a last resort
        if (auth.user.email === 'wikus77@hotmail.it') {
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('❌ Exception fetching user role:', error);
        
        // If user is the admin email, force the role as admin even if there's an error
        if (auth.user.email === 'wikus77@hotmail.it') {
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } finally {
        if (retryCount >= maxRetries) {
          setIsRoleLoading(false);
        }
      }
    };

    // PREVIENI CICLI: esegui solo quando necessario
    if (auth.isAuthenticated && auth.user && !authInitialized) {
      fetchUserRole();
      setAuthInitialized(true);
    } else if (!auth.isAuthenticated) {
      setUserRole(null);
      setIsRoleLoading(false);
      setAuthInitialized(true);
    }
    
  }, [auth.isAuthenticated, auth.user?.id, auth.isLoading, retryCount]);

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    // Special case for wikus77@hotmail.it - always treated as admin
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
