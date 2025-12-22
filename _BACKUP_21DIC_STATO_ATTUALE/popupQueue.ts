/**
 * POPUP QUEUE MANAGER — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Sistema di coda per gestire popup in sequenza.
 * Evita sovrapposizioni: mostra un popup alla volta.
 * 
 * USAGE:
 * - Prima di mostrare un popup: if (canShowPopup('my-popup-id')) { show() }
 * - Quando il popup appare: lockPopupQueue('my-popup-id')
 * - Quando il popup viene chiuso: unlockPopupQueue('my-popup-id')
 */

// ═══════════════════════════════════════════════════════════════
// 🔒 POPUP QUEUE STATE
// ═══════════════════════════════════════════════════════════════

const QUEUE_LOCK_KEY = 'm1_popup_queue_lock';
const QUEUE_LOCK_TIMESTAMP_KEY = 'm1_popup_queue_lock_ts';
const LOCK_TIMEOUT_MS = 60000; // 60 seconds max lock (safety)

// Event name for queue unlock
export const POPUP_QUEUE_UNLOCKED_EVENT = 'popup-queue-unlocked';

/**
 * Check if the popup queue is available (no other popup showing)
 */
export function isPopupQueueAvailable(): boolean {
  try {
    const lockedBy = localStorage.getItem(QUEUE_LOCK_KEY);
    if (!lockedBy) return true;

    // Check if lock is stale (safety timeout)
    const lockTs = localStorage.getItem(QUEUE_LOCK_TIMESTAMP_KEY);
    if (lockTs) {
      const elapsed = Date.now() - parseInt(lockTs, 10);
      if (elapsed > LOCK_TIMEOUT_MS) {
        console.warn('[PopupQueue] 🔓 Stale lock detected, clearing:', lockedBy);
        clearPopupQueueLock();
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * Check if a specific popup can show (queue available OR it already owns the lock)
 */
export function canShowPopup(popupId: string): boolean {
  try {
    const lockedBy = localStorage.getItem(QUEUE_LOCK_KEY);
    
    // No lock = can show
    if (!lockedBy) return true;
    
    // This popup already owns the lock
    if (lockedBy === popupId) return true;
    
    // Check for stale lock
    const lockTs = localStorage.getItem(QUEUE_LOCK_TIMESTAMP_KEY);
    if (lockTs) {
      const elapsed = Date.now() - parseInt(lockTs, 10);
      if (elapsed > LOCK_TIMEOUT_MS) {
        console.warn('[PopupQueue] 🔓 Stale lock, clearing for:', popupId);
        clearPopupQueueLock();
        return true;
      }
    }
    
    console.log(`[PopupQueue] 🚫 Queue locked by "${lockedBy}", "${popupId}" must wait`);
    return false;
  } catch {
    return true;
  }
}

/**
 * Lock the popup queue (call when popup becomes visible)
 */
export function lockPopupQueue(popupId: string): void {
  try {
    localStorage.setItem(QUEUE_LOCK_KEY, popupId);
    localStorage.setItem(QUEUE_LOCK_TIMESTAMP_KEY, String(Date.now()));
    console.log(`[PopupQueue] 🔒 Queue locked by: ${popupId}`);
  } catch (e) {
    console.warn('[PopupQueue] Failed to lock:', e);
  }
}

/**
 * Unlock the popup queue (call when popup is closed/dismissed)
 */
export function unlockPopupQueue(popupId: string): void {
  try {
    const lockedBy = localStorage.getItem(QUEUE_LOCK_KEY);
    
    // Only unlock if this popup owns the lock
    if (lockedBy === popupId) {
      localStorage.removeItem(QUEUE_LOCK_KEY);
      localStorage.removeItem(QUEUE_LOCK_TIMESTAMP_KEY);
      console.log(`[PopupQueue] 🔓 Queue unlocked by: ${popupId}`);
      
      // Dispatch event so waiting popups can check
      window.dispatchEvent(new CustomEvent(POPUP_QUEUE_UNLOCKED_EVENT, {
        detail: { releasedBy: popupId }
      }));
    } else {
      console.warn(`[PopupQueue] ⚠️ ${popupId} tried to unlock but lock is owned by: ${lockedBy}`);
    }
  } catch (e) {
    console.warn('[PopupQueue] Failed to unlock:', e);
  }
}

/**
 * Force clear the popup queue lock (emergency/debug use)
 */
export function clearPopupQueueLock(): void {
  try {
    const lockedBy = localStorage.getItem(QUEUE_LOCK_KEY);
    localStorage.removeItem(QUEUE_LOCK_KEY);
    localStorage.removeItem(QUEUE_LOCK_TIMESTAMP_KEY);
    console.log(`[PopupQueue] 🧹 Queue force-cleared (was: ${lockedBy || 'empty'})`);
    
    window.dispatchEvent(new CustomEvent(POPUP_QUEUE_UNLOCKED_EVENT, {
      detail: { releasedBy: 'force-clear' }
    }));
  } catch {}
}

/**
 * Get current lock holder (for debugging)
 */
export function getQueueLockHolder(): string | null {
  try {
    return localStorage.getItem(QUEUE_LOCK_KEY);
  } catch {
    return null;
  }
}

// Expose debug helper to window
if (typeof window !== 'undefined') {
  (window as any).__clearPopupQueue = clearPopupQueueLock;
  (window as any).__getPopupQueueLock = getQueueLockHolder;
}

