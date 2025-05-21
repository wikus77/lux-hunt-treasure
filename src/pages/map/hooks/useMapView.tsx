
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface SetViewProps {
  center: [number, number];
  zoom: number;
}

export function SetViewOnChange({ center, zoom }: SetViewProps) {
  const map = useMap();
  
  useEffect(() => {
    if (map && center && Array.isArray(center) && center.length === 2) {
      // Ensure all values are valid before setting view
      if (!isNaN(center[0]) && !isNaN(center[1]) && !isNaN(zoom)) {
        try {
          console.log("Setting map view to:", center, zoom);
          map.setView(center, zoom);
        } catch (err) {
          console.error("Error setting map view:", err);
        }
      }
    }
  }, [center, zoom, map]);
  
  return null;
}
