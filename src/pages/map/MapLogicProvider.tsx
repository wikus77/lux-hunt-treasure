
import React from "react";
import MapArea from "./MapArea";
import MapHeader from "./MapHeader";
import LoadingScreen from "./LoadingScreen";
import NotesSection from "./NotesSection";
import { useMapLogic } from "./useMapLogic";
import CluePopup from "./CluePopup";
import BuzzMapBanner from "@/components/buzz/BuzzMapBanner";

const MapLogicProvider = () => {
  const {
    isLoading,
    markers,
    searchAreas,
    activeMarker,
    activeSearchArea,
    isAddingMarker,
    isAddingSearchArea,
    currentLocation,
    buzzMapPrice,
    showCluePopup,
    clueMessage,
    setShowCluePopup,
    setActiveMarker,
    setActiveSearchArea,
    handleMapReady,
    handleAddMarker,
    handleAddArea,
    handleHelp,
    handleBuzz,
    handleMapClick,
    handleMapDoubleClick,
    saveMarkerNote,
    saveSearchArea,
    editMarker,
    editSearchArea,
    deleteMarker,
    deleteSearchArea,
    clearAllMarkers,
  } = useMapLogic();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-screen w-full p-4">
      <MapHeader 
        onAddMarker={handleAddMarker}
        onAddArea={handleAddArea}
        onHelp={handleHelp}
        onBuzz={handleBuzz}
        isAddingMarker={isAddingMarker}
        isAddingArea={isAddingSearchArea}
        buzzMapPrice={buzzMapPrice}
      />
      
      {/* Notification Area - Only one popup shows at a time */}
      {showCluePopup ? (
        <CluePopup 
          open={showCluePopup} 
          clueMessage={clueMessage} 
          showBanner={false} 
          onClose={() => setShowCluePopup(false)}
        />
      ) : (
        <BuzzMapBanner 
          open={!!activeSearchArea} 
          area={activeSearchArea ? {
            lat: searchAreas.find(a => a.id === activeSearchArea)?.lat || 0,
            lng: searchAreas.find(a => a.id === activeSearchArea)?.lng || 0,
            radius: searchAreas.find(a => a.id === activeSearchArea)?.radius || 0,
            label: searchAreas.find(a => a.id === activeSearchArea)?.label || '',
            confidence: 'Alta'
          } : null} 
          onClose={() => setActiveSearchArea(null)}
        />
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="col-span-1 md:col-span-2">
          <MapArea 
            onMapReady={handleMapReady}
            markers={markers}
            searchAreas={searchAreas}
            isAddingMarker={isAddingMarker}
            isAddingSearchArea={isAddingSearchArea}
            activeMarker={activeMarker}
            activeSearchArea={activeSearchArea}
            onMapClick={handleMapClick}
            onMapDoubleClick={handleMapDoubleClick}
            setActiveMarker={setActiveMarker}
            setActiveSearchArea={setActiveSearchArea}
            saveMarkerNote={saveMarkerNote}
            saveSearchArea={saveSearchArea}
            editMarker={editMarker}
            editSearchArea={editSearchArea}
            deleteMarker={deleteMarker}
            deleteSearchArea={deleteSearchArea}
            currentLocation={currentLocation}
          />
        </div>
        <div className="col-span-1 bg-black/50 rounded-xl p-4 border border-projectx-deep-blue/40 shadow-xl">
          <NotesSection 
            markers={markers} 
            setActiveMarker={setActiveMarker} 
            clearAllMarkers={clearAllMarkers}
          />
        </div>
      </div>
    </div>
  );
};

export default MapLogicProvider;
