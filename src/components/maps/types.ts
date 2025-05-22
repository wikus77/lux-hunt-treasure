
export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  position: { lat: number; lng: number };
  editing?: boolean;
};

export type SearchArea = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  color?: string;
  position?: { lat: number; lng: number };
  isAI?: boolean;
  confidence?: string; // Added confidence property
};

export interface MapMarkersProps {
  isLoaded: boolean;
  markers: MapMarker[];
  searchAreas: SearchArea[];
  isAddingMarker: boolean;
  isAddingSearchArea: boolean;
  activeMarker: string | null;
  activeSearchArea: string | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onMapDoubleClick: (e: google.maps.MapMouseEvent) => void;
  setActiveMarker: (id: string | null) => void;
  setActiveSearchArea: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editMarker: (id: string) => void;
  editSearchArea: (id: string) => void;
  deleteMarker: (id: string) => void;
  deleteSearchArea: (id: string) => void;
  center?: { lat: number; lng: number };
  mapOptions?: {
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
    streetViewControl?: boolean;
    zoomControlOptions?: google.maps.ZoomControlOptions;
    gestureHandling?: "cooperative" | "greedy" | "auto" | "none";
    zoomControl?: boolean;
    disableDefaultUI?: boolean;
  };
}
