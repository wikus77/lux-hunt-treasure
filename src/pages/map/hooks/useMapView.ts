import { useState, useEffect } from 'react';

interface MapViewConfig {
  mapCenter: [number, number];
  mapZoom: number;
}

export function useMapView(): MapViewConfig {
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.4642, 9.1900]);
  const [mapZoom, setMapZoom] = useState<number>(6);

  // CRITICAL FIX: Stable configuration to prevent re-renders
  useEffect(() => {
    // Default configuration for Italy - only set once
    const defaultCenter: [number, number] = [45.4642, 9.1900];
    const defaultZoom = 6;
    
    setMapCenter(defaultCenter);
    setMapZoom(defaultZoom);
    
    console.log('🗺️ Map view initialized:', { center: defaultCenter, zoom: defaultZoom });
  }, []);

  return {
    mapCenter,
    mapZoom
  };
}

// Component to automatically set the map view when the provided location changes
export const SetViewOnChange = ({ center, zoom }: { center: [number, number]; zoom?: number }) => {
  // This component was moved to useMapView.tsx, keeping it here for compatibility
  return null;
};
