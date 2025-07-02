
import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MapPageHeader from './map/components/MapPageHeader';
import NotesSection from './map/NotesSection';
import SidebarLayout from './map/components/SidebarLayout';
import RightSidebarContent from './map/components/RightSidebarContent';
import { Spinner } from '@/components/ui/spinner';
import { useNewMapPage } from './map/hooks/useNewMapPage';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';
import { useMissionManager } from '@/hooks/useMissionManager';

// CRITICAL: Import Leaflet CSS fixes
import '../styles/leaflet-fixes.css';

// Lazy load map component for better performance
const MapContainer = lazy(() => 
  import('./map/components/MapContainer').then(module => ({ 
    default: module.default || module.MapContainer
  }))
);

const MapLoadingFallback = () => (
  <div className="w-full bg-gray-900/50 rounded-lg flex items-center justify-center" style={{ height: '70vh' }}>
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" className="text-[#00D1FF]" />
      <p className="text-gray-400">Caricamento mappa...</p>
    </div>
  </div>
);

const MapPage = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { updateActivity } = useDynamicIsland();
  const { currentMission, updateMissionProgress } = useMissionManager();
  
  const mapRef = useRef<any>(null);
  
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
    toggleAddingSearchArea,
    setPendingRadius,
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    handleBuzz,
    requestLocationPermission,
  } = useNewMapPage();

  // Dynamic Island integration
  useEffect(() => {
    if (currentMission && currentMission.status === 'active') {
      const cluesFound = mapPoints.filter(point => 
        point.title.toLowerCase().includes('indizio') || 
        point.title.toLowerCase().includes('clue')
      ).length;
      
      if (cluesFound !== currentMission.foundClues) {
        updateMissionProgress(cluesFound);
      }
    }
  }, [mapPoints, currentMission, updateMissionProgress]);

  useEffect(() => {
    if (searchAreas.length > 0 && currentMission?.status === 'active') {
      updateActivity({
        status: `${searchAreas.length} zone esplorate`,
      });
    }
  }, [searchAreas, updateActivity, currentMission]);

  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full min-h-screen"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {/* Header with SafeArea */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131524]/90 backdrop-blur-sm">
        <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <MapPageHeader />
        </div>
      </header>
      
      {/* Main content */}
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 pt-4 pb-2 max-w-6xl">
          {/* Map container with proper sizing */}
          <div 
            className="bg-gray-900/20 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-4 mb-6"
            style={{ 
              minHeight: '70vh',
              height: 'auto',
              position: 'relative'
            }}
          >
            <div 
              className="w-full rounded-xl overflow-hidden"
              style={{ 
                height: '70vh',
                minHeight: '500px',
                backgroundColor: '#1a1a1a'
              }}
            >
              <Suspense fallback={<MapLoadingFallback />}>
                <MapContainer
                  mapRef={mapRef}
                  onMapClick={() => {}}
                  selectedWeek={1}
                  isAddingPoint={isAddingPoint}
                  setIsAddingPoint={setIsAddingPoint}
                  addNewPoint={addNewPoint}
                  mapPoints={mapPoints.map(p => ({
                    id: p.id,
                    lat: p.latitude,
                    lng: p.longitude,
                    title: p.title,
                    note: p.note,
                    position: { lat: p.latitude, lng: p.longitude }
                  }))}
                  activeMapPoint={activeMapPoint}
                  setActiveMapPoint={setActiveMapPoint}
                  handleUpdatePoint={updateMapPoint}
                  deleteMapPoint={deleteMapPoint}
                  newPoint={newPoint}
                  handleSaveNewPoint={savePoint}
                  handleCancelNewPoint={() => savePoint('', '')}
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
              </Suspense>
            </div>
          </div>
          
          {/* Sidebar content */}
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
        </div>
      </main>
      
      {/* Bottom Navigation with SafeArea */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
