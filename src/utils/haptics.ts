// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// Haptic Feedback Utility - CAPACITOR iOS NATIVE ONLY
// 
// ⚠️ CRITICAL: This module is designed for Capacitor native apps ONLY.
// If called outside Capacitor runtime, it will:
// - DEV: throw Error + console.error
// - PROD: log error + return false (no crash, but tracked)

import { isCapacitorNative, getCapacitorPlatform } from '@/utils/capacitor';

/**
 * Haptic Feedback Types supported by iOS native
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'notification' | 'selection';

// Track haptic unavailability for debugging
let _hapticUnavailableLogged = false;

/**
 * Check if user has enabled haptics (stored in localStorage)
 */
const isHapticsEnabled = (): boolean => {
  if (typeof localStorage === 'undefined') return true;
  const setting = localStorage.getItem('m1_haptics_enabled');
  return setting !== 'false'; // Default: enabled
};

/**
 * 🚨 FAIL-LOUD GUARD: Check if haptics can work in current runtime
 * @throws Error in DEV mode if not in Capacitor
 * @returns false in PROD mode if not in Capacitor
 */
const guardHapticsRuntime = (caller: string): boolean => {
  const isNative = isCapacitorNative();
  const platform = getCapacitorPlatform();
  
  if (isNative) {
    return true; // All good
  }
  
  // Not in Capacitor native - this is an error condition
  const errorMsg = `[HAPTICS] ❌ CALLED OUTSIDE CAPACITOR NATIVE RUNTIME!
    Caller: ${caller}
    Platform detected: ${platform}
    isCapacitorNative(): ${isNative}
    
    Haptics require Capacitor native iOS/Android app.
    If you see this in the wrapped app, there's a detection bug.
    If you see this in browser, someone called haptics incorrectly.`;
  
  // Always log the error
  console.error(errorMsg);
  
  // Track for analytics (only once per session)
  if (!_hapticUnavailableLogged) {
    _hapticUnavailableLogged = true;
    // Could send to analytics here if needed
    console.error('[HAPTICS] 📊 Tracked: haptics_unavailable_runtime');
  }
  
  // In DEV mode: throw to make it obvious
  if (import.meta.env.DEV) {
    throw new Error('HAPTICS CALLED OUTSIDE CAPACITOR NATIVE RUNTIME. Check console for details.');
  }
  
  // In PROD: return false silently (no crash)
  return false;
};

/**
 * Trigger native iOS/Android haptic via @capacitor/haptics
 * This is the ONLY way to trigger haptics in this app.
 */
const triggerNativeHaptic = async (type: HapticType): Promise<boolean> => {
  try {
    // Import Capacitor Haptics
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    
    console.debug(`[HAPTICS] 📳 Triggering native haptic: ${type}`);
    
    switch (type) {
      case 'light':
      case 'selection':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'notification':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      default:
        await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    console.debug(`[HAPTICS] ✅ Native haptic triggered: ${type}`);
    return true;
  } catch (error) {
    console.error('[HAPTICS] ❌ Native haptic FAILED:', error);
    console.error('[HAPTICS] This should NOT happen in Capacitor native. Check plugin sync.');
    return false;
  }
};

/**
 * Main haptic trigger function
 * 
 * @param type - Type of haptic feedback
 * @returns Promise<boolean> - true if haptic was triggered
 * 
 * ⚠️ CAPACITOR NATIVE ONLY - Will fail-loud if called outside Capacitor
 */
export const haptic = async (type: HapticType = 'light'): Promise<boolean> => {
  // Guard: Check runtime environment
  if (!guardHapticsRuntime(`haptic(${type})`)) {
    return false;
  }
  
  // Check user preference
  if (!isHapticsEnabled()) {
    console.debug('[HAPTICS] Disabled by user preference');
    return false;
  }
  
  // Trigger native haptic
  return triggerNativeHaptic(type);
};

/**
 * Synchronous wrapper for haptic (fire-and-forget)
 * Use this when you don't need to await the result
 */
export const hapticSync = (type: HapticType = 'light'): void => {
  haptic(type).catch(err => {
    console.error('[HAPTICS] Async error (ignored):', err);
  });
};

/**
 * Shortcut functions for common haptic types
 * All are fire-and-forget (synchronous interface)
 */
export const hapticLight = (): void => hapticSync('light');
export const hapticMedium = (): void => hapticSync('medium');
export const hapticHeavy = (): void => hapticSync('heavy');
export const hapticSuccess = (): void => hapticSync('success');
export const hapticError = (): void => hapticSync('error');
export const hapticWarning = (): void => hapticSync('warning');
export const hapticNotification = (): void => hapticSync('notification');
export const hapticSelection = (): void => hapticSync('selection');

/**
 * Enable/disable haptics (user preference)
 */
export const setHapticsEnabled = (enabled: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('m1_haptics_enabled', String(enabled));
    console.debug('[HAPTICS] User preference set:', enabled);
  }
};

/**
 * Get haptics enabled state
 */
export const getHapticsEnabled = (): boolean => {
  return isHapticsEnabled();
};

/**
 * Toggle haptics on/off
 */
export const toggleHaptics = (): boolean => {
  const newState = !isHapticsEnabled();
  setHapticsEnabled(newState);
  if (newState && isCapacitorNative()) {
    hapticSync('light'); // Feedback to confirm haptics are on
  }
  return newState;
};

/**
 * Check if haptics are available in current runtime
 * @returns true if in Capacitor native with haptics plugin
 */
export const isHapticsAvailable = (): boolean => {
  return isCapacitorNative();
};

/**
 * Haptic Manager object for compatibility with existing code
 */
export const hapticManager = {
  trigger: (type: HapticType = 'light') => hapticSync(type),
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
  notification: hapticNotification,
  selection: hapticSelection,
  setEnabled: setHapticsEnabled,
  getEnabled: getHapticsEnabled,
  toggle: toggleHaptics,
  isAvailable: isHapticsAvailable,
};

// Debug helper - expose on window for console testing
if (typeof window !== 'undefined') {
  (window as any).__M1_HAPTICS_DEBUG = () => {
    const native = isCapacitorNative();
    const platform = getCapacitorPlatform();
    const enabled = isHapticsEnabled();
    
    console.log('🔍 M1SSION™ Haptics Debug:');
    console.log('  - isCapacitorNative():', native);
    console.log('  - getCapacitorPlatform():', platform);
    console.log('  - isHapticsEnabled():', enabled);
    console.log('  - Can trigger haptics:', native && enabled);
    
    if (native) {
      console.log('  ✅ Haptics should work! Try: window.__M1_HAPTICS_DEBUG.test()');
    } else {
      console.log('  ❌ NOT in Capacitor native - haptics will fail');
    }
    
    return {
      isNative: native,
      platform,
      enabled,
      test: () => {
        console.log('Testing haptic...');
        hapticMedium();
      }
    };
  };
}

export default hapticManager;

// ============================================================================
// 📳 BUZZ HAPTIC PULSE - M1SSION™ "Solemn" Pattern
// ============================================================================
// Progressive heartbeat-like haptic during BUZZ clue generation
// Pattern: slow beats → accelerating → climax
// ============================================================================

interface BuzzHapticPulseController {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Create a BUZZ haptic pulse controller
 * 
 * Pattern:
 * 1. Initial HEAVY impact (solemn press)
 * 2. Two slow "heartbeats" (heavy-pause-heavy)
 * 3. Three faster beats (accelerating)
 * 4. Continues until stop() is called
 * 
 * Usage:
 *   const pulse = createBuzzHapticPulse();
 *   pulse.start();
 *   // ... async BUZZ operation ...
 *   pulse.stop();
 */
export const createBuzzHapticPulse = (): BuzzHapticPulseController => {
  let isRunning = false;
  let timeoutIds: NodeJS.Timeout[] = [];
  let intervalId: NodeJS.Timeout | null = null;

  const clearAllTimers = () => {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const triggerBeat = async (intensity: HapticType) => {
    if (!isRunning) return;
    if (!isCapacitorNative()) return;
    
    try {
      await haptic(intensity);
    } catch {
      // Silently ignore errors during pulse
    }
  };

  const start = () => {
    if (!isCapacitorNative() || !isHapticsEnabled()) {
      console.debug('[BUZZ_HAPTIC_PULSE] Not available, skipping');
      return;
    }

    if (isRunning) {
      console.debug('[BUZZ_HAPTIC_PULSE] Already running');
      return;
    }

    isRunning = true;
    console.debug('[BUZZ_HAPTIC_PULSE] 🫀 Starting solemn pulse');

    // ═══════════════════════════════════════════════════════
    // PHASE 1: Initial solemn HEAVY press (immediate)
    // ═══════════════════════════════════════════════════════
    triggerBeat('heavy');

    // ═══════════════════════════════════════════════════════
    // PHASE 2: Two slow heartbeats (heavy) - 350ms apart
    // ═══════════════════════════════════════════════════════
    const t1 = setTimeout(() => triggerBeat('heavy'), 350);
    const t2 = setTimeout(() => triggerBeat('heavy'), 700);
    timeoutIds.push(t1, t2);

    // ═══════════════════════════════════════════════════════
    // PHASE 3: Accelerating beats (medium → heavy alternating)
    // Starts at 1000ms, speeds up over time
    // ═══════════════════════════════════════════════════════
    let beatIndex = 0;
    const beatPattern: { delay: number; intensity: HapticType }[] = [
      { delay: 1000, intensity: 'medium' },
      { delay: 1200, intensity: 'heavy' },
      { delay: 1350, intensity: 'medium' },
      { delay: 1480, intensity: 'heavy' },
      { delay: 1580, intensity: 'medium' },
      { delay: 1660, intensity: 'heavy' },
      { delay: 1720, intensity: 'medium' },
      { delay: 1770, intensity: 'heavy' },
    ];

    beatPattern.forEach(({ delay, intensity }) => {
      const t = setTimeout(() => triggerBeat(intensity), delay);
      timeoutIds.push(t);
    });

    // ═══════════════════════════════════════════════════════
    // PHASE 4: Continuous fast pulse after initial pattern
    // Every 180ms alternating heavy/medium until stop()
    // ═══════════════════════════════════════════════════════
    const continuousPulseStart = 1850;
    const continuousPulseTimeout = setTimeout(() => {
      if (!isRunning) return;
      
      let toggle = true;
      intervalId = setInterval(() => {
        if (!isRunning) {
          clearAllTimers();
          return;
        }
        triggerBeat(toggle ? 'heavy' : 'medium');
        toggle = !toggle;
      }, 180);
    }, continuousPulseStart);
    timeoutIds.push(continuousPulseTimeout);
  };

  const stop = () => {
    if (!isRunning) return;
    
    console.debug('[BUZZ_HAPTIC_PULSE] 🛑 Stopping pulse');
    isRunning = false;
    clearAllTimers();

    // Final success notification haptic
    if (isCapacitorNative() && isHapticsEnabled()) {
      haptic('success').catch(() => {});
    }
  };

  return {
    get isRunning() { return isRunning; },
    start,
    stop
  };
};

/**
 * Singleton instance for simple usage
 * Can be started/stopped from anywhere
 */
let _buzzPulseInstance: BuzzHapticPulseController | null = null;

export const buzzHapticPulse = {
  start: () => {
    if (!_buzzPulseInstance) {
      _buzzPulseInstance = createBuzzHapticPulse();
    }
    _buzzPulseInstance.start();
  },
  stop: () => {
    if (_buzzPulseInstance) {
      _buzzPulseInstance.stop();
      _buzzPulseInstance = null;
    }
  },
  get isRunning() {
    return _buzzPulseInstance?.isRunning ?? false;
  }
};
