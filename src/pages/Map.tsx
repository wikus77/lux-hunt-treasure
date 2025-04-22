
import React, { useState, useEffect } from "react";
import { StickyNote, Plus, X, Circle, MapPin } from "lucide-react";
import { MapNoteList } from "@/components/maps/MapNoteList";
import SearchableGlobe from "@/components/maps/SearchableGlobe";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapMarkers, type MapMarker, type SearchArea } from "@/components/maps/MapMarkers";
import { useLoadScript } from "@react-google-maps/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const libraries: ["places"] = ["places"];
const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";

const Map = () => {
  const [markers, setMarkers] = useState<MapMarker[]>(() => {
    const savedMarkers = localStorage.getItem('mapMarkers');
    return savedMarkers ? JSON.parse(savedMarkers) : [];
  });
  
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>(() => {
    const savedAreas = localStorage.getItem('mapSearchAreas');
    return savedAreas ? JSON.parse(savedAreas) : [];
  });
  
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const { toast } = useToast();
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Save markers and search areas to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mapMarkers', JSON.stringify(markers));
  }, [markers]);
  
  useEffect(() => {
    localStorage.setItem('mapSearchAreas', JSON.stringify(searchAreas));
  }, [searchAreas]);

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: "Nota vuota",
        description: "Inserisci del testo per la tua nota.",
        variant: "destructive",
      });
      return;
    }

    const newMarker: MapMarker = {
      id: `marker-${Date.now()}`,
      lat: 0,
      lng: 0,
      note: newNote,
    };

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    setNewNote('');
    setShowNoteForm(false);

    toast({
      title: "Nota aggiunta",
      description: "La tua nota è stata salvata con successo.",
    });
  };
  
  const handleMapClick = () => {
    // Close active markers/areas when clicking elsewhere on the map
    if (activeMarker) setActiveMarker(null);
    if (activeSearchArea) setActiveSearchArea(null);
  };
  
  const handleMapDoubleClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    if (isAddingSearchArea) {
      const newArea: SearchArea = {
        id: `area-${Date.now()}`,
        lat,
        lng,
        radius: 500,
        label: "Area di ricerca",
        editing: true
      };
      
      setSearchAreas([...searchAreas, newArea]);
      setActiveSearchArea(newArea.id);
      setIsAddingSearchArea(false);
      
      toast({
        title: "Area di ricerca aggiunta",
        description: "Clicca sull'area per modificarla."
      });
    } else {
      // Default to adding a marker
      const newMarker: MapMarker = {
        id: `marker-${Date.now()}`,
        lat,
        lng,
        note: "",
        editing: true
      };
      
      setMarkers([...markers, newMarker]);
      setActiveMarker(newMarker.id);
      
      toast({
        title: "Segnaposto aggiunto",
        description: "Aggiungi una nota al segnaposto."
      });
    }
  };
  
  const editMarker = (id: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, editing: !marker.editing } : marker
    ));
  };
  
  const editSearchArea = (id: string) => {
    setSearchAreas(areas => areas.map(area => 
      area.id === id ? { ...area, editing: !area.editing } : area
    ));
  };
  
  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, note, editing: false } : marker
    ));
    
    setActiveMarker(null);
    
    toast({
      title: "Nota salvata",
      description: "La nota è stata salvata con successo."
    });
  };
  
  const saveSearchArea = (id: string, label: string, radius: number) => {
    setSearchAreas(areas => areas.map(area => 
      area.id === id ? { ...area, label, radius, editing: false } : area
    ));
    
    setActiveSearchArea(null);
    
    toast({
      title: "Area salvata",
      description: "L'area di ricerca è stata salvata con successo."
    });
  };
  
  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    setActiveMarker(null);
    
    toast({
      title: "Segnaposto eliminato",
      description: "Il segnaposto è stato eliminato con successo."
    });
  };
  
  const deleteSearchArea = (id: string) => {
    setSearchAreas(areas => areas.filter(area => area.id !== id));
    setActiveSearchArea(null);
    
    toast({
      title: "Area eliminata",
      description: "L'area di ricerca è stata eliminata con successo."
    });
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-projectx-neon-blue">Mappa Interattiva</h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={isAddingMarker ? "default" : "outline"}
            className="flex items-center gap-1"
            onClick={() => {
              setIsAddingMarker(!isAddingMarker);
              setIsAddingSearchArea(false);
              toast({
                title: isAddingMarker ? "Modalità normale" : "Aggiungi segnaposto",
                description: isAddingMarker ? "Torna alla navigazione normale" : "Clicca due volte sulla mappa per aggiungere un segnaposto",
              });
            }}
          >
            <MapPin className="h-4 w-4" />
            {isAddingMarker ? 'Annulla' : 'Segnaposto'}
          </Button>
          
          <Button 
            size="sm" 
            variant={isAddingSearchArea ? "default" : "outline"}
            className="flex items-center gap-1"
            onClick={() => {
              setIsAddingSearchArea(!isAddingSearchArea);
              setIsAddingMarker(false);
              toast({
                title: isAddingSearchArea ? "Modalità normale" : "Aggiungi area",
                description: isAddingSearchArea ? "Torna alla navigazione normale" : "Clicca due volte sulla mappa per aggiungere un'area di ricerca",
              });
            }}
          >
            <Circle className="h-4 w-4" />
            {isAddingSearchArea ? 'Annulla' : 'Area'}
          </Button>
        </div>
      </div>

      <Alert className="mb-4 border-blue-500/30 bg-blue-500/10">
        <MapPin className="h-4 w-4 text-blue-500" />
        <AlertTitle>Mappa interattiva</AlertTitle>
        <AlertDescription>
          Fai doppio click sulla mappa per aggiungere un segnaposto o un'area di ricerca.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="map">Mappa Italia</TabsTrigger>
          <TabsTrigger value="markers">Mappa Personalizzata</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="rounded-lg overflow-hidden">
          <div className="w-full h-[50vh] rounded-lg overflow-hidden border border-projectx-deep-blue glass-card mb-4 relative">
            <SearchableGlobe />
          </div>
        </TabsContent>
        
        <TabsContent value="markers" className="w-full rounded-lg overflow-hidden">
          <div className="w-full bg-projectx-deep-blue/20 rounded-lg overflow-hidden border border-projectx-deep-blue mb-4 relative">
            {isLoaded && (
              <MapMarkers
                isLoaded={isLoaded}
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
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-projectx-neon-blue">
          <StickyNote className="w-5 h-5" /> Note Salvate
        </h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setShowNoteForm(!showNoteForm)}
        >
          {showNoteForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showNoteForm ? 'Annulla' : 'Aggiungi Nota'}
        </Button>
      </div>

      {showNoteForm && (
        <div className="mb-6 p-4 bg-projectx-deep-blue/40 backdrop-blur-sm rounded-md">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Scrivi la tua nota qui..."
            className="mb-3 resize-none bg-black/50 border-projectx-deep-blue"
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddNote} size="sm">
              Salva Nota
            </Button>
          </div>
        </div>
      )}

      <MapNoteList
        markers={markers}
        setActiveMarker={setActiveMarker}
      />
    </div>
  );
};

export default Map;
