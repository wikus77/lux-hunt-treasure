
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
      mapContainer.style.cursor = 'crosshair'; // Change cursor to crosshair for both modes
      console.log(`Cursor changed to crosshair (Adding ${isAddingMapPoint ? 'point' : 'search area'})`);
    } else {
      mapContainer.style.cursor = 'grab';
      console.log("Cursor changed to grab (normal mode)");
    }
    
    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingMapPoint, isAddingSearchArea]);
  
  // Handle map click events
  useEffect(() => {
    if (!map) return;
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      console.log("Map click detected:", {
        mode: isAddingSearchArea ? "search area" : isAddingMapPoint ? "map point" : "normal",
        latlng: e.latlng
      });
      
      if (isAddingSearchArea) {
        console.log("Handling click for search area");
        handleMapClickArea(e);
      } else if (isAddingMapPoint) {
        console.log("Handling click for map point");
        onMapPointClick(e.latlng.lat, e.latlng.lng);
      }
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isAddingSearchArea, isAddingMapPoint, handleMapClickArea, onMapPointClick]);
  
  return null;
};

export default MapEventHandler;
