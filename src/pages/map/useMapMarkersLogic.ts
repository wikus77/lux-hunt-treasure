
import { useState } from "react";
import { toast } from "sonner";
import { MapMarker } from "@/components/maps/MapMarkers";
import { v4 as uuidv4 } from "uuid";

export function useMapMarkersLogic() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  const handleAddMarker = () => {
    setIsAddingMarker(true);
    toast.info("Clicca sulla mappa per aggiungere un nuovo punto");
  };

  const handleMapClickMarker = (e: google.maps.MapMouseEvent) => {
    if (isAddingMarker && e.latLng) {
      try {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const newMarker: MapMarker = {
          id: uuidv4(),
          lat, lng,
          note: "",
          position: { lat, lng },
          createdAt: new Date(),
        };
        setMarkers(prev => [...prev, newMarker]);
        setActiveMarker(newMarker.id);
        setIsAddingMarker(false);
        toast.success("Punto aggiunto alla mappa");
      } catch (error) {
        console.error("Errore nell'aggiunta del marker:", error);
        setIsAddingMarker(false);
        toast.error("Si è verificato un errore durante l'aggiunta del punto");
      }
    }
  };

  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(markers.map(marker =>
      marker.id === id ? { ...marker, note } : marker
    ));
  };

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    if (activeMarker === id) setActiveMarker(null);
    toast.success("Punto rimosso dalla mappa");
  };

  const editMarker = (id: string) => setActiveMarker(id);

  const clearAllMarkers = () => {
    setMarkers([]);
    setActiveMarker(null);
    toast.success("Tutti i punti sono stati rimossi");
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
