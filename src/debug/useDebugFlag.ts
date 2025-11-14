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

export const useDebugFlag = (): boolean => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      // Check env variable
      const envDebug = import.meta.env.VITE_M1_DEBUG === '1';
      
      // Check URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const urlDebug = urlParams.get('debug') === '1';
      
      // Check localStorage
      const storageDebug = localStorage.getItem('M1_DEBUG_PANELS') === '1';
      
      const isEnabled = envDebug || urlDebug || storageDebug;
      setEnabled(isEnabled);
      
      if (isEnabled) {
        console.log('🧪 M1DEBUG: Debug panels enabled');
      }
    } catch (e) {
      console.warn('Debug flag check failed:', e);
      setEnabled(false);
    }
  }, []);

  return enabled;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
