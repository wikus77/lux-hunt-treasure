/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Debug Flag Hook - PWA Mobile Optimized
 * Checks if debug panels should be enabled via:
 * - VITE_M1_DEBUG=1 env variable
 * - ?debug=1 URL parameter
 * - localStorage.M1_DEBUG_PANELS='1'
 */

import { useState, useEffect } from 'react';

// Check immediately (synchronous) to avoid flash
const checkDebugFlag = (): boolean => {
  try {
    // Check env variable
    const envDebug = import.meta.env.VITE_M1_DEBUG === '1';
    
    // Check URL parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlDebug = urlParams.get('debug') === '1';
      
      // Check localStorage
      const storageDebug = localStorage.getItem('M1_DEBUG_PANELS') === '1';
      
      const isEnabled = envDebug || urlDebug || storageDebug;
      
      if (isEnabled) {
        console.log('🧪 M1DEBUG: Debug panels ENABLED via', {
          env: envDebug,
          url: urlDebug,
          storage: storageDebug,
          currentUrl: window.location.href
        });
      } else {
        console.log('🧪 M1DEBUG: Debug panels DISABLED', {
          currentUrl: window.location.href,
          urlParams: window.location.search
        });
      }
      
      return isEnabled;
    }
    
    return envDebug;
  } catch (e) {
    console.warn('Debug flag check failed:', e);
    return false;
  }
};

export const useDebugFlag = (): boolean => {
  // Initialize with immediate check to prevent flash
  const [enabled, setEnabled] = useState(checkDebugFlag);

  useEffect(() => {
    // Re-check on mount in case of URL changes
    const isEnabled = checkDebugFlag();
    setEnabled(isEnabled);
  }, []);

  return enabled;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
