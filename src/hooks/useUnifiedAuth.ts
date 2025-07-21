/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Unified Authentication Hook - PWA Safari iOS Optimized
 * Single source of truth for all authentication state
 * Replaces useAuth() and useAuthSessionManager()
 */

import { useContext } from 'react';
import AuthContext from '@/contexts/auth/AuthContext';
import type { AuthContextType } from '@/contexts/auth/types';

// Debug toggle for development - Enable for troubleshooting
const DEBUG_AUTH = true;

const log = (message: string, data?: any) => {
  if (DEBUG_AUTH) {
    console.log(`🔐 [UnifiedAuth] ${message}`, data || '');
  }
};

export const useUnifiedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedAuth deve essere usato all\'interno di un AuthProvider');
  }
  
  log('Hook accessed', {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    userEmail: context.getCurrentUser()?.email,
    hasSession: !!context.session
  });
  
  return context;
};

// Export default per compatibilità
export default useUnifiedAuth;