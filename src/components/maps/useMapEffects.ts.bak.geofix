
import { useRef, useState, useCallback } from "react";

export const useMapEffects = () => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(13);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Handle zoom change to adjust border thickness dynamically
  const handleZoomChanged = useCallback(() => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom();
      if (newZoom !== undefined) {
        setCurrentZoomLevel(newZoom);
        // Dynamic styling based on zoom level is kept here
      }
    }
  }, []);
  
  // Store the map instance on load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  
  // Handle region hover
  const handleRegionHover = useCallback((regionName: string | null) => {
    setHoveredRegion(regionName);
  }, []);
  
  // Setup map options with dynamic border thickness
  const getMapOptions = useCallback((mapOptions?: any) => {
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
  }, []);

  return {
    hoveredRegion,
    currentZoomLevel,
    mapRef,
    handleZoomChanged,
    handleMapLoad,
    handleRegionHover,
    getMapOptions,
  };
};

import { neonMapStyles } from "./mapStyles";
