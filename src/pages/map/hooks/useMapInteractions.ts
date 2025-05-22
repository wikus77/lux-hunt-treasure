
import { useCallback } from 'react';

export const useMapInteractions = (markerLogic: any) => {
  // Handle click on map for adding markers
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (markerLogic.isAddingMarker) {
      markerLogic.handleMapClickMarker(e);
    }
  }, [markerLogic]);
  
  // Handle double click for future functionality
  const onMapDoubleClick = useCallback((e: google.maps.MapMouseEvent) => {
    console.log("Map double clicked at:", e.latLng?.lat(), e.latLng?.lng());
    // Future implementation
  }, []);

  return {
    onMapClick,
    onMapDoubleClick
  };
};
