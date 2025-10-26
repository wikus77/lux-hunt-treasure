// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Haptic Feedback Utility - Opt-in vibration for iOS/Android

/**
 * Haptic feedback patterns (milliseconds)
 */
export const HapticPattern = {
  /** Light tap (8ms) - For subtle interactions */
  light: 8,
  
  /** Medium tap (15ms) - For button presses */
  medium: 15,
  
  /** Heavy tap (30ms) - For confirmations */
  heavy: 30,
  
  /** Success pattern - For successful actions */
  success: [10, 50, 10] as number[],
  
  /** Warning pattern - For warnings */
  warning: [15, 100, 15, 100, 15] as number[],
  
  /** Error pattern - For errors */
  error: [30, 100, 30] as number[],
} as const;

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 * @param pattern - Duration in ms or array of durations for patterns
 * @returns true if haptic was triggered, false if not supported
 * 
 * @example
 * ```ts
 * // Light tap
 * haptic(HapticPattern.light);
 * 
 * // Medium tap
 * haptic(HapticPattern.medium);
 * 
 * // Success pattern
 * haptic(HapticPattern.success);
 * 
 * // Custom duration
 * haptic(20);
 * ```
 */
export function haptic(pattern: number | number[] = HapticPattern.medium): boolean {
  if (!isHapticSupported()) {
    console.debug('[Haptics] Not supported on this device');
    return false;
  }

  try {
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.warn('[Haptics] Failed to trigger:', error);
    return false;
  }
}

/**
 * Cancel any ongoing haptic feedback
 */
export function cancelHaptic(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

/**
 * Haptic presets - Convenience functions
 */
export const Haptics = {
  light: () => haptic(HapticPattern.light),
  medium: () => haptic(HapticPattern.medium),
  heavy: () => haptic(HapticPattern.heavy),
  success: () => haptic(HapticPattern.success),
  warning: () => haptic(HapticPattern.warning),
  error: () => haptic(HapticPattern.error),
  cancel: cancelHaptic,
  isSupported: isHapticSupported,
} as const;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
