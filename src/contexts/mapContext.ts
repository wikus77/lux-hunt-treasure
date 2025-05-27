
import { createContext, useContext } from 'react';

export interface MapContextType {
  handleBuzz: () => void;
  searchAreas: any[];
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
  toggleAddingSearchArea: () => void;
  mapPoints: any[];
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  addMapPoint: (point: any) => void;
  updateMapPoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  requestLocationPermission: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: (show: boolean) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  mapRef: React.RefObject<any>;
  handleMapLoad: (map: any) => void;
  newPoint: any | null;
  handleMapPointClick: (point: { lat: number; lng: number; title: string; note: string }) => Promise<string>;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  handleCancelNewPoint: () => void;
  isAddingMapPoint: boolean;
  setIsAddingMapPoint: (value: boolean) => void;
  onAreaGenerated: (lat: number, lng: number, radius: number) => void;
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};
