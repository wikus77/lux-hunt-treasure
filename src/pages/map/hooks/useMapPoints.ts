
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MapMarker } from '@/components/maps/types';

export function useMapPoints(
  mapPoints: MapMarker[], 
  setActiveMapPoint: (id: string | null) => void,
  addMapPoint: (point: { lat: number; lng: number; title: string; note: string }) => Promise<string | null>,
  updateMapPoint: (id: string, updates: { title?: string; note?: string }) => Promise<boolean>,
  deleteMapPoint: (id: string) => Promise<boolean>
) {
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  const [isAddingNewPoint, setIsAddingNewPoint] = useState(false);

  // Debug logging for isAddingNewPoint state changes
  useEffect(() => {
    console.log("🔁 useMapPoints - isAddingNewPoint state:", isAddingNewPoint);
  }, [isAddingNewPoint]);

  // Handle map point click when adding a new point
  const handleMapPointClick = (lat: number, lng: number) => {
    console.log("Map point click detected at:", lat, lng);
    console.log("isAddingNewPoint state at click time:", isAddingNewPoint);
    
    if (!isAddingNewPoint) {
      console.log("Not in adding point mode, ignoring click");
      return;
    }
    
    // Create a new point and set it in state
    setNewPoint({
      id: 'new',
      lat,
      lng,
      title: '',
      note: '',
      position: { lat, lng }
    });
    
    // Reset the adding state after successful point creation
    setIsAddingNewPoint(false);
    
    toast.success("Punto posizionato. Inserisci titolo e nota.", {
      duration: 3000
    });
  };

  // Handle save of new map point
  const handleSaveNewPoint = async (title: string, note: string) => {
    console.log("Tentativo di salvare il nuovo punto con titolo:", title);
    if (newPoint) {
      console.log("Salvando nuovo punto con titolo:", title, "e coordinate:", newPoint.lat, newPoint.lng);
      try {
        const pointId = await addMapPoint({
          lat: newPoint.lat,
          lng: newPoint.lng,
          title,
          note
        });
        console.log("Punto salvato con successo, ID:", pointId);
        setNewPoint(null);
        toast.success("Punto di interesse salvato");
      } catch (error) {
        console.error("Errore nel salvare il punto:", error);
        toast.error("Errore nel salvare il punto. Riprova.");
      }
    } else {
      console.error("Tentativo di salvare un punto inesistente");
      toast.error("Errore: punto non disponibile");
    }
  };

  // Handle update of existing map point
  const handleUpdatePoint = async (id: string, title: string, note: string) => {
    console.log("Aggiornamento punto esistente:", id, title, note);
    try {
      const success = await updateMapPoint(id, { title, note });
      if (success) {
        console.log("Punto aggiornato con successo");
        setActiveMapPoint(null);
        toast.success("Punto di interesse aggiornato");
      } else {
        console.error("Errore nell'aggiornare il punto");
        toast.error("Errore nell'aggiornare il punto");
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento del punto:", error);
      toast.error("Errore nell'aggiornare il punto");
    }
  };

  // Handle cancel of new point
  const handleCancelNewPoint = () => {
    console.log("Annullamento aggiunta nuovo punto");
    setNewPoint(null);
    toast.info('Aggiunta punto annullata');
  };

  return {
    newPoint,
    setNewPoint,
    isAddingMapPoint: isAddingNewPoint,
    setIsAddingMapPoint: setIsAddingNewPoint,
    handleMapPointClick,
    handleSaveNewPoint,
    handleUpdatePoint,
    handleCancelNewPoint
  };
}
