
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useBuzzMapPricing } from './hooks/useBuzzMapPricing';

export const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

export const useMapLogic = () => {
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [searchAreas, setSearchAreas] = useState([]);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [activeSearchArea, setActiveSearchArea] = useState(null);
  const [pendingRadius, setPendingRadius] = useState<number | null>(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [activeMapPoint, setActiveMapPoint] = useState(null);
  const { buzzMapPrice } = useBuzzMapPricing();
  
  const addMapPoint = (point) => {
    setMapPoints(prev => [...prev, point]);
    return Promise.resolve(point.id);
  };

  const updateMapPoint = async (id: string, updates: { title?: string; note?: string }): Promise<boolean> => {
    setMapPoints(prev =>
      prev.map(point => (point.id === id ? { ...point, ...updates } : point))
    );
    return true; // Return boolean value to match expected type
  };

  const deleteMapPoint = async (id: string): Promise<boolean> => {
    setMapPoints(prev => prev.filter(point => point.id !== id));
    return true; // Return boolean value to match expected type
  };

  const toggleAddingMapPoint = () => {
    setIsAddingPoint(prev => !prev);
  };

  const requestLocationPermission = () => {
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
  };

  const handleAddArea = (area) => {
    setSearchAreas([...searchAreas, area]);
  };

  const handleMapClickArea = (e) => {
    if (isAddingSearchArea) {
      const { lat, lng } = e.latlng;
      if (pendingRadius !== null) {
        const newArea = {
          id: String(Date.now()),
          lat,
          lng,
          radius: pendingRadius,
        };
        handleAddArea(newArea);
        setPendingRadius(null);
        setIsAddingSearchArea(false);
        toast.success('Area di ricerca aggiunta!');
      } else {
        toast.error('Definisci prima il raggio di ricerca.'); // Changed from warn to error
      }
    }
  };

  const deleteSearchArea = async (id: string): Promise<boolean> => {
    setSearchAreas(prevAreas => prevAreas.filter(area => area.id !== id));
    return true;
  };

  const clearAllSearchAreas = () => {
    setSearchAreas([]);
    toast.success('Tutte le aree di ricerca sono state eliminate.');
  };

  const toggleAddingSearchArea = () => {
    setIsAddingSearchArea(prev => !prev);
  };

  // Handle BUZZ button press
  const handleBuzz = useCallback(() => {
    toast.info("Funzione BUZZ in arrivo presto!");
    // The price to use for the BUZZ action is now available as buzzMapPrice
  }, []);

  return {
    isAddingPoint,
    setIsAddingPoint,
    searchAreas,
    isAddingSearchArea,
    handleMapClickArea,
    setActiveSearchArea,
    deleteSearchArea,
    clearAllSearchAreas,
    handleAddArea,
    toggleAddingSearchArea,
    activeSearchArea,
    setPendingRadius,
    mapPoints,
    setMapPoints,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    toggleAddingMapPoint,
    requestLocationPermission,
    buzzMapPrice,
    handleBuzz,
  };
};
