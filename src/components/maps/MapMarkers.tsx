
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
  height: "60vw",
  maxHeight: "60vh",
  minHeight: "300px",
  borderRadius: "1rem"
};

const defaultCenter = { lat: 45.4642, lng: 9.19 }; // Milano

// Custom map styles resembling "Risiko" board game
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
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#444444" }, { weight: 2 }, { visibility: "on" }]
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#5a5a5a" }, { weight: 1.5 }, { visibility: "on" }]
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#283046" }, { visibility: "on" }]
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#555555" }, { weight: 1 }, { visibility: "simplified" }]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#12172a" }, { visibility: "on" }]
  },
  {
    featureType: "water",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0c2340" }, { weight: 1 }, { visibility: "on" }]
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
    <div className="relative w-full flex justify-center">
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
            styles: risikoMapStyles
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
