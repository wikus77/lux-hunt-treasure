
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapMarker } from "@/components/maps/types";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function useMapMarkersLogic() {
  const [storageMarkers, setStorageMarkers] = useLocalStorage<MapMarker[]>("map-markers", []);
  const [markers, setMarkers] = useState<MapMarker[]>(storageMarkers || []);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  // Sync markers with localStorage
  useEffect(() => {
    setStorageMarkers(markers);
  }, [markers, setStorageMarkers]);

  const handleAddMarker = () => {
    setIsAddingMarker(true);
    toast.info("Clicca sulla mappa per aggiungere un nuovo punto", {
      description: "Potrai aggiungere una nota al punto dopo averlo creato"
    });
  };

  const handleMapClickMarker = (e: google.maps.MapMouseEvent) => {
    if (isAddingMarker && e.latLng) {
      try {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const newMarker: MapMarker = {
          id: uuidv4(),
          lat, lng,
          title: "", // Add the title property
          note: "",
          position: { lat, lng },
          createdAt: new Date(),
        };
        setMarkers(prev => [...prev, newMarker]);
        setActiveMarker(newMarker.id);
        setIsAddingMarker(false);
        toast.success("Punto aggiunto alla mappa", {
          description: "Clicca sul punto per aggiungere una nota"
        });
      } catch (error) {
        console.error("Errore nell'aggiunta del marker:", error);
        setIsAddingMarker(false);
        toast.error("Si è verificato un errore durante l'aggiunta del punto");
      }
    }
  };

  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(markers.map(marker =>
      marker.id === id ? { ...marker, note, editing: false } : marker
    ));
    toast.success("Nota salvata");
  };

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    if (activeMarker === id) setActiveMarker(null);
    toast.success("Punto rimosso dalla mappa");
  };

  const editMarker = (id: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, editing: true } : marker
    ));
    setActiveMarker(id);
  };

  const clearAllMarkers = () => {
    if (confirm("Sei sicuro di voler eliminare tutti i punti?")) {
      setMarkers([]);
      setActiveMarker(null);
      toast.success("Tutti i punti sono stati rimossi");
    }
  };

  return {
    markers,
    setMarkers,
    activeMarker,
    setActiveMarker,
    isAddingMarker,
    setIsAddingMarker,
    handleAddMarker,
    handleMapClickMarker,
    saveMarkerNote,
    deleteMarker,
    editMarker,
    clearAllMarkers
  };
}
