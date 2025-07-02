
import React from 'react';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import MapContainer from './map/MapContainer';
import MapPageHeader from './map/components/MapPageHeader';
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

  return (
    <SafeAreaWrapper className="h-full bg-background">
      <div className="flex flex-col h-full">
        <MapPageHeader />
        
        <div className="flex-1 relative">
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
            handleCancelNewPoint={() => {}}
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
    </SafeAreaWrapper>
  );
};

export default MapPage;
