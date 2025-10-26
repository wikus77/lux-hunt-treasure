// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Popup Frequency Configuration - Dynamic periods with env/localStorage override

export interface PopupFrequencyConfig {
  [key: string]: number; // hours
}

/**
 * Default frequency periods (in hours) for each popup
 */
const DEFAULT_PERIODS: PopupFrequencyConfig = {
  'xp-reward': 24,
  'ios-permission': 24,
  'cookie-consent': 8760, // 1 year
  'first-login-quiz': 8760, // 1 year
};

/**
 * Get frequency period for a popup ID with dynamic override support
 * Priority: localStorage override > env variable > default config
 * 
 * @param id - Unique popup identifier
 * @returns Period in hours
 */
export function getPopupPeriod(id: string): number {
  try {
    // 1. Check localStorage override (highest priority)
    const localOverride = localStorage.getItem(`m1:popup:${id}:hours`);
    if (localOverride) {
      const parsed = parseInt(localOverride, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    // 2. Check env variable (e.g., VITE_POPUP_XP_REWARD_HOURS)
    const envKey = `VITE_POPUP_${id.toUpperCase().replace(/-/g, '_')}_HOURS`;
    const envValue = (import.meta as any).env?.[envKey];
    if (envValue) {
      const parsed = parseInt(envValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    // 3. Fallback to default
    return DEFAULT_PERIODS[id] || 24;
  } catch (error) {
    console.warn(`[PopupFrequency] Error getting period for ${id}:`, error);
    return DEFAULT_PERIODS[id] || 24;
  }
}

/**
 * Set custom period for a popup (stored in localStorage)
 * 
 * @param id - Unique popup identifier
 * @param hours - Period in hours (0 to disable frequency gate)
 */
export function setPopupPeriod(id: string, hours: number): void {
  try {
    if (hours <= 0) {
      localStorage.removeItem(`m1:popup:${id}:hours`);
    } else {
      localStorage.setItem(`m1:popup:${id}:hours`, hours.toString());
    }
    console.log(`[PopupFrequency] Set ${id} period to ${hours}h`);
  } catch (error) {
    console.warn(`[PopupFrequency] Error setting period for ${id}:`, error);
  }
}

/**
 * Reset popup period to default
 */
export function resetPopupPeriod(id: string): void {
  try {
    localStorage.removeItem(`m1:popup:${id}:hours`);
    console.log(`[PopupFrequency] Reset ${id} to default period`);
  } catch (error) {
    console.warn(`[PopupFrequency] Error resetting period for ${id}:`, error);
  }
}

/**
 * Get all configured periods (for admin UI)
 */
export function getAllPopupPeriods(): PopupFrequencyConfig {
  const periods: PopupFrequencyConfig = { ...DEFAULT_PERIODS };
  
  try {
    // Overlay with localStorage overrides
    Object.keys(DEFAULT_PERIODS).forEach(id => {
      const override = localStorage.getItem(`m1:popup:${id}:hours`);
      if (override) {
        const parsed = parseInt(override, 10);
        if (!isNaN(parsed) && parsed > 0) {
          periods[id] = parsed;
        }
      }
    });
  } catch (error) {
    console.warn('[PopupFrequency] Error getting all periods:', error);
  }
  
  return periods;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
