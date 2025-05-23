
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MapMarker } from '@/components/maps/types';

export function useMapPoints(
  mapPoints: MapMarker[], 
  setActiveMapPoint: (id: string | null) => void,
  addMapPoint: (point: { lat: number; lng: number; title: string; note: string }) => Promise<string>,
  updateMapPoint: (id: string, updates: { title?: string; note?: string }) => Promise<boolean>,
  deleteMapPoint: (id: string) => Promise<boolean>
) {
  // State for the new point being created
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  
  // State for tracking if we're currently in "add point" mode
  const [isAddingMapPoint, setIsAddingMapPoint] = useState(false);

  // Debug logging for isAddingMapPoint state changes
  useEffect(() => {
    console.log("🔄 useMapPoints - isAddingMapPoint state changed:", isAddingMapPoint);
  }, [isAddingMapPoint]);

  // Handler for map point click - CRITICAL FIX
  // We directly destructure lat,lng and use them immediately without any state updates
  const handleMapPointClick = useCallback(async (lat: number, lng: number): Promise<string> => {
    console.log("⭐ Map point click HANDLER executed at coordinates:", lat, lng);
    
    // CRITICAL FIX: Check if we're already in adding point mode BEFORE any state updates
    // This ensures the click is processed regardless of asynchronous state updates
    const currentlyAddingPoint = isAddingMapPoint;
    console.log("📊 Current adding point state at click time:", currentlyAddingPoint);
    
    // Guard clause - if not in adding point mode, exit early
    if (!currentlyAddingPoint) {
      console.log("❌ Not in adding point mode, ignoring click");
      return Promise.resolve(""); // Return empty string as we didn't add a point
    }
    
    // Create a new point and set it in state - CRITICAL FIX
    console.log("✅ Creating new point at", lat, lng);
    
    // IMPORTANT: Create the point object IMMEDIATELY after the click
    const pointData: MapMarker = {
      id: 'new',
      lat,
      lng,
      title: '',
      note: '',
      position: { lat, lng }
    };
    
    // Set the new point data to trigger popup
    setNewPoint(pointData);
    
    // IMPORTANT: Only reset adding state AFTER setting the new point
    // Use a small delay to ensure the point is created before turning off the mode
    // This is critical to avoid race conditions with the state
    setTimeout(() => {
      setIsAddingMapPoint(false);
      console.log("🔄 Reset isAddingMapPoint to false AFTER point creation");
    }, 50);
    
    toast.success("Punto posizionato. Inserisci titolo e nota.", {
      duration: 3000
    });

    // Return a temporary ID that will be replaced when the point is saved
    return Promise.resolve("new");
  }, [isAddingMapPoint]);

  // Handle save of new map point
  const handleSaveNewPoint = async (title: string, note: string) => {
    console.log("📝 Tentativo di salvare il nuovo punto con titolo:", title);
    
    if (!newPoint) {
      console.error("❌ Tentativo di salvare un punto inesistente");
      toast.error("Errore: punto non disponibile");
      return;
    }
    
    console.log("📝 Salvando nuovo punto:", {
      lat: newPoint.lat, 
      lng: newPoint.lng,
      title,
      note
    });
    
    try {
      // Call the API to save the point
      const pointId = await addMapPoint({
        lat: newPoint.lat,
        lng: newPoint.lng,
        title,
        note
      });
      
      console.log("✅ Punto salvato con successo, ID:", pointId);
      
      // Reset new point state
      setNewPoint(null);
      
      // Show success message
      toast.success("Punto di interesse salvato");
    } catch (error) {
      console.error("❌ Errore nel salvare il punto:", error);
      toast.error("Errore nel salvare il punto. Riprova.");
    }
  };

  // Handle update of existing map point
  const handleUpdatePoint = async (id: string, title: string, note: string): Promise<boolean> => {
    console.log("📝 Aggiornamento punto esistente:", id, title, note);
    
    try {
      const result = await updateMapPoint(id, { title, note });
      console.log("✅ Punto aggiornato con successo");
      setActiveMapPoint(null);
      toast.success("Punto di interesse aggiornato");
      return result;
    } catch (error) {
      console.error("❌ Errore nell'aggiornamento del punto:", error);
      toast.error("Errore nell'aggiornare il punto");
      return false;
    }
  };

  // Handle cancel of new point
  const handleCancelNewPoint = useCallback(() => {
    console.log("❌ Annullamento aggiunta nuovo punto");
    setNewPoint(null);
    toast.info('Aggiunta punto annullata');
  }, []);
  
  // Reset point creation mode
  const resetPointMode = useCallback(() => {
    setIsAddingMapPoint(false);
    setNewPoint(null);
  }, []);

  return {
    newPoint,
    setNewPoint,
    isAddingMapPoint,
    setIsAddingMapPoint,
    handleMapPointClick,
    handleSaveNewPoint,
    handleUpdatePoint,
    handleCancelNewPoint,
    resetPointMode
  };
}
