
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { MapMarker, SearchArea } from "@/components/maps/MapMarkers";
import { v4 as uuidv4 } from "uuid";

type UseMapLogicResult = {
  isLoading: boolean;
  mapReady: boolean;
  showCluePopup: boolean;
  clueMessage: string;
  location: ReturnType<typeof useLocation>;
  markers: MapMarker[];
  searchAreas: SearchArea[];
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

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [buzzMapPrice] = useState<number>(1.99);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);

    navigator.geolocation.getCurrentPosition(
      position => setCurrentLocation([position.coords.latitude, position.coords.longitude]),
      error => console.log("Errore nell'ottenere la posizione:", error.message)
    );

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
            generateSearchArea();
            toast.success("Nuova area di ricerca generata!", {
              description: "Controlla la mappa per vedere la nuova area di ricerca."
            });
          }
        }, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // For clue popup area generation
  const generateSearchArea = () => {
    if (currentLocation) {
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: currentLocation[0],
        lng: currentLocation[1],
        radius: 500,
        label: "Area generata",
        color: "#4361ee"
      };
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
    }
  };

  const handleMapReady = () => setMapReady(true);

  // Map controls and logic as defined previously
  const handleAddMarker = () => {
    setIsAddingMarker(true);
    setIsAddingSearchArea(false);
    toast.info("Clicca sulla mappa per aggiungere un nuovo punto");
  };

  const handleAddArea = () => {
    setIsAddingSearchArea(true);
    setIsAddingMarker(false);
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca");
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (isAddingMarker && e.latLng) {
      const newMarker: MapMarker = {
        id: uuidv4(),
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        note: "",
        createdAt: new Date()
      };
      setMarkers(prev => [...prev, newMarker]);
      setActiveMarker(newMarker.id);
      setIsAddingMarker(false);
      toast.success("Punto aggiunto alla mappa");
    } else if (isAddingSearchArea && e.latLng) {
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        radius: 500,
        label: "Area di ricerca",
        color: "#7209b7"
      };
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
      setIsAddingSearchArea(false);
      toast.success("Area di ricerca aggiunta alla mappa");
    }
  };

  const handleMapDoubleClick = (_e: google.maps.MapMouseEvent) => {
    // No custom logic, add as needed
  };

  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(markers.map(marker =>
      marker.id === id ? { ...marker, note } : marker
    ));
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    setSearchAreas(searchAreas.map(area =>
      area.id === id ? { ...area, label, radius } : area
    ));
  };

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    if (activeMarker === id) setActiveMarker(null);
    toast.success("Punto rimosso dalla mappa");
  };

  const deleteSearchArea = (id: string) => {
    setSearchAreas(searchAreas.filter(area => area.id !== id));
    if (activeSearchArea === id) setActiveSearchArea(null);
    toast.success("Area di ricerca rimossa");
  };

  const editMarker = (id: string) => setActiveMarker(id);

  const editSearchArea = (id: string) => setActiveSearchArea(id);

  const clearAllMarkers = () => {
    setMarkers([]);
    setActiveMarker(null);
    toast.success("Tutti i punti sono stati rimossi");
  };

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
    markers,
    searchAreas,
    activeMarker,
    activeSearchArea,
    isAddingMarker,
    isAddingSearchArea,
    currentLocation,
    buzzMapPrice,
    setShowCluePopup,
    setClueMessage,
    setActiveMarker,
    setActiveSearchArea,
    handleMapReady,
    handleAddMarker,
    handleAddArea,
    handleMapClick,
    handleMapDoubleClick,
    saveMarkerNote,
    saveSearchArea,
    deleteMarker,
    deleteSearchArea,
    editMarker,
    editSearchArea,
    clearAllMarkers,
    handleBuzz,
    handleHelp,
    generateSearchArea
  };
};
