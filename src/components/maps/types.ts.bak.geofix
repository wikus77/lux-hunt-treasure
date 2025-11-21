
// If this file doesn't exist, we'll create it with the necessary types

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note: string;
  position: { lat: number; lng: number };
  createdAt?: Date;
  editing?: boolean;
}

export interface SearchArea {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  color: string;
  position: { lat: number; lng: number };
  isAI?: boolean;
  confidence?: string;
}

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
  center?: google.maps.LatLngLiteral;
  mapOptions?: google.maps.MapOptions;
}
