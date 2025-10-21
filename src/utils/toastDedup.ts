/**
 * Toast deduplication utility
 * Prevents duplicate toasts with the same message key within a time window
 */

const toastHistory = new Map<string, number>();
const DEDUP_WINDOW = 2000; // 2 seconds

/**
 * Check if a toast with this key was recently shown
 * @param key - Unique identifier for the toast message
 * @returns true if toast should be shown, false if it's a duplicate
 */
export function shouldShowToast(key: string): boolean {
  const now = Date.now();
  const lastShown = toastHistory.get(key);
  
  if (lastShown && now - lastShown < DEDUP_WINDOW) {
    return false; // Duplicate within window
  }
  
  toastHistory.set(key, now);
  
  // Cleanup old entries periodically
  if (toastHistory.size > 50) {
    for (const [k, time] of toastHistory.entries()) {
      if (now - time > DEDUP_WINDOW * 2) {
        toastHistory.delete(k);
      }
    }
  }
  
  return true;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
