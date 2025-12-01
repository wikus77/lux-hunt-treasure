// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// React Hook for Haptic Feedback

import { useCallback } from 'react';
import haptics, { 
  hapticLight, 
  hapticMedium, 
  hapticHeavy, 
  hapticSuccess, 
  hapticError, 
  hapticWarning,
  hapticNotification,
  setHapticsEnabled,
  getHapticsEnabled,
  toggleHaptics
} from '@/utils/haptics';

/**
 * React Hook for Haptic Feedback
 * Provides easy access to haptic functions with React optimization
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
  
  // Settings
  const isEnabled = useCallback(() => getHapticsEnabled(), []);
  const setEnabled = useCallback((enabled: boolean) => setHapticsEnabled(enabled), []);
  const toggle = useCallback(() => toggleHaptics(), []);
  const isSupported = useCallback(() => haptics.isSupported(), []);

  return {
    // Haptic triggers
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    notification,
    
    // Settings
    isEnabled,
    setEnabled,
    toggle,
    isSupported,
    
    // Raw access
    haptics
  };
};

export default useHaptics;


