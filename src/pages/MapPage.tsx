import React from 'react';
import SafeAreaWrapper from '@/components/layout/SafeAreaWrapper';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MapPageHeader from '@/components/map/MapPageHeader';
import MapContainer from '@/components/map/MapContainer';
import MapSidebar from '@/components/map/MapSidebar';
import { useNewMapPage } from '@/hooks/map/useNewMapPage';

const MapPage: React.FC = () => {
  const {
    // Map state
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
    activeMapPoint,
    setActiveMapPoint,
    
    // Search areas
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    toggleAddingSearchArea,
    setPendingRadius,
    
    // Point operations
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    
    // Other functions
    handleBuzz,
    requestLocationPermission,
  } = useNewMapPage();

  return (
    <SafeAreaWrapper>
      <div className="bg-gradient-to-b from-[#131524]/70 to-black w-full h-full overflow-hidden">
        {/* Header */}
        <MapPageHeader />
        
        {/* Main Content */}
        <main className="pt-safe-top pb-safe-bottom h-full overflow-hidden">
          <div className="container mx-auto px-4 h-full flex flex-col gap-4 pt-4">
            {/* Map Container */}
            <div className="flex-1 min-h-0">
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
              />
            </div>
            
            {/* Sidebar */}
            <div className="h-80 overflow-hidden">
              <MapSidebar
                mapPoints={mapPoints}
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
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    </SafeAreaWrapper>
  );
};

export default MapPage;
