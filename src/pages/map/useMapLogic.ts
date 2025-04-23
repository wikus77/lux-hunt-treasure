import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useUserCurrentLocation } from "./useUserCurrentLocation";
import { useMapMarkersLogic } from "./useMapMarkersLogic";
import { useSearchAreasLogic } from "./useSearchAreasLogic";

type UseMapLogicResult = {
  isLoading: boolean;
  mapReady: boolean;
  showCluePopup: boolean;
  clueMessage: string;
  location: ReturnType<typeof useLocation>;
  markers: ReturnType<typeof useMapMarkersLogic>["markers"];
  searchAreas: ReturnType<typeof useSearchAreasLogic>["searchAreas"];
  activeMarker: string | null;
  activeSearchArea: string | null;
  isAddingMarker: boolean;
  isAddingSearchArea: boolean;
  currentLocation: [number, number] | null;
  buzzMapPrice: number;
  setShowCluePopup: (o: boolean) => void;
  setClueMessage: (m: string) => void;
  setActiveMarker: (id: string | null) => void;
  setActiveSearchArea: (id: string | null) => void;
  handleMapReady: () => void;
  handleAddMarker: () => void;
  handleAddArea: () => void;
  handleMapClick: (e: google.maps.MapMouseEvent) => void;
  handleMapDoubleClick: (e: google.maps.MapMouseEvent) => void;
  saveMarkerNote: (id: string, note: string) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  deleteMarker: (id: string) => void;
  deleteSearchArea: (id: string) => void;
  editMarker: (id: string) => void;
  editSearchArea: (id: string) => void;
  clearAllMarkers: () => void;
  handleBuzz: () => void;
  handleHelp: () => void;
  generateSearchArea: () => void;
};

export const useMapLogic = (): UseMapLogicResult => {
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
    const timer = setTimeout(() => setIsLoading(false), 2000);
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

          if (location.state?.generateMapArea) {
            areaLogic.generateSearchArea();
            toast.success("Nuova area di ricerca generata!", {
              description: "Controlla la mappa per vedere la nuova area di ricerca."
            });
          }
        }, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, areaLogic, setClueMessage, setShowCluePopup]);

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
