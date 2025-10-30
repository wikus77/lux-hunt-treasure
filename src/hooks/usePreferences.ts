// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';

export interface UserPreferences {
  reducedMotion: boolean;
}

/**
 * Hook to access user preferences, including reduced motion settings
 */
export function usePreferences(): UserPreferences {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    reducedMotion
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
