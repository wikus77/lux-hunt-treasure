
import React, { useEffect } from 'react';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import MapContainer from './map/MapContainer';
import MapPageHeader from './map/components/MapPageHeader';
import MapDebugger from './map/components/MapDebugger';
import { useNewMapPage } from '@/hooks/useNewMapPage';
import { BuzzActionButton } from '@/components/buzz/BuzzActionButton';
import { useBuzzStats } from '@/hooks/useBuzzStats';
import { useBuzzPricing } from '@/hooks/useBuzzPricing';
import { motion } from 'framer-motion';

const MapPage: React.FC = () => {
  const { stats, loading: buzzLoading, loadBuzzStats } = useBuzzStats();
  const { getCurrentBuzzPrice } = useBuzzPricing();
  
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

  
  const currentPrice = getCurrentBuzzPrice(stats?.today_count || 0);
  const isBlocked = false; // MAI BLOCCATO - ORDINE DIREZIONE

  const handleBuzzSuccess = async () => {
    // Force immediate stats reload
    setTimeout(async () => {
      await loadBuzzStats();
      console.log('🔄 Stats aggiornate post-BUZZ sulla mappa');
    }, 100);
  };

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
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden" style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
      }}>
        <MapPageHeader />
        
        <div 
          className="flex-1 relative w-full"
          style={{
            minHeight: '400px',
            height: 'calc(100dvh - 152px)',
            maxWidth: '100vw',
            overflow: 'hidden'
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

        {/* BUZZ Action Button Fixed Position - Top Right */}
        <div className="fixed top-24 right-4 z-40">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <BuzzActionButton
              currentPrice={currentPrice}
              isBlocked={isBlocked}
              todayCount={stats?.today_count || 0}
              onSuccess={handleBuzzSuccess}
            />
          </motion.div>
        </div>
      </div>

      {/* Debug component for development */}
      <MapDebugger />
    </SafeAreaWrapper>
  );
};

export default MapPage;
