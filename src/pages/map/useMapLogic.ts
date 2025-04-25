
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useUserCurrentLocation } from "./useUserCurrentLocation";
import { useMapMarkersLogic } from "./useMapMarkersLogic";
import { useSearchAreasLogic } from "./useSearchAreasLogic";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";

export const useMapLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showCluePopup, setShowCluePopup] = useState(false);
  const [clueMessage, setClueMessage] = useState("");
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isMapBuzzActive, setIsMapBuzzActive] = useState(false);
  const [processedSessionIds, setProcessedSessionIds] = useState<Set<string>>(new Set());
  
  const location = useLocation();
  const currentLocation = useUserCurrentLocation();
  const { unlockedClues, incrementUnlockedCluesAndAddClue, getNextVagueClue } = useBuzzClues();
  const { addNotification } = useNotifications();

  // Marker management
  const markerLogic = useMapMarkersLogic();
  // Area management (pass currentLocation for clue generation)
  const areaLogic = useSearchAreasLogic(currentLocation);

  // Dynamic pricing based on unlocked clues
  const calculateBuzzMapPrice = useCallback(() => {
    if (unlockedClues >= 0 && unlockedClues <= 10) return 4.99;
    if (unlockedClues <= 15) return 4.99 * 1.2; // +20%
    if (unlockedClues <= 20) return 4.99 * 1.2 * 1.2; // +20% again
    if (unlockedClues <= 25) return 4.99 * 1.2 * 1.2 * 1.2;
    if (unlockedClues <= 30) return 4.99 * 1.2 * 1.2 * 1.2 * 1.2;
    if (unlockedClues <= 35) return 4.99 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2;
    if (unlockedClues <= 40) return 4.99 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2;
    return 4.99 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2 * 1.2; // Maximum price
  }, [unlockedClues]);

  // Calculate search area radius based on unlocked clues
  const calculateSearchAreaRadius = useCallback(() => {
    let radius = 300000; // 300km - Base radius
    
    // Apply 5% reduction for each tier above the first
    if (unlockedClues > 10 && unlockedClues <= 15) radius *= 0.95;
    if (unlockedClues > 15 && unlockedClues <= 20) radius *= 0.95 * 0.95;
    if (unlockedClues > 20 && unlockedClues <= 25) radius *= 0.95 * 0.95 * 0.95;
    if (unlockedClues > 25 && unlockedClues <= 30) radius *= 0.95 * 0.95 * 0.95 * 0.95;
    if (unlockedClues > 30 && unlockedClues <= 35) radius *= 0.95 * 0.95 * 0.95 * 0.95 * 0.95;
    if (unlockedClues > 35 && unlockedClues <= 40) radius *= 0.95 * 0.95 * 0.95 * 0.95 * 0.95 * 0.95;
    if (unlockedClues > 40) radius *= 0.95 * 0.95 * 0.95 * 0.95 * 0.95 * 0.95 * 0.95;
    
    // Ensure minimum radius of 5km
    return Math.max(radius, 5000); // 5km minimum
  }, [unlockedClues]);

  const buzzMapPrice = calculateBuzzMapPrice();

  useEffect(() => {
    try {
      // Tempo di caricamento breve per test
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("Errore durante il caricamento:", e);
      setIsLoading(false);
      setLoadError(e instanceof Error ? e : new Error("Errore sconosciuto"));
    }
  }, []);

  useEffect(() => {
    try {
      // Payment/Clue popup side effect - Fix to prevent duplicate notifications and ensure area generation
      if (
        location.state?.paymentCompleted && 
        location.state?.mapBuzz &&
        location.state?.sessionId && 
        !processedSessionIds.has(location.state.sessionId)
      ) {
        // Mark this session as processed to prevent duplicates
        setProcessedSessionIds(prev => new Set(prev).add(location.state.sessionId));
        
        const clue = location.state?.clue;
        
        // Increment the unlocked clues counter if not already done (only once)
        incrementUnlockedCluesAndAddClue();
        
        if (clue && clue.description) {
          setTimeout(() => {
            setClueMessage(clue.description);
            setShowCluePopup(true);

            // Add notification for the clue (once)
            addNotification({
              title: "Nuovo indizio sbloccato",
              description: clue.description,
            });

            // Generate search area based on available clues
            const radius = calculateSearchAreaRadius();
            console.log(`Generating search area with radius: ${radius/1000}km`);
            
            const generatedAreaId = areaLogic.generateSearchArea(radius);
            
            if (generatedAreaId) {
              // Center map on the new area and show a notification
              toast.success("Area di ricerca generata!", {
                description: "Controlla la mappa per vedere la nuova area basata sugli indizi disponibili."
              });
              
              // Set the generated area as active after a short delay
              setTimeout(() => {
                areaLogic.setActiveSearchArea(generatedAreaId);
              }, 2000);
            }
          }, 1000);
        }
      }
    } catch (e) {
      console.error("Errore nell'elaborazione dello stato:", e);
    }
  }, [location.state, areaLogic, incrementUnlockedCluesAndAddClue, addNotification, calculateSearchAreaRadius, processedSessionIds]);

  const handleMapReady = () => {
    try {
      setMapReady(true);
      console.log("Mappa pronta e caricata correttamente");
    } catch (e) {
      console.error("Errore nel segnare la mappa come pronta:", e);
    }
  };

  // Wire up click: delegate to marker or area logic as appropriate
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    try {
      if (markerLogic.isAddingMarker) {
        markerLogic.handleMapClickMarker(e);
        areaLogic.setIsAddingSearchArea(false);
      } else if (areaLogic.isAddingSearchArea) {
        areaLogic.handleMapClickArea(e);
        markerLogic.setIsAddingMarker(false);
      }
    } catch (error) {
      console.error("Errore nel gestire il click sulla mappa:", error);
      toast.error("Si è verificato un errore nel processare il click");
      markerLogic.setIsAddingMarker(false);
      areaLogic.setIsAddingSearchArea(false);
    }
  }, [markerLogic, areaLogic]);

  const handleMapDoubleClick = (_e: google.maps.MapMouseEvent) => { /* No logic yet */ };

  const handleBuzz = () => {
    // Create a unique session ID for this payment flow
    const sessionId = `map_buzz_${Date.now()}`;
    
    // Direct redirect to payment page with the correct state
    const price = buzzMapPrice.toFixed(2);
    const nextClue = getNextVagueClue();
    
    // Pass sessionId to track this payment flow and prevent duplicates
    window.location.href = `/payment-methods?from=map&price=${price}&session=${sessionId}`;
    
    // The rest is handled by the payment page and the useEffect above when returning
    setIsMapBuzzActive(true);
  };

  const handleHelp = () => {
    toast.info("Guida Mappa", {
      description: "Utilizza i pulsanti in alto per aggiungere punti e aree di ricerca sulla mappa. Il Buzz Mappa ti aiuta a restringere l'area di ricerca basandosi sugli indizi disponibili."
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
    isMapBuzzActive,
    loadError,
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
    calculateSearchAreaRadius,
  };
};
