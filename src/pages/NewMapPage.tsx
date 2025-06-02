
import React, { useState, lazy, Suspense } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MapPageHeader from './map/components/MapPageHeader';
import NotesSection from './map/NotesSection';
import SidebarLayout from './map/components/SidebarLayout';
import RightSidebarContent from './map/components/RightSidebarContent';
import { Spinner } from '@/components/ui/spinner';
import { useNewMapPage } from './map/hooks/useNewMapPage';

// Lazy load heavy map components
const MapContainer = lazy(() => import('./map/components/MapContainer'));

const MapLoadingFallback = () => (
  <div className="h-96 bg-gray-900/50 rounded-lg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" className="text-[#00D1FF]" />
      <p className="text-gray-400">Caricamento mappa...</p>
    </div>
  </div>
);

const NewMapPage = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
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

  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          backgroundColor: 'rgba(19, 21, 36, 0.7)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <MapPageHeader />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto px-4 pt-4 pb-2 max-w-6xl">
          <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
            {/* Map container with lazy loading */}
            <Suspense fallback={<MapLoadingFallback />}>
              <MapContainer
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
                handleCancelNewPoint={() => {
                  savePoint('', '');
                }}
                handleBuzz={handleBuzz}
                requestLocationPermission={requestLocationPermission}
                // Search area props
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
          
          {/* Split into two columns using the SidebarLayout component */}
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
                clearAllSearchAreas={clearAllSearchAreas}
                handleAddArea={handleAddArea}
                isAddingSearchArea={isAddingSearchArea}
                deleteSearchArea={deleteSearchArea}
              />
            }
          />
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default NewMapPage;
