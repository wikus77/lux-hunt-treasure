/**
 * PULSE BREAKER STORE
 * Gestisce l'apertura del modal Pulse Breaker da qualsiasi punto dell'app
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - PulseBreaker disabled on native platforms (gambling-like)
 * - openPulseBreaker() silently fails if disabled
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { create } from 'zustand';
import { isPulseBreakerEnabled, logComplianceEvent } from '@/utils/storeCompliance';

interface PulseBreakerStore {
  isOpen: boolean;
  openPulseBreaker: () => void;
  closePulseBreaker: () => void;
  isEnabled: () => boolean;
}

export const usePulseBreakerStore = create<PulseBreakerStore>((set) => ({
  isOpen: false,
  openPulseBreaker: () => {
    // 🏪 STORE COMPLIANCE: Block on native platforms
    if (!isPulseBreakerEnabled()) {
      logComplianceEvent('pulse_breaker_blocked', { action: 'open_attempt' });
      return; // Silently fail - don't open
    }
    set({ isOpen: true });
  },
  closePulseBreaker: () => set({ isOpen: false }),
  isEnabled: () => isPulseBreakerEnabled(),
}));


