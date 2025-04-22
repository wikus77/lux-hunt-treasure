
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Circle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { LoadScript } from "@react-google-maps/api";
import { MapMarkers, type MapMarker, type SearchArea } from "@/components/maps/MapMarkers";
import MapNoteList from "@/components/maps/MapNoteList";
import EditModeToggle from "@/components/profile/EditModeToggle";
import InteractiveGlobe from "@/components/maps/InteractiveGlobe";

// Google Maps API Key - Use your own key for production
const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";

const Map = () => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Map state
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mapView, setMapView] = useState<"apple" | "google" | "globe">("google");

  // Dialog state
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          setError("Impossibile ottenere la tua posizione. Verifica di aver concesso i permessi di geolocalizzazione.");
          setLoading(false);
        }
      );
    } else {
      setError("Il tuo browser non supporta la geolocalizzazione.");
      setLoading(false);
    }
  }, []);

  // Load saved markers and search areas from localStorage
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
        setSearchAreas(JSON.parse(savedSearchAreas));
      } catch (e) {
        console.error("Error loading saved search areas:", e);
      }
    }
  }, []);

  // Save markers and search areas to localStorage when they change
  useEffect(() => {
    if (markers.length > 0) {
      localStorage.setItem('mapMarkers', JSON.stringify(markers));
    }
  }, [markers]);

  useEffect(() => {
    if (searchAreas.length > 0) {
      localStorage.setItem('mapSearchAreas', JSON.stringify(searchAreas));
    }
  }, [searchAreas]);

  // Funzione per generare l'URL di Apple Maps (visualizzabile sia su Mac che iOS, e "degenera" su web se non c'è supporto)
  const getAppleMapsUrl = (lat: number, lon: number) =>
    `https://maps.apple.com/?ll=${lat},${lon}&z=15`;

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // If adding a marker, create a new marker
    if (isAddingMarker) {
      const newMarker: MapMarker = {
        id: uuidv4(),
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
    
    // If adding a search area, create a new search area
    if (isAddingSearchArea) {
      const newSearchArea: SearchArea = {
        id: uuidv4(),
        lat,
        lng,
        radius: 500, // Default radius in meters
        label: "Area di ricerca",
        editing: true
      };
      setSearchAreas([...searchAreas, newSearchArea]);
      setActiveSearchArea(newSearchArea.id);
      setIsAddingSearchArea(false);
      toast.success("Area di ricerca aggiunta!");
    }
  };

  const handleMapDoubleClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Create a new marker on double click
    const newMarker: MapMarker = {
      id: uuidv4(),
      lat,
      lng,
      note: "",
      editing: true
    };
    setMarkers([...markers, newMarker]);
    setActiveMarker(newMarker.id);
    toast.success("Segnaposto aggiunto! Aggiungi una nota ora.");
  };

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
    const updatedSearchAreas = searchAreas.filter(area => area.id !== id);
    setSearchAreas(updatedSearchAreas);
    setActiveSearchArea(null);
    toast.success("Area di ricerca eliminata!");
  };

  const handleSaveChanges = () => {
    // Nothing to save in edit mode currently
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-projectx-neon-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />
      
      {error ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Riprova</Button>
        </div>
      ) : (
        <div className="w-full px-4 py-6 flex flex-col max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-white">Mappa Interattiva</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Map type switcher */}
            <Button 
              variant={mapView === "google" ? "default" : "outline"} 
              onClick={() => setMapView("google")}
              className="text-xs"
            >
              Google Maps
            </Button>
            <Button 
              variant={mapView === "apple" ? "default" : "outline"} 
              onClick={() => setMapView("apple")}
              className="text-xs"
            >
              Apple Maps
            </Button>
            <Button 
              variant={mapView === "globe" ? "default" : "outline"} 
              onClick={() => setMapView("globe")}
              className="text-xs"
            >
              Globo 3D
            </Button>
            
            {/* Spacer */}
            <div className="flex-grow"></div>
            
            {/* Map controls */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddingMarker(true)}
              disabled={isAddingMarker || isAddingSearchArea || mapView !== "google"}
              className="flex gap-1 items-center"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Aggiungi punto</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddingSearchArea(true)}
              disabled={isAddingMarker || isAddingSearchArea || mapView !== "google"}
              className="flex gap-1 items-center"
            >
              <Circle className="h-4 w-4" />
              <span className="hidden sm:inline">Aggiungi area</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHelpDialogOpen(true)}
            >
              ?
            </Button>
          </div>
          
          {isAddingMarker && (
            <div className="p-2 bg-green-500/20 rounded-md mb-4">
              <p className="text-green-400 text-sm">Clicca sulla mappa per aggiungere un segnaposto</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingMarker(false)}
                className="mt-2"
              >
                Annulla
              </Button>
            </div>
          )}
          
          {isAddingSearchArea && (
            <div className="p-2 bg-green-500/20 rounded-md mb-4">
              <p className="text-green-400 text-sm">Clicca sulla mappa per aggiungere un'area di ricerca</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingSearchArea(false)}
                className="mt-2"
              >
                Annulla
              </Button>
            </div>
          )}
          
          <div className="bg-black/50 border border-projectx-deep-blue/40 rounded-xl overflow-hidden shadow-xl p-4">
            {mapView === "apple" && currentLocation ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <iframe
                  title="Apple Map"
                  src={getAppleMapsUrl(currentLocation[0], currentLocation[1])}
                  allowFullScreen
                  className="w-full max-w-2xl h-[60vh] shadow-xl rounded-md border border-projectx-neon-blue"
                  style={{ background: "#000", minHeight: 350 }}
                ></iframe>
                <a
                  href={getAppleMapsUrl(currentLocation[0], currentLocation[1])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 px-5 py-2 rounded bg-projectx-neon-blue text-white font-bold hover:bg-blue-700 transition"
                >
                  Apri in Apple Maps
                </a>
              </div>
            ) : mapView === "globe" ? (
              <div className="w-full h-[60vh]">
                <InteractiveGlobe />
              </div>
            ) : (
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} loadingElement={<div>Caricamento mappa...</div>}>
                <MapMarkers
                  isLoaded={true}
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
                />
              </LoadScript>
            )}
          </div>
          
          {mapView === "google" && (
            <>
              <div className="flex justify-between mt-4 mb-2">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-lime-400" />
                  Le tue note
                </h2>
                {markers.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllMarkers}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    Cancella tutto
                  </Button>
                )}
              </div>
              
              <MapNoteList markers={markers} setActiveMarker={setActiveMarker} />
              
              <div className="flex justify-between mt-6 mb-2">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Circle className="h-4 w-4 text-lime-400" />
                  Aree di interesse
                </h2>
                {searchAreas.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllSearchAreas}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    Cancella tutto
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 mt-2">
                {searchAreas.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    Nessuna area di interesse. Aggiungi un'area sulla mappa per iniziare.
                  </div>
                ) : (
                  searchAreas.map((area) => (
                    <div 
                      key={`area-list-${area.id}`}
                      className="p-3 rounded-md bg-projectx-deep-blue/40 backdrop-blur-sm cursor-pointer hover:bg-projectx-deep-blue/60 transition-colors"
                      onClick={() => setActiveSearchArea(area.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Circle className="w-5 h-5 flex-shrink-0 text-lime-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{area.label}</div>
                          <div className="text-xs text-gray-400">Raggio: {area.radius}m</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Come usare la mappa interattiva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">Aggiungere un punto</h3>
              <p className="text-muted-foreground">Fai doppio click sulla mappa o usa il pulsante "Aggiungi punto" e poi clicca sulla mappa.</p>
            </div>
            <div>
              <h3 className="font-medium">Aggiungere un'area</h3>
              <p className="text-muted-foreground">Clicca sul pulsante "Aggiungi area" e poi clicca sulla mappa dove vuoi creare l'area.</p>
            </div>
            <div>
              <h3 className="font-medium">Modificare o eliminare</h3>
              <p className="text-muted-foreground">Clicca su un punto o un'area per aprire le opzioni di modifica o eliminazione.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <EditModeToggle 
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default Map;
