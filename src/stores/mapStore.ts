import { create } from 'zustand';

interface MapState {
  // Point management
  isAddingPoint: boolean;
  isAddingMapPoint: boolean;
  
  // BUZZ and area management
  areaCreated: boolean;
  buzzCount: number;
  
  // Map status
  mapStatus: 'idle' | 'loading' | 'ready' | 'error';
  
  // Actions
  setIsAddingPoint: (value: boolean) => void;
  setIsAddingMapPoint: (value: boolean) => void;
  setAreaCreated: (value: boolean) => void;
  setBuzzCount: (count: number) => void;
  incrementBuzzCount: () => void;
  setMapStatus: (status: 'idle' | 'loading' | 'ready' | 'error') => void;
  
  // Sync actions to keep states consistent
  syncPointStates: (value: boolean) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  isAddingPoint: false,
  isAddingMapPoint: false,
  areaCreated: false,
  buzzCount: 0,
  mapStatus: 'idle',
  
  // Actions
  setIsAddingPoint: (value: boolean) => set({ isAddingPoint: value }),
  setIsAddingMapPoint: (value: boolean) => set({ isAddingMapPoint: value }),
  setAreaCreated: (value: boolean) => set({ areaCreated: value }),
  setBuzzCount: (count: number) => set({ buzzCount: count }),
  incrementBuzzCount: () => set((state) => ({ buzzCount: state.buzzCount + 1 })),
  setMapStatus: (status: 'idle' | 'loading' | 'ready' | 'error') => set({ mapStatus: status }),
  
  // Sync both point states to maintain consistency
  syncPointStates: (value: boolean) => set({ 
    isAddingPoint: value, 
    isAddingMapPoint: value 
  }),
}));
