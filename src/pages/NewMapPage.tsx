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
import { MapStateProvider } from './map/MapStateProvider';

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

  // P0 FIX: Store handler refs from MapContainer
  const toggle3DHandlerRef = React.useRef<((is3D: boolean) => void) | null>(null);
  const focusLocationHandlerRef = React.useRef<(() => void) | null>(null);
  const resetViewHandlerRef = React.useRef<(() => void) | null>(null);

  // Register handlers from MapContainer (receives function refs)
  const registerToggle3D = React.useCallback((handler: (is3D: boolean) => void) => {
    toggle3DHandlerRef.current = handler;
  }, []);

  const registerFocusLocation = React.useCallback((handler: () => void) => {
    focusLocationHandlerRef.current = handler;
  }, []);

  const registerResetView = React.useCallback((handler: () => void) => {
    resetViewHandlerRef.current = handler;
  }, []);

  // Operational handlers for MapDock (execute now)
  const handleToggle3D = React.useCallback((enabled: boolean) => {
    setIs3D(enabled);
    if (toggle3DHandlerRef.current) {
      toggle3DHandlerRef.current(enabled);
    }
  }, []);

  const handleFocusLocation = React.useCallback(() => {
    if (focusLocationHandlerRef.current) {
      focusLocationHandlerRef.current();
    }
  }, []);

  const handleResetView = React.useCallback(() => {
    if (resetViewHandlerRef.current) {
      resetViewHandlerRef.current();
    }
  }, []);

  return (
    <MapStateProvider>
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
        onToggle3D={handleToggle3D}
        onFocusLocation={handleFocusLocation}
        onResetView={handleResetView}
        onRegisterToggle3D={registerToggle3D}
        onRegisterFocusLocation={registerFocusLocation}
        onRegisterResetView={registerResetView}
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
    </MapStateProvider>
  );
};

export default NewMapPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
