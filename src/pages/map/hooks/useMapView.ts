import { useState, useEffect } from 'react';

interface MapViewConfig {
  mapCenter: [number, number];
  mapZoom: number;
}

export function useMapView(): MapViewConfig {
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.4642, 9.1900]);
  const [mapZoom, setMapZoom] = useState<number>(6);

  // You can add logic here to update map center and zoom based on user location or other factors
  useEffect(() => {
    // Default configuration for Italy
    setMapCenter([45.4642, 9.1900]);
    setMapZoom(6);
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
