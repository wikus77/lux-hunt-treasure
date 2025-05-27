
import React, { useEffect } from 'react';
import { DEFAULT_LOCATION } from '@/pages/map/useMapLogic';
import { useMapPoints } from '@/pages/map/hooks/useMapPoints';
import { useMapInitialization } from '@/pages/map/hooks/useMapInitialization';
import { useMapSynchronization } from '@/hooks/map/useMapSynchronization';
import MapContent from '@/pages/map/components/MapContent';
import MapControls from '@/pages/map/components/MapControls';
import TechnicalStatus from '@/pages/map/components/TechnicalStatus';

interface MapLogicCoreProps {
  handleBuzz: () => void;
  searchAreas: any[];
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
  toggleAddingSearchArea: () => void;
  mapPoints: any[];
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  addMapPoint: (point: any) => Promise<string>;
  updateMapPoint: (id: string, updates: any) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  requestLocationPermission: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: (show: boolean) => void;
  mapCenter: [number, number];
  onAreaGenerated: (lat: number, lng: number, radius: number) => void;
}

const MapLogicCore: React.FC<MapLogicCoreProps> = ({
  handleBuzz,
  searchAreas,
  isAddingSearchArea,
  handleMapClickArea,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius,
  toggleAddingSearchArea,
  mapPoints,
  isAddingPoint,
  setIsAddingPoint,
  activeMapPoint,
  setActiveMapPoint,
  addMapPoint,
  updateMapPoint,
  deleteMapPoint,
  requestLocationPermission,
  showHelpDialog,
  setShowHelpDialog,
  mapCenter,
  onAreaGenerated
}) => {
  // Modified to return a Promise<string> with correct parameter structure
  const handleMapPointClick = async (point: { lat: number; lng: number; title: string; note: string }): Promise<string> => {
    const newPointId = `point-${Date.now()}`;
    addMapPoint({
      id: newPointId,
      lat: point.lat,
      lng: point.lng,
      title: point.title || '',
      note: point.note || ''
    });
    return newPointId; // Return the new point ID
  };

  // Use our custom hook for map points
  const {
    newPoint,
    handleMapPointClick: hookHandleMapPointClick,
    handleSaveNewPoint,
    handleUpdatePoint,
    handleCancelNewPoint,
    isAddingMapPoint,
    setIsAddingMapPoint
  } = useMapPoints(
    mapPoints,
    setActiveMapPoint,
    handleMapPointClick,
    updateMapPoint,
    deleteMapPoint
  );
  
  // Use our custom hook for map initialization
  const {
    mapLoaded,
    setMapLoaded,
    mapRef,
    handleMapLoad
  } = useMapInitialization(
    isAddingMapPoint,
    isAddingPoint,
    isAddingSearchArea,
    hookHandleMapPointClick,
    handleMapClickArea
  );

  // Use synchronization hook
  useMapSynchronization(isAddingPoint, isAddingMapPoint, setIsAddingMapPoint, setIsAddingPoint);
  
  // Simulate a small loading delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoaded(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapLoaded, setMapLoaded]);

  if (!mapLoaded) return null;

  return (
    <>
      {/* Map content */}
      <MapContent 
        mapRef={mapRef}
        handleMapLoad={handleMapLoad}
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
        mapPoints={mapPoints}
        activeMapPoint={activeMapPoint}
        setActiveMapPoint={setActiveMapPoint}
        handleUpdatePoint={handleUpdatePoint}
        deleteMapPoint={deleteMapPoint}
        newPoint={newPoint}
        handleSaveNewPoint={handleSaveNewPoint}
        handleCancelNewPoint={handleCancelNewPoint}
        isAddingSearchArea={isAddingSearchArea}
        handleMapClickArea={handleMapClickArea}
        setPendingRadius={setPendingRadius}
        isAddingMapPoint={isAddingMapPoint || isAddingPoint}
        hookHandleMapPointClick={hookHandleMapPointClick}
      />

      {/* Map controls */}
      <MapControls
        requestLocationPermission={requestLocationPermission}
        toggleAddingSearchArea={toggleAddingSearchArea}
        isAddingSearchArea={isAddingSearchArea}
        handleBuzz={handleBuzz}
        isAddingMapPoint={isAddingMapPoint || isAddingPoint}
        showHelpDialog={showHelpDialog}
        setShowHelpDialog={setShowHelpDialog}
        mapCenter={mapCenter}
        onAreaGenerated={onAreaGenerated}
      />
      
      {/* Technical status logger */}
      <TechnicalStatus 
        mapRef={mapRef}
        isAddingMapPoint={isAddingMapPoint}
        isAddingPoint={isAddingPoint}
        isAddingSearchArea={isAddingSearchArea}
        newPoint={newPoint}
        mapPoints={mapPoints}
        searchAreas={searchAreas}
      />
    </>
  );
};

export default MapLogicCore;
