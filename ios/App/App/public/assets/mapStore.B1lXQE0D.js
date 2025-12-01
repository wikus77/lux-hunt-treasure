import { c as create } from './three-vendor.wwSanNQ8.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.DoN6OTIp.js';

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
    console.debug("🗑️ ZUSTAND: Resetting operation states only - NO AREA DATA");
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
