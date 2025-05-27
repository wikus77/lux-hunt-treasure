
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useMapPointsState } from '@/hooks/map/useMapPointsState';
import { useMapPointsOperations } from '@/hooks/map/useMapPointsOperations';
import { useBuzzHandling } from '@/hooks/map/useBuzzHandling';

export const useNewMapPage = () => {
  const { user } = useAuth();
  
  // Default location (Rome, Italy)
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  // Map points state and operations
  const {
    mapPoints,
    setMapPoints,
    newPoint,
    setNewPoint,
    isLoading,
    activeMapPoint,
    setActiveMapPoint,
    addNewPoint
  } = useMapPointsState(user?.id);

  const {
    savePoint: savePointOperation,
    updateMapPoint: updateMapPointOperation,
    deleteMapPoint: deleteMapPointOperation
  } = useMapPointsOperations(user?.id);

  // BUZZ handling
  const { handleBuzz, buzzMapPrice, getActiveArea } = useBuzzHandling();

  // Integra la logica BUZZ MAPPA
  const { 
    currentWeekAreas, 
    isGenerating: isBuzzGenerating
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

  // Point operations with state management
  const savePoint = useCallback(async (title: string, note: string) => {
    const savedPoint = await savePointOperation(newPoint, title, note);
    if (savedPoint) {
      setMapPoints(prev => [...prev, savedPoint]);
      setNewPoint(null);
    }
  }, [newPoint, savePointOperation, setMapPoints, setNewPoint]);

  const updateMapPoint = useCallback(async (id: string, title: string, note: string): Promise<boolean> => {
    const success = await updateMapPointOperation(id, title, note);
    if (success) {
      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title, note } : point
      ));
      setActiveMapPoint(null);
    }
    return success;
  }, [updateMapPointOperation, setMapPoints, setActiveMapPoint]);

  const deleteMapPoint = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteMapPointOperation(id);
    if (success) {
      setMapPoints(prev => prev.filter(point => point.id !== id));
      setActiveMapPoint(null);
    }
    return success;
  }, [deleteMapPointOperation, setMapPoints, setActiveMapPoint]);

  // Enhanced addNewPoint with search area toggle
  const enhancedAddNewPoint = useCallback((lat: number, lng: number) => {
    addNewPoint(lat, lng);
    
    // Reset search area adding mode if active
    if (isAddingSearchArea) {
      toggleAddingSearchArea();
    }
  }, [addNewPoint, isAddingSearchArea, toggleAddingSearchArea]);

  // Request user location
  const requestLocationPermission = useCallback(() => {
    if (navigator.geolocation) {
      toast.info("Rilevamento posizione in corso...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Here you would update the map center
          toast.success("Posizione rilevata");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Errore nel rilevare la posizione");
        }
      );
    } else {
      toast.error("Geolocalizzazione non supportata dal browser");
    }
  }, []);

  return {
    isAddingPoint: false, // Will be managed by parent component
    setIsAddingPoint: () => {}, // Will be managed by parent component
    mapPoints,
    newPoint,
    isLoading,
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
    addNewPoint: enhancedAddNewPoint,
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
