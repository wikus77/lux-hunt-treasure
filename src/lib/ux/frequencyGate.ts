// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Frequency Gate - Popup Display Limiter (1/day)

/**
 * Check if a popup should be shown based on last display time
 * @param id - Unique identifier for the popup
 * @param periodHours - Time period in hours (default: 24)
 * @returns true if popup can be shown, false otherwise
 */
export function shouldShow(id: string, periodHours = 24): boolean {
  try {
    const key = `m1:last:${id}`;
    const lastShown = localStorage.getItem(key);
    
    if (!lastShown) {
      return true;
    }
    
    const lastTimestamp = parseInt(lastShown, 10);
    if (isNaN(lastTimestamp)) {
      // Invalid timestamp, allow show and will be reset
      return true;
    }
    
    const hoursSinceLastShow = (Date.now() - lastTimestamp) / (1000 * 60 * 60);
    return hoursSinceLastShow >= periodHours;
  } catch (error) {
    console.warn(`[FrequencyGate] Error checking ${id}:`, error);
    // On error, allow show to avoid blocking user
    return true;
  }
}

/**
 * Mark a popup as shown with current timestamp
 * @param id - Unique identifier for the popup
 */
export function markShown(id: string): void {
  try {
    const key = `m1:last:${id}`;
    localStorage.setItem(key, Date.now().toString());
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
 * @param periodHours - Time period in hours (default: 24)
 * @returns hours remaining, or 0 if can show now
 */
export function getHoursUntilNextShow(id: string, periodHours = 24): number {
  try {
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
    const remaining = periodHours - hoursSinceLastShow;
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.warn(`[FrequencyGate] Error getting hours for ${id}:`, error);
    return 0;
  }
}
