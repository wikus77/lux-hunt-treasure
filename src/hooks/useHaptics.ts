// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// React Hook for Haptic Feedback - CAPACITOR NATIVE ONLY
// 🔧 FIX v7 (22/01/2026): Updated to use centralized haptics.ts (Capacitor-only)

import { useCallback } from 'react';
import hapticManager, { 
  hapticLight, 
  hapticMedium, 
  hapticHeavy, 
  hapticSuccess, 
  hapticError, 
  hapticWarning,
  hapticNotification,
  hapticSelection,
  setHapticsEnabled,
  getHapticsEnabled,
  toggleHaptics,
  isHapticsAvailable
} from '@/utils/haptics';

/**
 * React Hook for Haptic Feedback
 * Provides easy access to haptic functions with React optimization
 * 
 * ⚠️ CAPACITOR NATIVE ONLY - Will fail-loud if called outside Capacitor runtime
 */
export const useHaptics = () => {
  // Memoized haptic functions
  const light = useCallback(() => hapticLight(), []);
  const medium = useCallback(() => hapticMedium(), []);
  const heavy = useCallback(() => hapticHeavy(), []);
  const success = useCallback(() => hapticSuccess(), []);
  const error = useCallback(() => hapticError(), []);
  const warning = useCallback(() => hapticWarning(), []);
  const notification = useCallback(() => hapticNotification(), []);
  const selection = useCallback(() => hapticSelection(), []);
  
  // Settings
  const isEnabled = useCallback(() => getHapticsEnabled(), []);
  const setEnabled = useCallback((enabled: boolean) => setHapticsEnabled(enabled), []);
  const toggle = useCallback(() => toggleHaptics(), []);
  const isAvailable = useCallback(() => isHapticsAvailable(), []);

  return {
    // Haptic triggers
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    notification,
    selection,
    
    // Settings
    isEnabled,
    setEnabled,
    toggle,
    isAvailable,
    
    // Raw access (for backward compatibility)
    haptics: hapticManager
  };
};

export default useHaptics;


