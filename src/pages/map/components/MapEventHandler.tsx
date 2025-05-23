
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';  // Add missing import

interface MapEventHandlerProps {
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setPendingRadius: (radius: number) => void;
  isAddingMapPoint: boolean;
  onMapPointClick: (lat: number, lng: number) => void;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setPendingRadius,
  isAddingMapPoint,
  onMapPointClick
}) => {
  const map = useMapEvents({
    click: (e) => {
      console.log("MAP CLICK DETECTED", { 
        isAddingSearchArea, 
        isAddingMapPoint, 
        coords: [e.latlng.lat, e.latlng.lng] 
      });
      
      if (isAddingSearchArea) {
        console.log("MAP CLICKED FOR SEARCH AREA", e.latlng);
        
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
      
      // Critical fix: Handle map point click directly here without any conditional checks
      // that might interfere with the state changes
      if (isAddingMapPoint) {
        console.log("MAP CLICKED FOR MAP POINT - HANDLER TRIGGERED", e.latlng);
        onMapPointClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  
  // Change cursor style based on the current action state
  useEffect(() => {
    if (!map) return;
    
    const mapContainer = map.getContainer();
    
    // Force an immediate cursor change with timeout of 0ms
    setTimeout(() => {
      if (isAddingSearchArea) {
        mapContainer.style.cursor = 'crosshair';
        console.log("Cursore cambiato in crosshair per area");
        toast.info("Clicca sulla mappa per posizionare l'area", {
          duration: 3000
        });
      } else if (isAddingMapPoint) {
        mapContainer.style.cursor = 'crosshair';
        console.log("Cursore cambiato in crosshair per punto", isAddingMapPoint);
        toast.info("Clicca sulla mappa per posizionare il punto", {
          duration: 3000
        });
      } else {
        mapContainer.style.cursor = 'grab';
        console.log("Cursore ripristinato a grab");
      }
    }, 0);
    
    // Force cursor update to all leaflet containers
    document.querySelectorAll('.leaflet-container').forEach(container => {
      if (container instanceof HTMLElement) {
        if (isAddingSearchArea || isAddingMapPoint) {
          container.style.cursor = 'crosshair';
        } else {
          container.style.cursor = 'grab';
        }
      }
    });
    
    console.log("Forced cursor style:", isAddingMapPoint ? "crosshair" : "grab");
    
    return () => {
      if (map) {
        mapContainer.style.cursor = 'grab';
        document.querySelectorAll('.leaflet-container').forEach(container => {
          if (container instanceof HTMLElement) {
            container.style.cursor = 'grab';
          }
        });
      }
    };
  }, [isAddingSearchArea, isAddingMapPoint, map]);
  
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

export default MapEventHandler;
