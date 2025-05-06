
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
  
  // Fetch user role when authenticated
  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.isAuthenticated() && auth.isEmailVerified && !auth.isLoading) {
        try {
          const userId = auth.getCurrentUser()?.id;
          
          if (userId) {
            // First check if role is stored in localStorage (for quicker access)
            const cachedRole = localStorage.getItem('userRole');
            if (cachedRole) {
              setUserRole(cachedRole);
            }
            
            // Then fetch from database to ensure it's up to date
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();
              
            if (error) {
              console.error("Error fetching user role:", error);
            } else if (data?.role) {
              setUserRole(data.role);
              localStorage.setItem('userRole', data.role);
            } else {
              // If no role is set, default to 'user'
              setUserRole('user');
              localStorage.setItem('userRole', 'user');
            }
          }
        } catch (error) {
          console.error("Error in fetchUserRole:", error);
        }
      } else {
        setUserRole(null);
        localStorage.removeItem('userRole');
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
      userRole
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
  }, [auth.isAuthenticated, auth.isLoading, auth.isEmailVerified, auth.getCurrentUser, userRole]);
  
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
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
