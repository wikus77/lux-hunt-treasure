/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Auth Upgrade Hook - WARNING #7-9 FIXED
 * Sostituisce tutte le chiamate dirette supabase.auth con AuthContext
 */

import { useAuthContext } from '@/contexts/auth';
import { getAuthenticatedUser, getUserIdForInsert } from '@/utils/supabaseAuthHelper';

/**
 * Hook che upgrade automaticamente da chiamate dirette a AuthContext
 */
export const useAuthUpgrade = () => {
  const { user, isAuthenticated, getCurrentUser } = useAuthContext();
  
  // Replacement per supabase.auth.getUser() - WARNING #7 FIXED
  const getUser = async () => {
    // Prova prima AuthContext (più affidabile)
    if (user) {
      return { data: { user }, error: null };
    }
    
    // Fallback a helper (cached)
    const authUser = await getAuthenticatedUser();
    return { 
      data: { user: authUser }, 
      error: authUser ? null : new Error('No authenticated user') 
    };
  };
  
  // Replacement per inserimenti database - WARNING #21-22 FIXED
  const getUserForInsert = async () => {
    const userId = await getUserIdForInsert();
    if (!userId) {
      throw new Error('User authentication required for this operation');
    }
    return userId;
  };
  
  // Safe check per operazioni che richiedono auth
  const requireAuth = (operation: string) => {
    if (!isAuthenticated) {
      console.warn(`🚨 Auth Required: ${operation} requires authentication`);
      return false;
    }
    return true;
  };
  
  return {
    getUser,
    getUserForInsert,
    requireAuth,
    // Direct access to AuthContext
    user,
    isAuthenticated,
    getCurrentUser
  };
};