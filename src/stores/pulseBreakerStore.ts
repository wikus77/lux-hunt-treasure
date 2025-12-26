/**
 * PULSE BREAKER STORE
 * Gestisce l'apertura del modal Pulse Breaker da qualsiasi punto dell'app
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { create } from 'zustand';

interface PulseBreakerStore {
  isOpen: boolean;
  openPulseBreaker: () => void;
  closePulseBreaker: () => void;
}

export const usePulseBreakerStore = create<PulseBreakerStore>((set) => ({
  isOpen: false,
  openPulseBreaker: () => set({ isOpen: true }),
  closePulseBreaker: () => set({ isOpen: false }),
}));


