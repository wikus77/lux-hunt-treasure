
import { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';

interface MapEventHandlerProps {
  isAddingMarker: boolean;
  handleMapClickMarker: (e: any) => void;
  markers: Array<any>;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  isAddingMarker,
  handleMapClickMarker,
  markers
}) => {
  const map = useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        console.log("Map clicked in MapEventHandler:", e.latlng);
        console.log("Cursore impostato su crosshair");
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
      console.log("Cursore cambiato in crosshair");
      toast.info("Clicca sulla mappa per posizionare il punto", {
        duration: 3000
      });
    } else {
      map.getContainer().style.cursor = 'grab';
      console.log("Cursore ripristinato a grab");
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
  
  return null;
};

export default MapEventHandler;
