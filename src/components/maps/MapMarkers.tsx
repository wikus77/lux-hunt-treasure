
import React, { useRef, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import MapUserMarkers from "./MapUserMarkers";
import MapSearchAreas from "./MapSearchAreas";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
  mapOptions?: {
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
    streetViewControl?: boolean;
    zoomControlOptions?: google.maps.ZoomControlOptions;
    gestureHandling?: "cooperative" | "greedy" | "auto" | "none";
  };
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem"
};

const defaultCenter = { lat: 45.4642, lng: 9.19 }; // Milano

// Enhanced neon map styles with dynamic border thickness
const neonMapStyles = [
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ color: "#f9f9f9" }, { weight: "0.50" }, { visibility: "on" }]
  },
  // Administrative borders - Thinner at higher zoom levels
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9b87f5" }, { weight: 1.3 }, { visibility: "on" }]
  },
  // Country borders - Neon purple for all
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9b87f5" }, { weight: 2 }, { visibility: "on" }]
  },
  // Provincial/State borders - Slightly thinner
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9b87f5" }, { weight: 1.5 }, { visibility: "on" }]
  },
  // Continent borders - Keep cyan for visual hierarchy
  {
    featureType: "administrative.continent",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1EAEDB" }, { weight: 3 }, { visibility: "on" }]
  },
  // Background color - Dark blue
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#0d0d1f" }]
  },
  // Hide POIs for cleaner look
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  },
  // Roads - Subtle but visible
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      { color: "#1a1a3a" },
      { weight: 1 },
      { visibility: "simplified" }
    ]
  },
  // Simplify road labels
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
  mapOptions,
}: MapMarkersProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(13);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Handle zoom change to adjust border thickness dynamically
  const handleZoomChanged = useCallback(() => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom();
      if (newZoom !== undefined) {
        setCurrentZoomLevel(newZoom);
        
        // Dynamic styling based on zoom level
        // We rely on the predefined styles but could apply more specific changes here
      }
    }
  }, []);
  
  // Store the map instance on load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  
  // Handle region hover (will be expanded in future versions)
  const handleRegionHover = useCallback((regionName: string | null) => {
    setHoveredRegion(regionName);
  }, []);
  
  // Setup map options with dynamic border thickness
  const getMapOptions = useCallback(() => {
    return {
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "auto",
      styles: neonMapStyles,
      backgroundColor: "#0d0d1f",
      // Improve the feel of interaction
      tilt: 0, // Flat view for better readability
      rotateControl: false, // Disable rotation for simpler navigation
      ...mapOptions, // Merge with any passed mapOptions
    };
  }, [mapOptions]);

  return (
    <div className="relative w-full h-full flex justify-center">
      <TooltipProvider>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center ?? defaultCenter}
            onClick={onMapClick}
            onDblClick={onMapDoubleClick}
            options={getMapOptions()}
            onLoad={handleMapLoad}
            onZoomChanged={handleZoomChanged}
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

            {/* Add a tooltip for future hover state enhancements */}
            {hoveredRegion && (
              <Tooltip open>
                <TooltipContent side="top">
                  <p className="font-bold">{hoveredRegion}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Caricamento mappa...
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};

