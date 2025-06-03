
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AuthContext from './AuthContext';
import { AuthContextType } from './types';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock completo per sviluppatore - sempre autenticato
  const mockUser = {
    id: "dev-user-id",
    email: "wikus77@hotmail.it",
    role: "developer",
    aud: "authenticated",
    app_metadata: { provider: "email" },
    user_metadata: { name: "Wikus Developer" },
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
  } as User;

  const mockSession = {
    access_token: "dev-token",
    refresh_token: "dev-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: mockUser,
  } as Session;

  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>(mockSession);
  const [isLoading] = useState(false);
  const [isEmailVerified] = useState(true);
  const [userRole] = useState<string | null>('admin');
  const [isRoleLoading] = useState(false);

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return role === 'admin'; // Sviluppatore ha sempre ruolo admin
  };

  const getCurrentUser = () => mockUser;
  const getAccessToken = () => mockSession?.access_token || null;
  const isAuthenticated = true;

  const login = async (email: string, password: string) => {
    return { success: true, data: { user: mockUser, session: mockSession } };
  };

  const logout = async () => {
    toast.success("Logout effettuato");
  };

  const resendVerificationEmail = async (email: string) => {
    return { success: true };
  };

  const resetPassword = async (email: string) => {
    return { success: true };
  };

  // Create the complete context value
  const authContextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isEmailVerified,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail,
    resetPassword,
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
