
import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthContext from './AuthContext';

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
      isEmailVerified: auth.isEmailVerified
    });
  }, [auth.isAuthenticated, auth.isLoading, auth.isEmailVerified]);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
