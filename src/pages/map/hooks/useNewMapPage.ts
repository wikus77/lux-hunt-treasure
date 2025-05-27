
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useMapState } from '@/hooks/map/useMapState';
import { useMapEvents } from '@/hooks/map/useMapEvents';

export const useNewMapPage = () => {
  // Use the extracted state hook
  const {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    setMapPoints,
    newPoint,
    setNewPoint,
    isLoading,
    activeMapPoint,
    setActiveMapPoint,
    DEFAULT_LOCATION,
    user
  } = useMapState();

  const buzzMapPrice = 1.99;

  // Integra la logica BUZZ MAPPA
  const { 
    currentWeekAreas, 
    isGenerating: isBuzzGenerating,
    generateBuzzMapArea,
    getActiveArea,
    calculateBuzzMapPrice
  } = useBuzzMapLogic();

  // Initialize search areas logic
  const { 
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    setPendingRadius
  } = useSearchAreasLogic(DEFAULT_LOCATION);

  // Use the extracted events hook
  const {
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    requestLocationPermission
  } = useMapEvents({
    user,
    mapPoints,
    setMapPoints,
    newPoint,
    setNewPoint,
    setActiveMapPoint,
    isAddingSearchArea,
    toggleAddingSearchArea
  });

  // Handle BUZZ button click - Updated for BUZZ MAPPA con messaggi allineati
  const handleBuzz = useCallback(() => {
    const activeArea = getActiveArea();
    if (activeArea) {
      // MESSAGGIO ALLINEATO: usa il valore ESATTO salvato in Supabase
      toast.success(`Area BUZZ MAPPA attiva: ${activeArea.radius_km.toFixed(1)} km`, {
        description: "L'area è già visibile sulla mappa"
      });
      console.log('📏 Messaggio popup con raggio ESATTO da Supabase:', activeArea.radius_km.toFixed(1), 'km');
    } else {
      toast.info("Premi BUZZ MAPPA per generare una nuova area di ricerca!");
    }
  }, [getActiveArea]);

  return {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
    isLoading,
    activeMapPoint,
    setActiveMapPoint,
    buzzMapPrice: calculateBuzzMapPrice(),
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
    // Nuove proprietà BUZZ MAPPA
    currentWeekAreas,
    isBuzzGenerating,
    getActiveArea
  };
};
