
import React, { useEffect } from 'react';
import { DEFAULT_LOCATION } from '../useMapLogic';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useMapCenterLogic } from '@/hooks/map/useMapCenterLogic';
import MapContainerCore from '@/components/map/MapContainerCore';
import MapControlsOverlay from '@/components/map/MapControlsOverlay';

interface MapContainerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  isAddingSearchArea?: boolean;
  handleMapClickArea?: (e: any) => void;
  searchAreas?: any[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
  setPendingRadius?: (value: number) => void;
  requestLocationPermission?: () => void;
  toggleAddingSearchArea?: () => void;
  showHelpDialog?: boolean;
  setShowHelpDialog?: (show: boolean) => void;
}

const MapContainerComponent: React.FC<MapContainerProps> = ({
  isAddingPoint,
  setIsAddingPoint,
  addNewPoint,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  handleBuzz,
  isAddingSearchArea = false,
  handleMapClickArea = () => {},
  searchAreas = [],
  setActiveSearchArea = () => {},
  deleteSearchArea = async () => false,
  setPendingRadius = () => {},
  requestLocationPermission = () => {},
  toggleAddingSearchArea = () => {},
  showHelpDialog = false,
  setShowHelpDialog = () => {}
}) => {
  const { currentWeekAreas } = useBuzzMapLogic();
  const { mapCenter, handleMapReady, handleAreaGenerated } = useMapCenterLogic(DEFAULT_LOCATION);

  // Debug logging for point addition state
  useEffect(() => {
    console.log("🔄 MapContainer - isAddingPoint state:", isAddingPoint);
  }, [isAddingPoint]);

  // Enhanced addNewPoint handler with proper logging
  const handleAddNewPoint = (lat: number, lng: number) => {
    console.log("⭐ handleAddNewPoint called with coordinates:", { lat, lng });
    console.log("🔄 Current isAddingPoint state:", isAddingPoint);
    
    if (isAddingPoint) {
      console.log("✅ Creating new point at coordinates:", lat, lng);
      addNewPoint(lat, lng);
      setIsAddingPoint(false);
      console.log("🔄 isAddingPoint set to false after point creation");
    } else {
      console.log("❌ Not in adding point mode, ignoring click");
    }
  };

  return (
    <div 
      className="rounded-[24px] overflow-hidden relative w-full" 
      style={{ 
        height: '70vh', 
        minHeight: '500px',
        width: '100%',
        display: 'block',
        position: 'relative'
      }}
    >
      <MapContainerCore
        onMapReady={handleMapReady}
        isAddingPoint={isAddingPoint}
        setIsAddingPoint={setIsAddingPoint}
        onAddNewPoint={handleAddNewPoint}
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
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
        setPendingRadius={setPendingRadius}
        currentWeekAreas={currentWeekAreas}
        defaultLocation={DEFAULT_LOCATION}
      />

      <MapControlsOverlay
        requestLocationPermission={requestLocationPermission}
        toggleAddingSearchArea={toggleAddingSearchArea}
        isAddingSearchArea={isAddingSearchArea}
        handleBuzz={handleBuzz}
        mapCenter={mapCenter}
        onAreaGenerated={handleAreaGenerated}
        isAddingMapPoint={isAddingPoint}
        showHelpDialog={showHelpDialog}
        setShowHelpDialog={setShowHelpDialog}
      />
    </div>
  );
};

export default MapContainerComponent;
