
import React from 'react';
import { useMapEvents } from 'react-leaflet';

interface MapEventHandlerProps {
  onMapClick: (e: any) => void;
  isAddingPoint: boolean;
  isAddingSearchArea: boolean;
}

// CRITICAL FIX: Proper event handling for react-leaflet
export const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  onMapClick,
  isAddingPoint,
  isAddingSearchArea
}) => {
  useMapEvents({
    click: (e) => {
      console.log('🗺️ CRITICAL: Map click event captured via useMapEvents', {
        isAddingPoint,
        isAddingSearchArea,
        coordinates: e.latlng
      });
      
      // Only trigger if in adding mode
      if (isAddingPoint || isAddingSearchArea) {
        onMapClick(e);
      }
    }
  });

  return null;
};

export default MapEventHandler;
