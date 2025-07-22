/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Supabase Auth Helper - WARNING FREE UTILITIES
 * Elimina i warnings #4-6, #7-9 centralizzando le chiamate auth
 */

import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// CACHE per prevenire chiamate ridondanti (WARNING #4-6 FIXED)
let sessionCache: Session | null = null;
let userCache: User | null = null;
let lastFetch = 0;
const CACHE_DURATION = 1000; // 1 secondo cache

/**
 * GET USER - Warning-free, cached implementation
 * Sostituisce tutte le chiamate dirette a supabase.auth.getUser()
 */
export const getAuthenticatedUser = async (): Promise<User | null> => {
  const now = Date.now();
  
  // Return cached se recente (WARNING #6 FIXED)
  if (userCache && now - lastFetch < CACHE_DURATION) {
    return userCache;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('🚨 Auth Helper: Error getting user:', error.message);
      return null;
    }
    
    userCache = user;
    lastFetch = now;
    return user;
  } catch (error) {
    console.warn('🚨 Auth Helper: Exception getting user:', error);
    return null;
  }
};

/**
 * GET SESSION - Warning-free, cached implementation
 * Sostituisce tutte le chiamate dirette a supabase.auth.getSession()
 */
export const getAuthenticatedSession = async (): Promise<Session | null> => {
  const now = Date.now();
  
  // Return cached se recente (WARNING #5 FIXED)
  if (sessionCache && now - lastFetch < CACHE_DURATION) {
    return sessionCache;
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('🚨 Auth Helper: Error getting session:', error.message);
      return null;
    }
    
    sessionCache = session;
    lastFetch = now;
    return session;
  } catch (error) {
    console.warn('🚨 Auth Helper: Exception getting session:', error);
    return null;
  }
};

/**
 * CLEAR CACHE - Da chiamare su auth state changes
 */
export const clearAuthCache = (): void => {
  sessionCache = null;
  userCache = null;
  lastFetch = 0;
};

/**
 * SAFE AUTH STATE LISTENER - Prevents memory leaks (WARNING #1-3 FIXED)
 */
export const createSafeAuthListener = (
  callback: (event: string, session: Session | null) => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Clear cache on auth changes
    clearAuthCache();
    callback(event, session);
  });
  
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * GET USER ID SAFELY - Per inserimenti database (WARNING #21-22 FIXED)
 */
export const getUserIdForInsert = async (): Promise<string | null> => {
  const user = await getAuthenticatedUser();
  return user?.id || null;
};

/**
 * EXECUTE WITH AUTH - Wrapper per operazioni che richiedono auth
 */
export const executeWithAuth = async <T>(
  operation: (userId: string) => Promise<T>
): Promise<T | null> => {
  const userId = await getUserIdForInsert();
  
  if (!userId) {
    console.warn('🚨 Auth Helper: Operation requires authentication');
    return null;
  }
  
  return await operation(userId);
};