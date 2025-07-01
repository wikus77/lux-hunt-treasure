
export interface MapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  created_at: string;
  isActive: boolean;
  user_id: string;
  week: number;
}

export interface BuzzMapArea extends MapArea {
  coordinates: { lat: number; lng: number };
  radius: number; // in meters
  color: string;
  colorName: string;
  generation: number;
}

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  note: string;
  created_at: string;
  user_id: string;
}

export interface SearchArea {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface PrizeArea {
  lat: number;
  lng: number;
  radius: number;
  isVisible: boolean;
}

export interface ClueType {
  id: string;
  title_it: string;
  description_it: string;
  clue_type: 'vague' | 'precise' | 'location';
  buzz_cost: number;
  created_at: string;
}

export interface MapViewConfig {
  center: [number, number];
  zoom: number;
}

export interface MapContainerProps {
  mapRef: React.RefObject<any>;
  onMapClick: (e: any) => void;
  selectedWeek: number;
  isAddingPoint: boolean;
  setIsAddingPoint: React.Dispatch<React.SetStateAction<boolean>>;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    note: string;
    position: { lat: number; lng: number };
  }>;
  activeMapPoint: string | null;
  setActiveMapPoint: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  requestLocationPermission: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setActiveSearchArea: React.Dispatch<React.SetStateAction<string | null>>;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
  toggleAddingSearchArea: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
