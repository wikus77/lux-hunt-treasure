
import { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';

interface MapEventHandlerProps {
  isAddingMarker: boolean;
  handleMapClickMarker: (e: any) => void;
  markers: Array<any>;
  currentLocation?: [number, number] | null;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  isAddingMarker,
  handleMapClickMarker,
  markers,
  currentLocation
}) => {
  const toastShownRef = useRef(false);
  
  const map = useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        console.log("Map clicked in MapEventHandler:", e.latlng);
        // Convert Leaflet event to format expected by handleMapClickMarker
        const simulatedGoogleMapEvent = {
          latLng: {
            lat: () => e.latlng.lat,
            lng: () => e.latlng.lng
          }
        };
        handleMapClickMarker(simulatedGoogleMapEvent);
      }
    }
  });
  
  // Change cursor style based on the current action state
  useEffect(() => {
    if (!map) return;
    
    if (isAddingMarker) {
      map.getContainer().style.cursor = 'crosshair';
      toast.info("Clicca sulla mappa per posizionare il punto", {
        duration: 3000
      });
    } else {
      map.getContainer().style.cursor = 'grab';
    }
    
    return () => {
      if (map) map.getContainer().style.cursor = 'grab';
    };
  }, [isAddingMarker, map]);
  
  // Ensure markers are visible in the viewport if we have any
  useEffect(() => {
    if (markers.length > 0 && map) {
      const bounds = L.latLngBounds([]);
      markers.forEach(marker => {
        bounds.extend([marker.lat, marker.lng]);
      });
      
      // Only fit bounds if we have valid bounds
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [markers, map]);
  
  // Center map on user's location if available
  useEffect(() => {
    if (currentLocation && map && !toastShownRef.current) {
      try {
        map.setView([currentLocation[0], currentLocation[1]], 13);
      } catch (err) {
        console.error("Error setting map view:", err);
      }
    }
  }, [currentLocation, map]);
  
  return null;
};

export default MapEventHandler;
