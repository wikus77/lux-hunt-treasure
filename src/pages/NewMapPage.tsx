
import React, { useState } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MapContainer from './map/components/MapContainer';
import MapPageHeader from './map/components/MapPageHeader';
import NotesSection from './map/NotesSection';
import SidebarLayout from './map/components/SidebarLayout';
import RightSidebarContent from './map/components/RightSidebarContent';
import { useNewMapPage } from './map/hooks/useNewMapPage';

const NewMapPage = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
    activeMapPoint,
    setActiveMapPoint,
    buzzMapPrice,
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
    <div className="flex flex-col h-full bg-background">
      <MapPageHeader />
      
      {/* Main content with proper spacing */}
      <div className="container mx-auto px-4 pt-20 pb-2 max-w-6xl">
        <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
          {/* Map container */}
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
              position: { lat: p.latitude, lng: p.longitude } // Add position property
            }))}
            activeMapPoint={activeMapPoint}
            setActiveMapPoint={setActiveMapPoint}
            handleUpdatePoint={updateMapPoint}
            deleteMapPoint={deleteMapPoint}
            newPoint={newPoint}
            handleSaveNewPoint={savePoint}
            handleCancelNewPoint={() => {
              // Directly calling the hook function without an extra setNewPoint reference
              // This will replace the need for the missing setNewPoint
              savePoint('', '');
            }}
            buzzMapPrice={buzzMapPrice}
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
                position: { lat: p.latitude, lng: p.longitude } // Add position property
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
            />
          }
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default NewMapPage;
