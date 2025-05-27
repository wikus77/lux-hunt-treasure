
import { create } from 'zustand';

interface MapState {
  // Point adding states
  isAddingPoint: boolean;
  isAddingMapPoint: boolean;
  
  // Area states
  isAddingSearchArea: boolean;
  areaCreated: boolean;
  
  // Buzz states
  buzzCount: number;
  isBuzzGenerating: boolean;
  
  // Map status
  mapStatus: 'loading' | 'ready' | 'error';
  mapLoaded: boolean;
  
  // Active elements
  activeMapPoint: string | null;
  activeSearchArea: string | null;
  
  // Actions
  setIsAddingPoint: (value: boolean) => void;
  setIsAddingMapPoint: (value: boolean) => void;
  setIsAddingSearchArea: (value: boolean) => void;
  setAreaCreated: (value: boolean) => void;
  setBuzzCount: (count: number) => void;
  setIsBuzzGenerating: (value: boolean) => void;
  setMapStatus: (status: 'loading' | 'ready' | 'error') => void;
  setMapLoaded: (loaded: boolean) => void;
  setActiveMapPoint: (id: string | null) => void;
  setActiveSearchArea: (id: string | null) => void;
  
  // Combined actions
  resetPointStates: () => void;
  resetAllStates: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial states
  isAddingPoint: false,
  isAddingMapPoint: false,
  isAddingSearchArea: false,
  areaCreated: false,
  buzzCount: 0,
  isBuzzGenerating: false,
  mapStatus: 'loading',
  mapLoaded: false,
  activeMapPoint: null,
  activeSearchArea: null,
  
  // Actions
  setIsAddingPoint: (value) => set({ isAddingPoint: value }),
  setIsAddingMapPoint: (value) => set({ isAddingMapPoint: value }),
  setIsAddingSearchArea: (value) => set({ isAddingSearchArea: value }),
  setAreaCreated: (value) => set({ areaCreated: value }),
  setBuzzCount: (count) => set({ buzzCount: count }),
  setIsBuzzGenerating: (value) => set({ isBuzzGenerating: value }),
  setMapStatus: (status) => set({ mapStatus: status }),
  setMapLoaded: (loaded) => set({ mapLoaded: loaded }),
  setActiveMapPoint: (id) => set({ activeMapPoint: id }),
  setActiveSearchArea: (id) => set({ activeSearchArea: id }),
  
  // Combined actions
  resetPointStates: () => set({ 
    isAddingPoint: false, 
    isAddingMapPoint: false,
    activeMapPoint: null 
  }),
  resetAllStates: () => set({
    isAddingPoint: false,
    isAddingMapPoint: false,
    isAddingSearchArea: false,
    areaCreated: false,
    activeMapPoint: null,
    activeSearchArea: null
  })
}));
