
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MapMarker } from '@/components/maps/types';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

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

  // Handler for map point click - IMPROVED
  const handleMapPointClick = useCallback(async (lat: number, lng: number): Promise<string> => {
    console.log("⭐ Map point click HANDLER executed at coordinates:", lat, lng);
    
    const currentlyAddingPoint = isAddingMapPoint;
    console.log("📊 Current adding point state at click time:", currentlyAddingPoint);
    
    // Guard clause - if not in adding point mode, exit early
    if (!currentlyAddingPoint) {
      console.log("❌ Not in adding point mode, ignoring click");
      return Promise.resolve(""); // Return empty string as we didn't add a point
    }
    
    // Create a new point and set it in state - IMPROVED
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

  // FIXED: Handle save of new map point con validazione completa
  const handleSaveNewPoint = async (title: string, note: string) => {
    console.log("📝 Tentativo di salvare il nuovo punto con titolo:", title);
    
    if (!newPoint) {
      console.error("❌ Tentativo di salvare un punto inesistente");
      toast.error("Errore: punto non disponibile");
      return;
    }
    
    // FIXED: Validazione rigorosa con trim
    const trimmedTitle = title?.trim() || '';
    const trimmedNote = note?.trim() || '';
    
    if (!trimmedTitle) {
      console.log("❌ Validation failed: empty title after trim");
      toast.error("Il titolo è obbligatorio");
      return;
    }
    
    console.log("📝 Salvando nuovo punto:", {
      lat: newPoint.lat, 
      lng: newPoint.lng,
      title: trimmedTitle,
      note: trimmedNote
    });
    
    try {
      // Call the API to save the point with trimmed values
      const pointId = await addMapPoint({
        lat: newPoint.lat,
        lng: newPoint.lng,
        title: trimmedTitle,
        note: trimmedNote
      });
      
      console.log("✅ Punto salvato con successo, ID:", pointId);
      
      // Reset new point state
      setNewPoint(null);
      
      // Show success message
      toast.success("Punto di interesse salvato");
    } catch (error) {
      console.error("❌ Errore nel salvare il punto:", error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast.error(`Errore nel salvare il punto: ${errorMessage}`);
    }
  };

  // FIXED: Handle update of existing map point con validazione
  const handleUpdatePoint = async (id: string, title: string, note: string): Promise<boolean> => {
    console.log("📝 Aggiornamento punto esistente:", id, title, note);
    
    // FIXED: Validazione con trim
    const trimmedTitle = title?.trim() || '';
    const trimmedNote = note?.trim() || '';
    
    if (!trimmedTitle) {
      console.log("❌ Validation failed: empty title after trim");
      toast.error("Il titolo è obbligatorio");
      return false;
    }
    
    try {
      const result = await updateMapPoint(id, { title: trimmedTitle, note: trimmedNote });
      if (result) {
        console.log("✅ Punto aggiornato con successo");
        setActiveMapPoint(null);
        toast.success("Punto di interesse aggiornato");
      }
      return result;
    } catch (error) {
      console.error("❌ Errore nell'aggiornamento del punto:", error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast.error(`Errore nell'aggiornare il punto: ${errorMessage}`);
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
