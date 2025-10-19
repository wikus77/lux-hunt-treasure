// ✅ Fix UI chirurgico firmato esclusivamente BY JOSEPH MULE — M1SSION™
import React, { useState } from 'react';
import MapPageLayout from './map/components/MapPageLayout';
import MapSection from './map/components/MapSection';
import NotesSection from './map/NotesSection';
import SidebarLayout from './map/components/SidebarLayout';
import RightSidebarContent from './map/components/RightSidebarContent';
import { useNewMapPage } from './map/hooks/useNewMapPage';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';
import { useMissionManager } from '@/hooks/useMissionManager';
import { useMapPageEffects } from './map/hooks/useMapPageEffects';
import { useDeepLinkQR } from '@/hooks/useDeepLinkQR';

const NewMapPage = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [is3D, setIs3D] = useState(false);
  useDeepLinkQR();
  const { updateActivity, endActivity } = useDynamicIsland();
  const { currentMission, updateMissionProgress } = useMissionManager();
  
  const {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
    activeMapPoint,
    setActiveMapPoint,
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    setPendingRadius,
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    handleBuzz,
    requestLocationPermission,
  } = useNewMapPage();

  // Use extracted effects hook
  useMapPageEffects({
    mapPoints,
    searchAreas,
    currentMission,
    updateMissionProgress,
    updateActivity,
  });

  // Handlers for map dock actions - store callback refs
  const [toggle3DCallback, setToggle3DCallback] = useState<((is3D: boolean) => void) | null>(null);
  const [focusLocationCallback, setFocusLocationCallback] = useState<(() => void) | null>(null);
  const [resetViewCallback, setResetViewCallback] = useState<(() => void) | null>(null);

  const handleToggle3D = (enabled: boolean) => {
    setIs3D(enabled);
    if (toggle3DCallback) {
      toggle3DCallback(enabled);
    }
  };

  const handleFocusLocation = () => {
    if (focusLocationCallback) {
      focusLocationCallback();
    }
  };

  const handleResetView = () => {
    if (resetViewCallback) {
      resetViewCallback();
    }
  };

  return (
    <MapPageLayout>
      <MapSection
        isAddingPoint={isAddingPoint}
        setIsAddingPoint={setIsAddingPoint}
        addNewPoint={addNewPoint}
        mapPoints={mapPoints}
        activeMapPoint={activeMapPoint}
        setActiveMapPoint={setActiveMapPoint}
        updateMapPoint={updateMapPoint}
        deleteMapPoint={deleteMapPoint}
        newPoint={newPoint}
        savePoint={savePoint}
        handleBuzz={handleBuzz}
        requestLocationPermission={requestLocationPermission}
        isAddingSearchArea={isAddingSearchArea}
        handleMapClickArea={handleMapClickArea}
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
        setPendingRadius={setPendingRadius}
        toggleAddingSearchArea={toggleAddingSearchArea}
        showHelpDialog={showHelpDialog}
        setShowHelpDialog={setShowHelpDialog}
        onToggle3D={setToggle3DCallback as any}
        onFocusLocation={setFocusLocationCallback as any}
        onResetView={setResetViewCallback as any}
      />
      
      <SidebarLayout
        leftContent={<NotesSection />}
        rightContent={
          <RightSidebarContent
            mapPoints={mapPoints.map(p => ({
              id: p.id,
              lat: p.latitude,
              lng: p.longitude,
              title: p.title,
              note: p.note,
              position: { lat: p.latitude, lng: p.longitude }
            }))}
            isAddingMapPoint={isAddingPoint}
            toggleAddingMapPoint={() => setIsAddingPoint(prev => !prev)}
            setActiveMapPoint={setActiveMapPoint}
            deleteMapPoint={deleteMapPoint}
            searchAreas={searchAreas}
            setActiveSearchArea={setActiveSearchArea}
            handleAddArea={handleAddArea}
            isAddingSearchArea={isAddingSearchArea}
            deleteSearchArea={deleteSearchArea}
          />
        }
      />
    </MapPageLayout>
  );
};

export default NewMapPage;
