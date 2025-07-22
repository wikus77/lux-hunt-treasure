/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Debug Configuration - WARNING #24 FIXED
 * Gestione sicura dei localStorage senza interferenze Supabase
 */

// WARNING #24 FIXED: Safe localStorage access without Supabase token conflicts
export const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      // Avoid accessing Supabase auth tokens directly
      if (key.includes('supabase') || key.includes('auth-token')) {
        console.warn('🚨 Debug: Blocked direct access to Supabase storage key:', key);
        return null;
      }
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    try {
      // Avoid overwriting Supabase auth tokens
      if (key.includes('supabase') || key.includes('auth-token')) {
        console.warn('🚨 Debug: Blocked direct write to Supabase storage key:', key);
        return;
      }
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  
  remove: (key: string): void => {
    try {
      // Avoid removing Supabase auth tokens
      if (key.includes('supabase') || key.includes('auth-token')) {
        console.warn('🚨 Debug: Blocked removal of Supabase storage key:', key);
        return;
      }
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
  
  // Safe clear that preserves Supabase tokens
  safeClear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (!key.includes('supabase') && !key.includes('auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Silently fail
    }
  }
};

// Debug mode toggle (safe for production)
export const debugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  verbose: false, // Can be enabled for detailed debugging
  
  log: (message: string, data?: any) => {
    if (debugConfig.enabled) {
      console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (debugConfig.enabled) {
      console.warn(`⚠️ [DEBUG] ${message}`, data || '');
    }
  },
  
  error: (message: string, data?: any) => {
    console.error(`🚨 [DEBUG] ${message}`, data || '');
  }
};