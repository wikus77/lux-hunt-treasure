// © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Global Store
import { create } from 'zustand';
import type { EnrichedDoc } from './types';

interface NorahStore {
  selectedDocs: EnrichedDoc[];
  setSelectedDocs: (docs: EnrichedDoc[]) => void;
  clearSelectedDocs: () => void;
}

export const useNorahStore = create<NorahStore>((set) => ({
  selectedDocs: [],
  setSelectedDocs: (docs) => set({ selectedDocs: docs }),
  clearSelectedDocs: () => set({ selectedDocs: [] }),
}));
