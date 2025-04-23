
import React, { useEffect } from "react";
import MapHeader from "./MapHeader";
import LoadingScreen from "./LoadingScreen";
import NotesSection from "./NotesSection";
import { useMapLogic } from "./useMapLogic";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import MapContainer from "./components/MapContainer";
import MapNotifications from "./components/MapNotifications";
import BuzzSection from "./components/BuzzSection";

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
    location,
  } = useMapLogic();

  const { unlockedClues } = useBuzzClues();
  
  useEffect(() => {
    if (location?.state?.paymentCompleted && location?.state?.mapBuzz) {
      console.log("Pagamento BuzzMap completato, generando area di ricerca...");
    }
  }, [location?.state]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen w-full p-4 flex flex-col gap-4">
      <MapHeader 
        onAddMarker={handleAddMarker}
        onAddArea={handleAddArea}
        onHelp={handleHelp}
        onBuzz={handleBuzz}
        isAddingMarker={isAddingMarker}
        isAddingArea={isAddingSearchArea}
        buzzMapPrice={buzzMapPrice}
      />

      <MapNotifications 
        showCluePopup={showCluePopup}
        clueMessage={clueMessage}
        activeSearchArea={activeSearchArea}
        searchAreas={searchAreas}
        onCloseClue={() => setShowCluePopup(false)}
        onCloseArea={() => setActiveSearchArea(null)}
      />

      <MapContainer 
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

      <BuzzSection 
        onBuzzClick={handleBuzz}
        unlockedClues={unlockedClues}
      />

      <div className="w-full bg-black/50 rounded-xl p-4 border border-projectx-deep-blue/40 shadow-xl">
        <NotesSection />
      </div>
    </div>
  );
};

export default MapLogicProvider;
