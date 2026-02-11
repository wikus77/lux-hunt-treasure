import { ce as create } from './index.CUdqZWfi.js';
import './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const useMapStore = create((set, get) => ({
  // Initial state
  isAddingPoint: false,
  isAddingMapPoint: false,
  mapStatus: "idle",
  isDeleting: false,
  isGenerating: false,
  // Actions
  setIsAddingPoint: (value) => set({ isAddingPoint: value }),
  setIsAddingMapPoint: (value) => set({ isAddingMapPoint: value }),
  setMapStatus: (status) => set({ mapStatus: status }),
  setIsDeleting: (value) => set({ isDeleting: value }),
  setIsGenerating: (value) => set({ isGenerating: value }),
  // CRITICAL: Reset only operation states - React Query is SINGLE source of truth
  resetMapState: () => {
    set({
      isDeleting: false,
      isGenerating: false,
      mapStatus: "idle"
    });
  },
  // Sync both point states to maintain consistency
  syncPointStates: (value) => set({
    isAddingPoint: value,
    isAddingMapPoint: value
  })
}));

export { useMapStore };
