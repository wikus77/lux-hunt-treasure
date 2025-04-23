
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { SearchArea } from "@/components/maps/MapMarkers";
import { v4 as uuidv4 } from "uuid";

export function useSearchAreasLogic(currentLocation: [number, number] | null) {
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>([]);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);

  const handleAddArea = () => {
    setIsAddingSearchArea(true);
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca");
  };

  const handleMapClickArea = (e: google.maps.MapMouseEvent) => {
    if (isAddingSearchArea && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newArea: SearchArea = {
        id: uuidv4(),
        lat, lng,
        radius: 500,
        label: "Area di ricerca",
        color: "#7209b7",
        position: { lat, lng }
      };
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
      setIsAddingSearchArea(false);
      toast.success("Area di ricerca aggiunta alla mappa");
    }
  };

  // Generate area from clue
  const generateSearchArea = () => {
    if (currentLocation) {
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: currentLocation[0],
        lng: currentLocation[1],
        radius: 500,
        label: "Area generata",
        color: "#4361ee",
        position: { lat: currentLocation[0], lng: currentLocation[1] }
      };
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
    }
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    setSearchAreas(searchAreas.map(area =>
      area.id === id ? { ...area, label, radius } : area
    ));
  };

  const deleteSearchArea = (id: string) => {
    setSearchAreas(searchAreas.filter(area => area.id !== id));
    if (activeSearchArea === id) setActiveSearchArea(null);
    toast.success("Area di ricerca rimossa");
  };

  const editSearchArea = (id: string) => setActiveSearchArea(id);

  return {
    searchAreas,
    setSearchAreas,
    activeSearchArea,
    setActiveSearchArea,
    isAddingSearchArea,
    setIsAddingSearchArea,
    handleAddArea,
    handleMapClickArea,
    saveSearchArea,
    deleteSearchArea,
    editSearchArea,
    generateSearchArea
  };
}
