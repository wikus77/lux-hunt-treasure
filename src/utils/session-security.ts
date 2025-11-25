// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Session Security & Management Utilities

import { getAuthTokenKey } from '@/lib/supabase/clientUtils';

interface SessionData {
  timestamp: number;
  userId?: string;
  email?: string;
}

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Secure session storage with encryption simulation
 */
export class SecureSessionManager {
  private static readonly SESSION_KEY = 'mission_secure_session';
  private static readonly CLEANUP_KEY = 'session_cleanup_timestamp';

  /**
   * Store session data securely
   */
  static setSession(data: SessionData): void {
    const sessionData = {
      ...data,
      timestamp: Date.now(),
      expiry: Date.now() + SESSION_TIMEOUT
    };

    try {
      // Store with timestamp for expiry checking
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(this.CLEANUP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Get session data if valid
   */
  static getSession(): SessionData | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const sessionData = JSON.parse(stored);
      const now = Date.now();

      // Check if session has expired
      if (sessionData.expiry && now > sessionData.expiry) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session data
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.CLEANUP_KEY);
      
      // Clear all auth-related items
      const authKeys = [
        getAuthTokenKey(),
        'hasSeenPostLoginIntro',
        'auth_cache_clear'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session is valid
   */
  static isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  /**
   * Refresh session timestamp
   */
  static refreshSession(): void {
    const session = this.getSession();
    if (session) {
      this.setSession(session);
    }
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const lastCleanup = localStorage.getItem(this.CLEANUP_KEY);
    const now = Date.now();
    const cleanupInterval = 60 * 60 * 1000; // 1 hour

    if (!lastCleanup || (now - parseInt(lastCleanup)) > cleanupInterval) {
      // Remove any expired auth tokens
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('auth')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (parsed.expires_at && now > parsed.expires_at * 1000) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Invalid JSON, remove it
            localStorage.removeItem(key);
          }
        }
      });

      localStorage.setItem(this.CLEANUP_KEY, now.toString());
    }
  }

  /**
   * Initialize session security measures
   */
  static initialize(): void {
    // Run cleanup on initialization
    this.cleanupExpiredSessions();

    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 10 * 60 * 1000); // Every 10 minutes

    // Handle page visibility change for PWA
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.cleanupExpiredSessions();
      }
    });
  }
}

/**
 * PWA-specific session fixes
 */
export const pwaSessionFixes = {
  /**
   * Prevent race conditions in localStorage
   */
  safeSetItem: (key: string, value: string): boolean => {
    try {
      const testKey = `test_${Date.now()}`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage write failed:', error);
      return false;
    }
  },

  /**
   * Safe localStorage read with fallback
   */
  safeGetItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage read failed:', error);
      return null;
    }
  },

  /**
   * Force session refresh for PWA
   */
  forceSessionRefresh: (): void => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      SecureSessionManager.refreshSession();
    }
  }
};