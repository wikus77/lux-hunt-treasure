
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthContext from './AuthContext';
import { registerDeviceForNotifications } from '@/integrations/firebase/firebase-client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);
  
  // Fetch user role when authenticated
  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.isAuthenticated() && auth.isEmailVerified && !auth.isLoading) {
        try {
          setIsRoleLoading(true);
          const userId = auth.getCurrentUser()?.id;
          
          if (userId) {
            // First check if role is stored in localStorage (for quicker access)
            const cachedRole = localStorage.getItem('userRole');
            if (cachedRole) {
              setUserRole(cachedRole);
              setIsRoleLoading(false);
              console.log("Using cached role from localStorage:", cachedRole);
            }
            
            // Then fetch from database to ensure it's up to date
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
                
              if (error) {
                console.error("Error fetching user role:", error);
                
                // If we have a cached role, continue using it
                if (!cachedRole) {
                  // Fallback to 'user' role if nothing else is available
                  setUserRole('user');
                  localStorage.setItem('userRole', 'user');
                  console.log("Falling back to default 'user' role due to error");
                }
              } else if (data?.role) {
                setUserRole(data.role);
                localStorage.setItem('userRole', data.role);
                console.log("Updated role from database:", data.role);
              } else {
                // If no role is set, default to 'user'
                setUserRole('user');
                localStorage.setItem('userRole', 'user');
                console.log("No role found in database, defaulting to 'user'");
              }
            } catch (fetchError) {
              console.error("Error in database fetch:", fetchError);
              // Continue using cached role if available
            }
            
            setIsRoleLoading(false);
          }
        } catch (error) {
          console.error("Error in fetchUserRole:", error);
          setIsRoleLoading(false);
        }
      } else {
        setUserRole(null);
        localStorage.removeItem('userRole');
        setIsRoleLoading(false);
      }
    };
    
    fetchUserRole();
  }, [auth.isAuthenticated, auth.isLoading, auth.isEmailVerified, auth.getCurrentUser]);
  
  // Log authentication state changes for debugging
  useEffect(() => {
    console.log("Auth provider state:", {
      isAuthenticated: auth.isAuthenticated(),
      isLoading: auth.isLoading,
      isEmailVerified: auth.isEmailVerified,
      userId: auth.getCurrentUser()?.id,
      userRole,
      isRoleLoading
    });
    
    // Register for notifications when user is authenticated
    if (auth.isAuthenticated() && auth.isEmailVerified && !auth.isLoading) {
      // Check if notification permission is granted
      if (Notification.permission === 'granted') {
        registerDeviceForNotifications()
          .then(result => {
            console.log("Device registration for notifications:", result);
          })
          .catch(error => {
            console.error("Error registering device for notifications:", error);
          });
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.isEmailVerified, auth.getCurrentUser, userRole, isRoleLoading]);
  
  // Function to check if user has a specific role
  const hasRole = (role: string): boolean => {
    if (!userRole) return false;
    
    // Super admin has access to everything
    if (userRole === 'admin') return true;
    
    // Exact role match
    return userRole === role;
  };
  
  return (
    <AuthContext.Provider 
      value={{
        ...auth,
        userRole,
        hasRole,
        isRoleLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
