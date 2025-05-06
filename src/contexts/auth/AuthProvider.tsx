
import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthContext from './AuthContext';
import { registerDeviceForNotifications } from '@/integrations/firebase/firebase-client';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  
  // Log authentication state changes for debugging
  useEffect(() => {
    console.log("Auth provider state:", {
      isAuthenticated: auth.isAuthenticated(),
      isLoading: auth.isLoading,
      isEmailVerified: auth.isEmailVerified,
      userId: auth.getCurrentUser()?.id
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
  }, [auth.isAuthenticated, auth.isLoading, auth.isEmailVerified, auth.getCurrentUser]);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
