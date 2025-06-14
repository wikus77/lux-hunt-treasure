
import React, { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

interface UnifiedAuthContextType extends ReturnType<typeof useUnifiedAuth> {
  userRole: string | null;
  hasRole: (role: string) => boolean;
  isRoleLoading: boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useUnifiedAuth();
  
  // Safe navigation hook with fallback
  let navigate: (path: string, options?: any) => void;
  let location: { pathname: string };
  
  try {
    navigate = useNavigate();
    location = useLocation();
  } catch (error) {
    console.warn('🔧 UNIFIED AUTH: useNavigate/useLocation not available yet, using fallback');
    navigate = () => {};
    location = { pathname: '/' };
  }

  // Simplified role management - no conflicts with session manager
  const userRole = auth.user?.user_metadata?.role || 'user';
  const isRoleLoading = false; // Simplified for now
  
  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  // Single, clean auth context value
  const authContextValue: UnifiedAuthContextType = {
    ...auth,
    userRole,
    hasRole,
    isRoleLoading
  };

  console.log('🔧 UNIFIED AUTH PROVIDER: Context value:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    userEmail: auth.user?.email,
    currentPath: location.pathname
  });

  return (
    <UnifiedAuthContext.Provider value={authContextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuthContext = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedAuthContext deve essere usato all\'interno di un UnifiedAuthProvider');
  }
  
  return context;
};
