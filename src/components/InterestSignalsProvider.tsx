/**
 * © 2025 Joseph MULÉ – M1SSION™ Interest Signals Provider
 * Activates auto-tracking hooks without any UI changes
 */

import { useAutoInterestSignals } from '@/hooks/useAutoInterestSignals';

export function InterestSignalsProvider({ children }: { children: React.ReactNode }) {
  // Initialize auto-tracking (no visual impact)
  useAutoInterestSignals();
  
  // Pass through children unchanged
  return <>{children}</>;
}
