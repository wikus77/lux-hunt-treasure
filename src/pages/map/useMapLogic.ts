import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useUserCurrentLocation } from "./useUserCurrentLocation";
import { useMapMarkersLogic } from "./useMapMarkersLogic";
import { useSearchAreasLogic } from "./useSearchAreasLogic";
import { usePricingLogic } from "./hooks/usePricingLogic";
import { usePaymentEffects } from "./hooks/usePaymentEffects";
import { useMapInteractions } from "./hooks/useMapInteractions";

export const useMapLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  const location = useLocation();
  const currentLocation = useUserCurrentLocation();
  const { getNextVagueClue } = useBuzzClues();

  // Hook composition
  const markerLogic = useMapMarkersLogic();
  const areaLogic = useSearchAreasLogic(currentLocation);
  const { buzzMapPrice, calculateSearchAreaRadius } = usePricingLogic();
  const mapInteractions = useMapInteractions(markerLogic, areaLogic);
  
  const paymentEffects = usePaymentEffects((radius?: number) => 
    areaLogic.generateSearchArea(radius || calculateSearchAreaRadius())
  );

  const handleMapReady = () => {
    try {
      setMapReady(true);
      console.log("Mappa pronta e caricata correttamente");
    } catch (e) {
      console.error("Errore nel segnare la mappa come pronta:", e);
    }
  };

  const handleBuzz = () => {
    const sessionId = `map_buzz_${Date.now()}`;
    const price = buzzMapPrice.toFixed(2);
    
    window.location.href = `/payment-methods?from=map&price=${price}&session=${sessionId}`;
    paymentEffects.setIsMapBuzzActive(true);
  };

  // Initial loading effect
  useState(() => {
    try {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("Errore durante il caricamento:", e);
      setIsLoading(false);
      setLoadError(e instanceof Error ? e : new Error("Errore sconosciuto"));
    }
  });

  return {
    // State
    isLoading,
    mapReady,
    loadError,
    location,
    currentLocation,
    buzzMapPrice,
    
    // Marker Logic
    markers: markerLogic.markers,
    activeMarker: markerLogic.activeMarker,
    isAddingMarker: markerLogic.isAddingMarker,
    setActiveMarker: markerLogic.setActiveMarker,
    handleAddMarker: markerLogic.handleAddMarker,
    saveMarkerNote: markerLogic.saveMarkerNote,
    deleteMarker: markerLogic.deleteMarker,
    editMarker: markerLogic.editMarker,
    clearAllMarkers: markerLogic.clearAllMarkers,

    // Search Areas Logic
    searchAreas: areaLogic.searchAreas,
    activeSearchArea: areaLogic.activeSearchArea,
    isAddingSearchArea: areaLogic.isAddingSearchArea,
    setActiveSearchArea: areaLogic.setActiveSearchArea,
    handleAddArea: areaLogic.handleAddArea,
    saveSearchArea: areaLogic.saveSearchArea,
    deleteSearchArea: areaLogic.deleteSearchArea,
    editSearchArea: areaLogic.editSearchArea,
    generateSearchArea: areaLogic.generateSearchArea,

    // Payment Effects
    ...paymentEffects,

    // Map Interactions
    ...mapInteractions,

    // Map Ready Handler
    handleMapReady,
    handleBuzz,
    calculateSearchAreaRadius,
  };
};
