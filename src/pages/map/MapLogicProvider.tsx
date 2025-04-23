
import React from "react";
import MapArea from "./MapArea";
import MapHeader from "./MapHeader";
import LoadingScreen from "./LoadingScreen";
import NotesSection from "./NotesSection";
import CluePopup from "./CluePopup";
import { useMapLogic } from "./useMapLogic";

const MapLogicProvider = () => {
  const {
    isLoading,
    mapReady,
    showCluePopup,
    clueMessage,
    markers,
    searchAreas,
    activeMarker,
    activeSearchArea,
    isAddingMarker,
    isAddingSearchArea,
    currentLocation,
    buzzMapPrice,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <CluePopup
        open={showCluePopup && mapReady}
        clueMessage={clueMessage}
        showBanner={true}
        onClose={() => setShowCluePopup(false)}
      />
    </div>
  );
};

export default MapLogicProvider;
