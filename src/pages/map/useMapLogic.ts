
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useUserCurrentLocation } from "./useUserCurrentLocation";
import { useMapMarkersLogic } from "./useMapMarkersLogic";
import { useSearchAreasLogic } from "./useSearchAreasLogic";

export const useMapLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showCluePopup, setShowCluePopup] = useState(false);
  const [clueMessage, setClueMessage] = useState("");
  const location = useLocation();
  const currentLocation = useUserCurrentLocation();

  // Marker management
  const markerLogic = useMapMarkersLogic();
  // Area management (pass currentLocation for clue generation)
  const areaLogic = useSearchAreasLogic(currentLocation);

  const buzzMapPrice = 1.99;

  useEffect(() => {
    // Riduzione del tempo di caricamento per test
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Payment/Clue popup side effect
    if (location.state?.paymentCompleted && location.state?.mapBuzz) {
      const clue = location.state?.clue;
      if (clue && clue.description) {
        setTimeout(() => {
          setClueMessage(clue.description);
          setShowCluePopup(true);

          if (location.state?.generateMapArea && currentLocation) {
            areaLogic.generateSearchArea();
            toast.success("Nuova area di ricerca generata!", {
              description: "Controlla la mappa per vedere la nuova area di ricerca."
            });
          }
        }, 1000);
      }
    }
  }, [location.state, areaLogic, currentLocation]);

  const handleMapReady = () => setMapReady(true);

  // Wire up click: delegate to marker or area logic as appropriate
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (markerLogic.isAddingMarker) {
      markerLogic.handleMapClickMarker(e);
      areaLogic.setIsAddingSearchArea(false);
    } else if (areaLogic.isAddingSearchArea) {
      areaLogic.handleMapClickArea(e);
      markerLogic.setIsAddingMarker(false);
    }
  }, [markerLogic, areaLogic]);

  const handleMapDoubleClick = (_e: google.maps.MapMouseEvent) => { /* No logic yet */ };

  const handleBuzz = () => {
    toast.info(`Buzz Mappa: ${buzzMapPrice.toFixed(2)}€`, {
      description: "Funzionalità attualmente in sviluppo."
    });
  };

  const handleHelp = () => {
    toast.info("Guida Mappa", {
      description: "Utilizza i pulsanti in alto per aggiungere punti e aree di ricerca sulla mappa."
    });
  };

  return {
    isLoading,
    mapReady,
    showCluePopup,
    clueMessage,
    location,
    markers: markerLogic.markers,
    searchAreas: areaLogic.searchAreas,
    activeMarker: markerLogic.activeMarker,
    activeSearchArea: areaLogic.activeSearchArea,
    isAddingMarker: markerLogic.isAddingMarker,
    isAddingSearchArea: areaLogic.isAddingSearchArea,
    currentLocation,
    buzzMapPrice,
    setShowCluePopup,
    setClueMessage,
    setActiveMarker: markerLogic.setActiveMarker,
    setActiveSearchArea: areaLogic.setActiveSearchArea,
    handleMapReady,
    handleAddMarker: markerLogic.handleAddMarker,
    handleAddArea: areaLogic.handleAddArea,
    handleMapClick,
    handleMapDoubleClick,
    saveMarkerNote: markerLogic.saveMarkerNote,
    saveSearchArea: areaLogic.saveSearchArea,
    deleteMarker: markerLogic.deleteMarker,
    deleteSearchArea: areaLogic.deleteSearchArea,
    editMarker: markerLogic.editMarker,
    editSearchArea: areaLogic.editSearchArea,
    clearAllMarkers: markerLogic.clearAllMarkers,
    handleBuzz,
    handleHelp,
    generateSearchArea: areaLogic.generateSearchArea,
  };
};
