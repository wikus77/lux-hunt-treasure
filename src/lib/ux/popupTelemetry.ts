// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Popup Telemetry - Local in-memory + localStorage tracking (NO network)

export interface PopupTelemetryEvent {
  id: string;
  timestamp: number;
  action: 'shown' | 'blocked' | 'dismissed';
  reason?: string;
}

export interface PopupStats {
  id: string;
  shownCount: number;
  blockedCount: number;
  dismissedCount: number;
  lastShown?: number;
  lastBlocked?: number;
  firstSeen?: number;
}

const STORAGE_KEY = 'm1:popup:stats';
const DISABLE_KEY = 'm1:popup:stats:disable';
const MAX_EVENTS = 100; // Keep last 100 events in memory

// In-memory event log (volatile, reset on refresh)
let eventLog: PopupTelemetryEvent[] = [];

/**
 * Check if telemetry is disabled
 */
function isDisabled(): boolean {
  try {
    return localStorage.getItem(DISABLE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Log a popup event (in-memory + localStorage aggregation)
 */
export function logPopupEvent(
  id: string,
  action: 'shown' | 'blocked' | 'dismissed',
  reason?: string
): void {
  if (isDisabled()) return;

  try {
    const event: PopupTelemetryEvent = {
      id,
      timestamp: Date.now(),
      action,
      reason
    };

    // Add to in-memory log
    eventLog.push(event);
    if (eventLog.length > MAX_EVENTS) {
      eventLog = eventLog.slice(-MAX_EVENTS);
    }

    // Update localStorage aggregated stats
    const stats = getPopupStats();
    const popupStats = stats[id] || {
      id,
      shownCount: 0,
      blockedCount: 0,
      dismissedCount: 0
    };

    // Update counters
    if (action === 'shown') {
      popupStats.shownCount++;
      popupStats.lastShown = event.timestamp;
      if (!popupStats.firstSeen) {
        popupStats.firstSeen = event.timestamp;
      }
    } else if (action === 'blocked') {
      popupStats.blockedCount++;
      popupStats.lastBlocked = event.timestamp;
    } else if (action === 'dismissed') {
      popupStats.dismissedCount++;
    }

    stats[id] = popupStats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

    // Console output for debugging (only in dev)
    if (import.meta.env.DEV) {
      console.log(`[PopupTelemetry] ${id} ${action}`, reason || '');
    }
  } catch (error) {
    console.warn('[PopupTelemetry] Error logging event:', error);
  }
}

/**
 * Get aggregated stats for all popups
 */
export function getPopupStats(): Record<string, PopupStats> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('[PopupTelemetry] Error reading stats:', error);
    return {};
  }
}

/**
 * Get recent events from in-memory log
 */
export function getRecentEvents(limit = 50): PopupTelemetryEvent[] {
  return eventLog.slice(-limit);
}

/**
 * Get stats for a specific popup
 */
export function getPopupStatsById(id: string): PopupStats | null {
  const stats = getPopupStats();
  return stats[id] || null;
}

/**
 * Clear all telemetry data
 */
export function clearTelemetry(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    eventLog = [];
    console.log('[PopupTelemetry] All data cleared');
  } catch (error) {
    console.warn('[PopupTelemetry] Error clearing data:', error);
  }
}

/**
 * Enable telemetry
 */
export function enableTelemetry(): void {
  try {
    localStorage.removeItem(DISABLE_KEY);
    console.log('[PopupTelemetry] Enabled');
  } catch (error) {
    console.warn('[PopupTelemetry] Error enabling:', error);
  }
}

/**
 * Disable telemetry
 */
export function disableTelemetry(): void {
  try {
    localStorage.setItem(DISABLE_KEY, '1');
    console.log('[PopupTelemetry] Disabled');
  } catch (error) {
    console.warn('[PopupTelemetry] Error disabling:', error);
  }
}

/**
 * Export stats to console (for debugging)
 */
export function exportStatsToConsole(): void {
  const stats = getPopupStats();
  const events = getRecentEvents();
  
  console.group('📊 M1SSION™ Popup Telemetry');
  console.table(Object.values(stats));
  console.log('Recent Events:', events);
  console.log('Telemetry disabled:', isDisabled());
  console.groupEnd();
}

// Auto-export to console on global call
if (typeof window !== 'undefined') {
  (window as any).m1PopupStats = exportStatsToConsole;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
