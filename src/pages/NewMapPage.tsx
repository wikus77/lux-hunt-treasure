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

const NewMapPage = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
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
