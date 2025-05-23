
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';  // Ensure Leaflet is properly imported

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
  // Get the Leaflet map instance
  const map = useMapEvents({
    click: (e) => {
      // Log ALL clicks for debugging
      console.log("🔍 MAP CLICK DETECTED", { 
        isAddingSearchArea, 
        isAddingMapPoint, 
        coords: [e.latlng.lat, e.latlng.lng],
        target: e.originalEvent.target,
        isLeafletContainer: e.originalEvent.target.closest('.leaflet-container') !== null,
        eventType: e.type
      });
      
      if (isAddingSearchArea) {
        console.log("🎯 MAP CLICKED FOR SEARCH AREA", e.latlng);
        
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
      
      // Handle click for new map point - CRITICAL FIX
      if (isAddingMapPoint) {
        console.log("🎯 MAP CLICKED FOR MAP POINT - HANDLER TRIGGERED", e.latlng);
        // Call the handler with coordinates extracted from event
        onMapPointClick(e.latlng.lat, e.latlng.lng);
        
        // Visual debug to confirm click location
        const clickMarker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
          radius: 5,
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.5,
          weight: 2
        });
        
        // Add to map temporarily for visual debug
        clickMarker.addTo(map);
        
        // Remove after 3 seconds
        setTimeout(() => {
          map.removeLayer(clickMarker);
        }, 3000);
      }
    }
  });
  
  // Change cursor style based on the current action state
  useEffect(() => {
    if (!map) return;
    
    const mapContainer = map.getContainer();
    console.log("🔄 Map container retrieved:", mapContainer ? "YES" : "NO");
    
    // Force an immediate cursor change with timeout of 0ms
    setTimeout(() => {
      if (isAddingSearchArea) {
        console.log("✏️ Cursore cambiato in crosshair per area");
        mapContainer.style.cursor = 'crosshair';
        toast.info("Clicca sulla mappa per posizionare l'area", {
          duration: 3000
        });
      } else if (isAddingMapPoint) {
        console.log("✏️ Cursore cambiato in crosshair per punto", isAddingMapPoint);
        mapContainer.style.cursor = 'crosshair';
        toast.info("Clicca sulla mappa per posizionare il punto", {
          duration: 3000
        });
      } else {
        console.log("✏️ Cursore ripristinato a grab");
        mapContainer.style.cursor = 'grab';
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
    
    // Verify the layers are properly ordered
    console.log("🔍 Leaflet panes check:", {
      tilePane: map.getPane('tilePane') ? "EXISTS" : "MISSING",
      overlayPane: map.getPane('overlayPane') ? "EXISTS" : "MISSING",
      markerPane: map.getPane('markerPane') ? "EXISTS" : "MISSING"
    });
    
    // Create a custom pane for our markers if needed
    if (!map.getPane('m1ssionMarkers')) {
      console.log("🛠️ Creating custom marker pane for better visibility");
      map.createPane('m1ssionMarkers');
      const markersPane = map.getPane('m1ssionMarkers');
      if (markersPane) {
        markersPane.style.zIndex = '650';
        markersPane.style.pointerEvents = 'auto';
      }
    }
    
    console.log("🔄 Current map state:", {
      isAddingMapPoint,
      isAddingSearchArea,
      zoomLevel: map.getZoom(),
      center: map.getCenter()
    });
    
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
