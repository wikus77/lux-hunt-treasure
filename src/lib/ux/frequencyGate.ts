// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Frequency Gate - Popup Display Limiter with Dynamic Config + Multi-device Sync

import { getPopupPeriod } from '@/config/popupFrequency';
import { logPopupEvent } from './popupTelemetry';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a popup should be shown based on last display time
 * Supports dynamic period override and multi-device sync
 * @param id - Unique identifier for the popup
 * @param periodHours - Time period in hours (optional, uses config if not provided)
 * @returns true if popup can be shown, false otherwise
 */
export function shouldShow(id: string, periodHours?: number): boolean {
  try {
    // Get dynamic period from config if not explicitly provided
    const effectivePeriod = periodHours ?? getPopupPeriod(id);
    
    // Sync from user_metadata if available (multi-device support)
    syncFromUserMetadata(id);
    
    const key = `m1:last:${id}`;
    const lastShown = localStorage.getItem(key);
    
    if (!lastShown) {
      logPopupEvent(id, 'shown', 'first-time');
      return true;
    }
    
    const lastTimestamp = parseInt(lastShown, 10);
    if (isNaN(lastTimestamp)) {
      // Invalid timestamp, allow show and will be reset
      logPopupEvent(id, 'shown', 'invalid-timestamp');
      return true;
    }
    
    const hoursSinceLastShow = (Date.now() - lastTimestamp) / (1000 * 60 * 60);
    const canShow = hoursSinceLastShow >= effectivePeriod;
    
    if (canShow) {
      logPopupEvent(id, 'shown', `period-elapsed-${hoursSinceLastShow.toFixed(1)}h`);
    } else {
      logPopupEvent(id, 'blocked', `${(effectivePeriod - hoursSinceLastShow).toFixed(1)}h-remaining`);
    }
    
    return canShow;
  } catch (error) {
    console.warn(`[FrequencyGate] Error checking ${id}:`, error);
    logPopupEvent(id, 'shown', 'error-fallback');
    // On error, allow show to avoid blocking user
    return true;
  }
}

/**
 * Mark a popup as shown with current timestamp
 * Syncs to user_metadata for multi-device support (best-effort)
 * @param id - Unique identifier for the popup
 */
export function markShown(id: string): void {
  try {
    const key = `m1:last:${id}`;
    const timestamp = Date.now().toString();
    localStorage.setItem(key, timestamp);
    
    // Best-effort sync to user_metadata (async, no blocking)
    syncToUserMetadata(id, parseInt(timestamp, 10)).catch(() => {
      // Silently ignore sync errors - local storage is source of truth
    });
  } catch (error) {
    console.warn(`[FrequencyGate] Error marking ${id}:`, error);
  }
}

/**
 * Reset a popup's frequency gate (for testing or admin purposes)
 * @param id - Unique identifier for the popup
 */
export function resetFrequencyGate(id: string): void {
  try {
    const key = `m1:last:${id}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[FrequencyGate] Error resetting ${id}:`, error);
  }
}

/**
 * Get time until next show is allowed
 * @param id - Unique identifier for the popup
 * @param periodHours - Time period in hours (optional, uses config if not provided)
 * @returns hours remaining, or 0 if can show now
 */
export function getHoursUntilNextShow(id: string, periodHours?: number): number {
  try {
    const effectivePeriod = periodHours ?? getPopupPeriod(id);
    const key = `m1:last:${id}`;
    const lastShown = localStorage.getItem(key);
    
    if (!lastShown) {
      return 0;
    }
    
    const lastTimestamp = parseInt(lastShown, 10);
    if (isNaN(lastTimestamp)) {
      return 0;
    }
    
    const hoursSinceLastShow = (Date.now() - lastTimestamp) / (1000 * 60 * 60);
    const remaining = effectivePeriod - hoursSinceLastShow;
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.warn(`[FrequencyGate] Error getting hours for ${id}:`, error);
    return 0;
  }
}

/**
 * Sync lastSeen timestamp to user_metadata (best-effort, async)
 * @param id - Popup identifier
 * @param timestamp - Timestamp to sync
 */
async function syncToUserMetadata(id: string, timestamp: number): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentMetadata = user.user_metadata || {};
    const m1PopupLastSeen = currentMetadata.m1_popup_lastSeen || {};
    
    // Only update if newer
    if (!m1PopupLastSeen[id] || timestamp > m1PopupLastSeen[id]) {
      await supabase.auth.updateUser({
        data: {
          m1_popup_lastSeen: {
            ...m1PopupLastSeen,
            [id]: timestamp
          }
        }
      });
    }
  } catch (error) {
    // Silent fail - this is best-effort sync
  }
}

/**
 * Sync from user_metadata to localStorage (bootstrap on load)
 * @param id - Popup identifier
 */
function syncFromUserMetadata(id: string): void {
  try {
    const key = `m1:last:${id}`;
    const localTimestamp = localStorage.getItem(key);
    const localValue = localTimestamp ? parseInt(localTimestamp, 10) : 0;

    // Quick check: only proceed if we might need to sync
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const m1PopupLastSeen = user.user_metadata?.m1_popup_lastSeen;
      if (!m1PopupLastSeen || !m1PopupLastSeen[id]) return;

      const remoteValue = m1PopupLastSeen[id];
      
      // Update local if remote is newer
      if (remoteValue > localValue) {
        localStorage.setItem(key, remoteValue.toString());
      }
    }).catch(() => {
      // Silent fail
    });
  } catch (error) {
    // Silent fail - sync is optional
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
