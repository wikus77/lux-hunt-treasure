import { create } from 'zustand';

interface MapState {
  // Point management
  isAddingPoint: boolean;
  isAddingMapPoint: boolean;
  
  // Map status
  mapStatus: 'idle' | 'loading' | 'ready' | 'error';
  
  // Operation locks
  isDeleting: boolean;
  isGenerating: boolean;
  
  // Actions
  setIsAddingPoint: (value: boolean) => void;
  setIsAddingMapPoint: (value: boolean) => void;
  setMapStatus: (status: 'idle' | 'loading' | 'ready' | 'error') => void;
  setIsDeleting: (value: boolean) => void;
  setIsGenerating: (value: boolean) => void;
  
  // Reset all state - SIMPLIFIED
  resetMapState: () => void;
  
  // Sync actions to keep states consistent
  syncPointStates: (value: boolean) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  isAddingPoint: false,
  isAddingMapPoint: false,
  mapStatus: 'idle',
  isDeleting: false,
  isGenerating: false,
  
  // Actions
  setIsAddingPoint: (value: boolean) => set({ isAddingPoint: value }),
  setIsAddingMapPoint: (value: boolean) => set({ isAddingMapPoint: value }),
  setMapStatus: (status: 'idle' | 'loading' | 'ready' | 'error') => set({ mapStatus: status }),
  setIsDeleting: (value: boolean) => set({ isDeleting: value }),
  setIsGenerating: (value: boolean) => set({ isGenerating: value }),
  
  // SIMPLIFIED: Reset only operation states, React Query is source of truth for data
  resetMapState: () => set({
    isDeleting: false,
    isGenerating: false,
    mapStatus: 'idle'
  }),
  
  // Sync both point states to maintain consistency
  syncPointStates: (value: boolean) => set({ 
    isAddingPoint: value, 
    isAddingMapPoint: value 
  }),
}));
