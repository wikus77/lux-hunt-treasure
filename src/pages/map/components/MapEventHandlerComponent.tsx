
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { SearchArea } from '@/components/maps/types';

type MapEventHandlerProps = {
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: google.maps.MapMouseEvent) => void;
  searchAreas: SearchArea[];
  setPendingRadius: (radius: number) => void;
};

const MapEventHandlerComponent: React.FC<MapEventHandlerProps> = ({
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setPendingRadius
}) => {
  const map = useMapEvents({
    click: (e) => {
      if (isAddingSearchArea) {
        console.log("MAP CLICKED", e.latlng);
        console.log("Coordinate selezionate:", e.latlng.lat, e.latlng.lng);
        
        // Convert Leaflet event to format expected by handleMapClickArea
        const simulatedGoogleMapEvent = {
          latLng: {
            lat: () => e.latlng.lat,
            lng: () => e.latlng.lng
          }
        };
        
        // Call the handler to create the area
        handleMapClickArea(simulatedGoogleMapEvent);
      }
    }
  });
  
  // Change cursor style based on the current action state
  useEffect(() => {
    if (!map) return;
    
    if (isAddingSearchArea) {
      map.getContainer().style.cursor = 'crosshair';
      console.log("CURSORE CAMBIATO A CROSSHAIR");
      toast.info("Clicca sulla mappa per posizionare l'area", {
        duration: 3000
      });
    } else {
      map.getContainer().style.cursor = 'grab';
      console.log("Cursore ripristinato a grab");
    }
    
    return () => {
      if (map) map.getContainer().style.cursor = 'grab';
    };
  }, [isAddingSearchArea, map]);
  
  // Ensure search areas are visible in the viewport
  useEffect(() => {
    if (searchAreas.length > 0 && map) {
      const bounds = L.latLngBounds([]);
      searchAreas.forEach(area => {
        bounds.extend([area.lat, area.lng]);
      });
      
      // Only fit bounds if we have valid bounds
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [searchAreas, map]);
  
  return null;
};

export default MapEventHandlerComponent;
