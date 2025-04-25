import React, { useRef } from "react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import MapUserMarkers from "./MapUserMarkers";
import MapSearchAreas from "./MapSearchAreas";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  editing?: boolean;
  position: { lat: number; lng: number }; // Mandatory for compatibility
  createdAt?: Date;     // Added for MapLogicProvider
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

type MapMarkersProps = {
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
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem"
};

const defaultCenter = { lat: 45.4642, lng: 9.19 }; // Milano

// Custom map styles with neon effect for continents
const risikoMapStyles = [
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ color: "#f9f9f9" }, { weight: "0.50" }, { visibility: "on" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#444444" }, { weight: 2 }, { visibility: "on" }]
  },
  {
    featureType: "administrative.continent",
    elementType: "geometry.stroke",
    stylers: [
      { visibility: "on" },
      { weight: 3 }
    ]
  },
  // North America - Cyan
  {
    featureType: "administrative.continent",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#1EAEDB" },
      { weight: 3 },
      { visibility: "on" }
    ]
  },
  // Europe - Purple
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#9b87f5" },
      { weight: 2.5 },
      { visibility: "on" }
    ]
  },
  // Background color - Dark blue
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#0d0d1f" }]
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      { color: "#1a1a3a" },
      { weight: 1 },
      { visibility: "simplified" }
    ]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  // Water areas - Darker blue
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#070714" }]
  },
  // Water borders - Light effect
  {
    featureType: "water",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#1EAEDB" },
      { weight: 0.5 },
      { visibility: "on" }
    ]
  }
];

export const MapMarkers = ({
  isLoaded,
  markers,
  searchAreas,
  isAddingMarker,
  isAddingSearchArea,
  activeMarker,
  activeSearchArea,
  onMapClick,
  onMapDoubleClick,
  setActiveMarker,
  setActiveSearchArea,
  saveMarkerNote,
  saveSearchArea,
  editMarker,
  editSearchArea,
  deleteMarker,
  deleteSearchArea,
  center,
}: MapMarkersProps) => {
  return (
    <div className="relative w-full h-full flex justify-center">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center ?? defaultCenter}
          onClick={onMapClick}
          onDblClick={onMapDoubleClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "auto",
            styles: risikoMapStyles,
            backgroundColor: "#0d0d1f"
          }}
        >
          {/* Search Areas */}
          <MapSearchAreas
            searchAreas={searchAreas}
            activeSearchArea={activeSearchArea}
            setActiveSearchArea={setActiveSearchArea}
            saveSearchArea={saveSearchArea}
            editSearchArea={editSearchArea}
            deleteSearchArea={deleteSearchArea}
          />

          {/* User Markers */}
          <MapUserMarkers
            markers={markers}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
            saveMarkerNote={saveMarkerNote}
            editMarker={editMarker}
            deleteMarker={deleteMarker}
          />
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Caricamento mappa...
        </div>
      )}
    </div>
  );
};
