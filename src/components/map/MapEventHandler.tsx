
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
    } else {
      mapContainer.style.cursor = 'grab';
    }
    
    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingMapPoint, isAddingSearchArea]);
  
  // Handle map click events
  useEffect(() => {
    if (!map) return;
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingSearchArea) {
        handleMapClickArea(e);
      } else if (isAddingMapPoint) {
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
