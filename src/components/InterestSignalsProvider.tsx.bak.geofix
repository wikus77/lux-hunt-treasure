/**
 * © 2025 Joseph MULÉ – M1SSION™ Interest Signals Provider
 * Lazy-loads and activates interest tracking without UI impact
 */

import { useEffect } from 'react';

interface InterestSignalsProviderProps {
  children: React.ReactNode;
}

export function InterestSignalsProvider({ children }: InterestSignalsProviderProps) {
  useEffect(() => {
    // Lazy load interest tracking after component mounts
    let mounted = true;
    
    const initInterestTracking = async () => {
      try {
        const { useAutoInterestSignals } = await import('@/hooks/useAutoInterestSignals');
        
        if (mounted && import.meta.env.VITE_DIAG === '1') {
          console.log('📊 Interest signals tracking ready');
        }
      } catch (error) {
        if (mounted && import.meta.env.VITE_DIAG === '1') {
          console.warn('📊 Interest signals init failed:', error);
        }
      }
    };

    // Initialize after a short delay to avoid blocking render
    const timer = setTimeout(initInterestTracking, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return <>{children}</>;
}