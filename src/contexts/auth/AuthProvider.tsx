
import React from 'react';
import AuthContext from './AuthContext';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  console.log("🔓 AUTH PROVIDER: BYPASSING ALL AUTHENTICATION");
  
  // BYPASS ALL AUTHENTICATION - PROVIDE FAKE AUTH STATE
  const authContextValue: AuthContextType = {
    login: async () => ({ success: true }),
    logout: async () => {},
    isAuthenticated: true, // FAKE AUTHENTICATED STATE
    isLoading: false,
    isEmailVerified: true, // FAKE VERIFIED STATE
    getCurrentUser: () => ({ 
      id: 'bypass-user', 
      email: 'bypass@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }),
    getAccessToken: () => 'bypass-token',
    session: null,
    resendVerificationEmail: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    userRole: 'user',
    hasRole: () => true, // ALWAYS HAS ROLE
    isRoleLoading: false,
    user: { 
      id: 'bypass-user', 
      email: 'bypass@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
