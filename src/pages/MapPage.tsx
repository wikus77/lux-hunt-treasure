
import React, { useEffect } from 'react';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import MapContainer from './map/MapContainer';
import MapPageHeader from './map/components/MapPageHeader';
import MapDebugger from './map/components/MapDebugger';
import { useNewMapPage } from '@/hooks/useNewMapPage';

const MapPage: React.FC = () => {
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
    requestLocationPermission
  } = useNewMapPage();

  // Log mount for debugging
  useEffect(() => {
    console.log('🗺️ MapPage mounted successfully');
    console.log('🗺️ Current path:', window.location.pathname);
    console.log('🗺️ Capacitor detected:', !!(window as any).Capacitor);
    
    // Force scroll to top on iOS
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    
    return () => {
      console.log('🗺️ MapPage unmounting');
    };
  }, []);

  // iOS-specific viewport fix
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Prevent iOS zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }, []);

  return (
    <SafeAreaWrapper className="h-full bg-background">
      <div className="flex flex-col h-full overflow-hidden">
        <MapPageHeader />
        
        <div 
          className="flex-1 relative"
          style={{
            minHeight: '400px', // Ensure minimum height
            height: 'calc(100vh - 72px)' // Account for header
          }}
        >
          <MapContainer
            isAddingPoint={isAddingPoint}
            setIsAddingPoint={setIsAddingPoint}
            addNewPoint={addNewPoint}
            mapPoints={mapPoints}
            activeMapPoint={activeMapPoint}
            setActiveMapPoint={setActiveMapPoint}
            handleUpdatePoint={updateMapPoint}
            deleteMapPoint={deleteMapPoint}
            newPoint={newPoint}
            handleSaveNewPoint={savePoint}
            handleCancelNewPoint={() => {
              console.log('🗺️ Map point creation cancelled');
            }}
            handleBuzz={handleBuzz}
            isAddingSearchArea={isAddingSearchArea}
            handleMapClickArea={handleMapClickArea}
            searchAreas={searchAreas}
            setActiveSearchArea={setActiveSearchArea}
            deleteSearchArea={deleteSearchArea}
            setPendingRadius={setPendingRadius}
            requestLocationPermission={requestLocationPermission}
            toggleAddingSearchArea={toggleAddingSearchArea}
          />
        </div>
      </div>
      
      {/* Debug component for development */}
      <MapDebugger />
    </SafeAreaWrapper>
  );
};

export default MapPage;
