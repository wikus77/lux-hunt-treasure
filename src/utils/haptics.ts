// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Haptic Feedback Utility - Vibrazioni per feedback tattile
// M1SSION™ WRAP FIX: Added Capacitor Haptics support for iOS native

/**
 * Haptic Feedback Types
 * - light: feedback leggero per tap/click
 * - medium: feedback medio per conferme
 * - heavy: feedback forte per azioni importanti
 * - success: pattern per successo/achievement
 * - error: pattern per errori
 * - warning: pattern per warning
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'notification';

// Vibration patterns in milliseconds [vibrate, pause, vibrate, pause, ...]
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,           // Tap leggero
  medium: 25,          // Conferma
  heavy: 50,           // Azione importante
  success: [30, 50, 30, 50, 50], // Pattern successo ✓
  error: [50, 30, 50, 30, 100],  // Pattern errore ✗
  warning: [30, 50, 30],         // Pattern warning ⚠
  notification: [50, 100, 50],   // Pattern notifica 🔔
};

// M1SSION™ WRAP FIX: Check if running in Capacitor native
const isCapacitorNative = (): boolean => {
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Check if Vibration API is supported (web fallback)
 */
const isVibrationSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Check if user has enabled haptics (stored in localStorage)
 */
const isHapticsEnabled = (): boolean => {
  if (typeof localStorage === 'undefined') return true;
  const setting = localStorage.getItem('m1_haptics_enabled');
  return setting !== 'false'; // Default: enabled
};

/**
 * M1SSION™ WRAP FIX: Trigger native haptics via Capacitor plugin
 * Uses @capacitor/haptics for iOS which doesn't support navigator.vibrate()
 */
const triggerNativeHaptic = async (type: HapticType): Promise<boolean> => {
  try {
    // Dynamically import Capacitor Haptics to avoid bundle issues in PWA
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    
    switch (type) {
      case 'light':
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
    return true;
  } catch (error) {
    console.debug('[Haptics] Native haptic failed:', error);
    return false;
  }
};

/**
 * Trigger haptic feedback
 * @param type - Type of haptic feedback
 * @returns boolean - true if vibration was triggered
 */
export const haptic = (type: HapticType = 'light'): boolean => {
  try {
    // Check if enabled
    if (!isHapticsEnabled()) {
      return false;
    }

    // M1SSION™ WRAP FIX: Use native Capacitor haptics on iOS
    // navigator.vibrate() does NOT work on iOS Safari/WKWebView
    if (isCapacitorNative()) {
      triggerNativeHaptic(type); // Fire and forget (async)
      return true;
    }

    // Web fallback (Android Chrome, etc.)
    if (!isVibrationSupported()) {
      return false;
    }

    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    // Silently fail - haptics are optional
    console.debug('[Haptics] Vibration failed:', error);
    return false;
  }
};

/**
 * Shortcut functions for common haptic types
 */
export const hapticLight = () => haptic('light');
export const hapticMedium = () => haptic('medium');
export const hapticHeavy = () => haptic('heavy');
export const hapticSuccess = () => haptic('success');
export const hapticError = () => haptic('error');
export const hapticWarning = () => haptic('warning');
export const hapticNotification = () => haptic('notification');

/**
 * Enable/disable haptics
 */
export const setHapticsEnabled = (enabled: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('m1_haptics_enabled', String(enabled));
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
  if (newState) {
    haptic('light'); // Feedback to confirm haptics are on
  }
  return newState;
};

/**
 * Custom vibration pattern
 * @param pattern - Array of [vibrate, pause, vibrate, pause, ...]
 */
export const hapticCustom = (pattern: number[]): boolean => {
  try {
    if (!isVibrationSupported() || !isHapticsEnabled()) {
      return false;
    }
    navigator.vibrate(pattern);
    return true;
  } catch {
    return false;
  }
};

/**
 * Stop any ongoing vibration
 */
export const hapticStop = (): void => {
  try {
    if (isVibrationSupported()) {
      navigator.vibrate(0);
    }
  } catch {
    // Silently fail
  }
};

// HapticType for compatibility
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'notification' | 'selection';

// Haptic Manager object for compatibility with existing code
export const hapticManager = {
  trigger: (type: HapticType = 'light') => {
    if (type === 'selection') return haptic('light');
    return haptic(type as any);
  },
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
  notification: hapticNotification,
  custom: hapticCustom,
  stop: hapticStop,
  setEnabled: setHapticsEnabled,
  getEnabled: getHapticsEnabled,
  toggle: toggleHaptics,
  isSupported: isVibrationSupported,
};

// Export default object for convenience
export default hapticManager;
