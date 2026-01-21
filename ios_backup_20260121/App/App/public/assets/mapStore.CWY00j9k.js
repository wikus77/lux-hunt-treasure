import { ck as create } from './index.C8SyQ7Ep.js';
import './ui-vendor.sKtoNQj2.js';
import './react-vendor.FGvtrp7q.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

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
