// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React, { useEffect } from 'react';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import MapContainer from './map/MapContainer';
import { M1UnitsPill } from '@/components/m1units/M1UnitsPill';
import MapDebugger from './map/components/MapDebugger';
import { useNewMapPage } from '@/hooks/useNewMapPage';
import { MapStateProvider } from './map/MapStateProvider';
import MapErrorBoundary from './map/MapErrorBoundary';
import { BuzzMapRewardHandler } from '@/components/buzz/BuzzMapRewardHandler';

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
      {/* Handler per riscatto premi gratuiti */}
      <BuzzMapRewardHandler />
      
      <div className="flex flex-col h-[100dvh] w/full overflow-hidden" style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
      }}>
        
        <MapErrorBoundary>
          <MapStateProvider>
            <div 
              className="flex-1 relative w-full"
              style={{
                minHeight: '400px',
                height: 'calc(100dvh - 152px)',
                maxWidth: '100vw',
                overflow: 'hidden'
              }}
            >
              {/* M1U Pill Slot - Map (Compact, replacing grey rectangle) */}
              <div 
                id="m1u-pill-map-slot" 
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2"
                style={{
                  pointerEvents: 'auto'
                }}
              >
                <M1UnitsPill showLabel={false} showPlusButton />
              </div>

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
          </MapStateProvider>
        </MapErrorBoundary>
      </div>

      {/* Debug component for development */}
      <MapDebugger />
    </SafeAreaWrapper>
  );
};

export default MapPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
