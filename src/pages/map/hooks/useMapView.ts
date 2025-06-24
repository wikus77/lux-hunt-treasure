
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function useMapView(location: [number, number] | null) {
  const map = useMap();
  
  useEffect(() => {
    if (location && Array.isArray(location) && location.length === 2) {
      map.setView(location, 15);
    }
  }, [map, location]);
}

// Component to automatically set the map view when the provided location changes
export const SetViewOnChange = ({ center, zoom }: { center: [number, number]; zoom?: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};
