
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import EditModeToggle from "@/components/profile/EditModeToggle";
import { toast } from "@/components/ui/sonner";
import { useUserLocationPermission } from "@/hooks/useUserLocationPermission";
import { useNavigate } from "react-router-dom";
import { clues } from "@/data/cluesData";
import MapHeader from "./map/MapHeader";
import MapArea from "./map/MapArea";
import NotesSection from "./map/NotesSection";
import SearchAreasSection from "./map/SearchAreasSection";
import HelpDialog from "./map/HelpDialog";
import LoadingScreen from "./map/LoadingScreen";

const DEFAULT_CENTER = { lat: 45.4642, lng: 9.19 };

const Map = () => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchAreas, setSearchAreas] = useState<any[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [buzzClickCount, setBuzzClickCount] = useState(0);
  const navigate = useNavigate();

  const {
    permission: geoPermission,
    userLocation,
    askPermission: askGeoPermission,
    loading: geoLoading,
    error: geoError
  } = useUserLocationPermission();

  useEffect(() => {
    if (geoPermission === "granted" && userLocation) {
      setCurrentLocation(userLocation);
      setLoading(false);
      setError(null);
    } else if (geoPermission === "denied") {
      setCurrentLocation(null);
      setLoading(false);
      setError("Permesso per la posizione negato.");
    } else if (geoPermission === "prompt") {
      setCurrentLocation(null);
      setLoading(false);
    }
  }, [geoPermission, userLocation]);

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  useEffect(() => {
    const savedMarkers = localStorage.getItem('mapMarkers');
    if (savedMarkers) {
      try {
        setMarkers(JSON.parse(savedMarkers));
      } catch (e) {
        console.error("Error loading saved markers:", e);
      }
    }
    const savedSearchAreas = localStorage.getItem('mapSearchAreas');
    if (savedSearchAreas) {
      try {
        // Mantieni SOLO l'ultima area
        const parsedAreas = JSON.parse(savedSearchAreas);
        if (Array.isArray(parsedAreas) && parsedAreas.length > 0) {
          setSearchAreas([parsedAreas[parsedAreas.length - 1]]);
        } else {
          setSearchAreas([]);
        }
      } catch (e) {
        console.error("Error loading saved search areas:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (markers.length > 0) {
      localStorage.setItem('mapMarkers', JSON.stringify(markers));
    }
  }, [markers]);

  useEffect(() => {
    // Salva SOLO l'ultima area (se presente)
    if (searchAreas.length > 0) {
      localStorage.setItem('mapSearchAreas', JSON.stringify([searchAreas[searchAreas.length - 1]]));
    } else {
      localStorage.removeItem('mapSearchAreas');
    }
  }, [searchAreas]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (isAddingMarker) {
      const newMarker = {
        id: crypto.randomUUID(),
        lat,
        lng,
        note: "",
        editing: true
      };
      setMarkers([...markers, newMarker]);
      setActiveMarker(newMarker.id);
      setIsAddingMarker(false);
      toast.success("Segnaposto aggiunto! Aggiungi una nota ora.");
    }

    if (isAddingSearchArea) {
      const newSearchArea = {
        id: crypto.randomUUID(),
        lat,
        lng,
        radius: 500,
        label: "Area di ricerca",
        editing: true
      };
      setSearchAreas([newSearchArea]);
      setActiveSearchArea(newSearchArea.id);
      setIsAddingSearchArea(false);
      toast.success("Area di ricerca aggiunta!");
    }
  };

  const handleMapDoubleClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const newMarker = {
      id: crypto.randomUUID(),
      lat,
      lng,
      note: "",
      editing: true
    };
    setMarkers([...markers, newMarker]);
    setActiveMarker(newMarker.id);
    toast.success("Segnaposto aggiunto! Aggiungi una nota ora.");
  };

  const handleBuzzClick = () => {
    localStorage.setItem('buzzRequest', 'map');
    navigate("/payment-methods");
  };

  const processCluesAndAddSearchArea = () => {
    const newClickCount = buzzClickCount + 1;
    setBuzzClickCount(newClickCount);

    const baseRadius = 100000;
    const reduction = Math.min(newClickCount - 1, 10) * 5000;
    const radius = Math.max(baseRadius - reduction, 50000);

    const unlockedClues = clues.filter(clue => !clue.isLocked);

    if (unlockedClues.length === 0) {
      toast.warning("Non hai ancora sbloccato indizi. Il raggio sarà più ampio.");
    }

    const lat = currentLocation ? currentLocation[0] : DEFAULT_CENTER.lat;
    const lng = currentLocation ? currentLocation[1] : DEFAULT_CENTER.lng;

    const randomOffset = (Math.random() - 0.5) * 0.05;
    const newSearchArea = {
      id: crypto.randomUUID(),
      lat: lat + randomOffset,
      lng: lng + randomOffset,
      radius: radius,
      label: `Area di ricerca AI (Tentativo ${newClickCount})`,
      editing: false,
      isAI: true,
    };

    setSearchAreas([newSearchArea]);
    setActiveSearchArea(newSearchArea.id);

    toast.success(`Area di ricerca aggiunta! Raggio: ${radius / 1000}km`);
  };

  useEffect(() => {
    const buzzRequest = localStorage.getItem('buzzRequest');
    const paymentCompleted = localStorage.getItem('paymentCompleted');

    if (buzzRequest === 'map' && paymentCompleted === 'true') {
      localStorage.removeItem('buzzRequest');
      localStorage.removeItem('paymentCompleted');
      processCluesAndAddSearchArea();
    }
  }, []);

  const saveMarkerNote = (id: string, note: string) => {
    const updatedMarkers = markers.map(marker =>
      marker.id === id
        ? { ...marker, note, editing: false }
        : marker
    );
    setMarkers(updatedMarkers);
    setActiveMarker(null);
    toast.success("Nota salvata!");
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    const updatedSearchAreas = searchAreas.map(area =>
      area.id === id
        ? { ...area, label, radius, editing: false }
        : area
    );
    setSearchAreas(updatedSearchAreas);
    setActiveSearchArea(null);
    toast.success("Area di ricerca salvata!");
  };

  const editMarker = (id: string) => {
    const updatedMarkers = markers.map(marker =>
      marker.id === id
        ? { ...marker, editing: true }
        : marker
    );
    setMarkers(updatedMarkers);
  };

  const editSearchArea = (id: string) => {
    const updatedSearchAreas = searchAreas.map(area =>
      area.id === id
        ? { ...area, editing: true }
        : area
    );
    setSearchAreas(updatedSearchAreas);
  };

  const deleteMarker = (id: string) => {
    const updatedMarkers = markers.filter(marker => marker.id !== id);
    setMarkers(updatedMarkers);
    setActiveMarker(null);
    toast.success("Segnaposto eliminato!");
  };

  const deleteSearchArea = (id: string) => {
    // Ora tutte le aree sono singole
    setSearchAreas([]);
    setActiveSearchArea(null);
    toast.success("Area di ricerca eliminata!");
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    toast.success("Mappa salvata!");
  };

  const clearAllMarkers = () => {
    if (markers.length === 0) {
      toast.info("Non ci sono segnaposti da cancellare.");
      return;
    }

    if (confirm("Sei sicuro di voler cancellare tutti i segnaposti?")) {
      setMarkers([]);
      localStorage.removeItem('mapMarkers');
      toast.success("Tutti i segnaposti sono stati eliminati.");
    }
  };

  const clearAllSearchAreas = () => {
    if (searchAreas.length === 0) {
      toast.info("Non ci sono aree di ricerca da cancellare.");
      return;
    }
    if (confirm("Sei sicuro di voler cancellare tutte le aree di ricerca?")) {
      setSearchAreas([]);
      localStorage.removeItem('mapSearchAreas');
      toast.success("Tutte le aree di ricerca sono state eliminate.");
    }
  };

  if (loading || geoLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />

      {/* Dialog permessi */}
      {geoPermission === "prompt" && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/90 backdrop-blur-lg">
          <div className="bg-black/70 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-projectx-neon-blue flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-white">Vuoi centrare la mappa sulla tua posizione?</h2>
            <p className="text-sm text-gray-300">Per offrirti la migliore esperienza mostriamo la mappa a partire dalla tua posizione attuale (il permesso viene richiesto una sola volta).</p>
            {geoError && <div className="text-red-500">{geoError}</div>}
            <div className="flex gap-2 mt-4">
              <button onClick={askGeoPermission} disabled={geoLoading} className="flex-1 bg-projectx-blue rounded-md text-white py-2 font-medium shadow hover:bg-projectx-neon-blue focus:outline-none transition">Consenti</button>
              <button onClick={() => localStorage.setItem("geo_permission_granted", "denied")} className="flex-1 bg-gray-700 rounded-md text-white py-2 font-medium hover:bg-gray-800 border border-gray-600 focus:outline-none transition">Nega</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-projectx-blue text-white px-4 py-2 rounded">Riprova</button>
        </div>
      )}

      {!error && (
        <div className="w-full px-4 py-6 flex flex-col max-w-5xl mx-auto relative">
          <h1 className="text-2xl font-bold mb-4 text-white">Mappa Interattiva</h1>

          <MapHeader
            onAddMarker={() => setIsAddingMarker(true)}
            onAddArea={() => setIsAddingSearchArea(true)}
            onHelp={() => setHelpDialogOpen(true)}
            onBuzz={handleBuzzClick}
            isAddingMarker={isAddingMarker}
            isAddingArea={isAddingSearchArea}
          />

          {isAddingMarker && (
            <div className="p-2 bg-green-500/20 rounded-md mb-4">
              <p className="text-green-400 text-sm">Clicca sulla mappa per aggiungere un segnaposto</p>
              <button
                onClick={() => setIsAddingMarker(false)}
                className="mt-2 px-3 py-1 rounded bg-gray-800 text-white"
              >
                Annulla
              </button>
            </div>
          )}
          {isAddingSearchArea && (
            <div className="p-2 bg-green-500/20 rounded-md mb-4">
              <p className="text-green-400 text-sm">Clicca sulla mappa per aggiungere un'area di ricerca</p>
              <button
                onClick={() => setIsAddingSearchArea(false)}
                className="mt-2 px-3 py-1 rounded bg-gray-800 text-white"
              >
                Annulla
              </button>
            </div>
          )}

          <MapArea
            markers={markers}
            searchAreas={searchAreas}
            isAddingMarker={isAddingMarker}
            isAddingSearchArea={isAddingSearchArea}
            activeMarker={activeMarker}
            activeSearchArea={activeSearchArea}
            onMapClick={handleMapClick}
            onMapDoubleClick={handleMapDoubleClick}
            setActiveMarker={setActiveMarker}
            setActiveSearchArea={setActiveSearchArea}
            saveMarkerNote={saveMarkerNote}
            saveSearchArea={saveSearchArea}
            editMarker={editMarker}
            editSearchArea={editSearchArea}
            deleteMarker={deleteMarker}
            deleteSearchArea={deleteSearchArea}
            currentLocation={currentLocation}
          />

          <NotesSection
            markers={markers}
            setActiveMarker={setActiveMarker}
            clearAllMarkers={clearAllMarkers}
          />

          <SearchAreasSection
            searchAreas={searchAreas}
            setActiveSearchArea={setActiveSearchArea}
            clearAllSearchAreas={clearAllSearchAreas}
          />
        </div>
      )}

      <HelpDialog open={helpDialogOpen} setOpen={setHelpDialogOpen} />

      <EditModeToggle
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default Map;
