
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapEventHandlerProps {
  isAddingSearchArea: boolean;
  isAddingMapPoint: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setPendingRadius: (radius: number) => void;
  onMapPointClick: (lat: number, lng: number) => void;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  isAddingSearchArea,
  isAddingMapPoint,
  handleMapClickArea,
  searchAreas,
  setPendingRadius,
  onMapPointClick
}) => {
  const map = useMap();
  
  // Handle cursor style based on mode
  useEffect(() => {
    if (!map) return;
    
    const mapContainer = map.getContainer();
    
    if (isAddingMapPoint || isAddingSearchArea) {
      mapContainer.style.cursor = 'crosshair';
      console.log(`🎯 Cursor changed to crosshair (Adding ${isAddingMapPoint ? 'point' : 'search area'})`);
    } else {
      mapContainer.style.cursor = 'grab';
      console.log("🎯 Cursor changed to grab (normal mode)");
    }
    
    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingMapPoint, isAddingSearchArea]);
  
  // Handle map click events
  useEffect(() => {
    if (!map) return;
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      console.log("🗺️ clic su mappa registrato:", {
        isAddingMapPoint,
        isAddingSearchArea,
        coordinates: e.latlng
      });
      
      if (isAddingSearchArea) {
        console.log("🔵 Handling click for search area");
        handleMapClickArea(e);
      } else if (isAddingMapPoint) {
        console.log("⭐ Handling click for map point at:", e.latlng.lat, e.latlng.lng);
        onMapPointClick(e.latlng.lat, e.latlng.lng);
      } else {
        console.log("❌ Click ignored - not in adding mode");
      }
    };
    
    // Add the click listener
    map.on('click', handleMapClick);
    
    // Debug logging for current state
    console.log("🔄 MapEventHandler - Current state:", {
      isAddingMapPoint,
      isAddingSearchArea,
      hasMapClickListener: true
    });
    
    return () => {
      map.off('click', handleMapClick);
      console.log("🗑️ Map click listener removed");
    };
  }, [map, isAddingSearchArea, isAddingMapPoint, handleMapClickArea, onMapPointClick]);
  
  return null;
};

export default MapEventHandler;
