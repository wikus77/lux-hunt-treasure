
import { useCallback } from 'react';

export const useMapInteractions = (markerLogic: any, areaLogic: any) => {
  // Handle click on map for adding markers or areas
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (markerLogic.isAddingMarker) {
      markerLogic.handleMapClickMarker(e);
    } else if (areaLogic.isAddingSearchArea) {
      areaLogic.handleMapClickArea(e);
    }
  }, [markerLogic, areaLogic]);
  
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
