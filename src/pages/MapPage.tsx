// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React, { useEffect } from 'react';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import MapContainer from '@/components/map/MapContainer';
import MapPageHeader from './map/components/MapPageHeader';
import MapDebugger from './map/components/MapDebugger';
import MapDebugInfo from '@/components/debug/MapDebugInfo';
import { useNewMapPage } from '@/hooks/useNewMapPage';
import { MapStateProvider } from './map/MapStateProvider';
import MapErrorBoundary from './map/MapErrorBoundary';

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

  // Clear any previous mount state
  useEffect(() => {
    try { delete (window as any).__M1_MAP_MOUNTED__; } catch {}
  }, []);

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
      {/* PROFESSIONAL: Full screen layout with proper container hierarchy */}
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden relative">
        <MapPageHeader />
        
        {/* CRITICAL: Map container with proper boundaries and container structure */}
        <div 
          className="flex-1 relative w-full border border-muted/20 rounded-lg overflow-hidden bg-muted/10"
          style={{
            height: 'calc(100dvh - 60px - 80px)', // Header + BottomNav
            minHeight: '400px',
            margin: '8px'
          }}
        >
          <MapErrorBoundary>
            <MapStateProvider>
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
            </MapStateProvider>
          </MapErrorBoundary>
        </div>
      </div>

      {/* Debug components for development */}
      <MapDebugger />
      <MapDebugInfo />
    </SafeAreaWrapper>
  );
};

export default MapPage;