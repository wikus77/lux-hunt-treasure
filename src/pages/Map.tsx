
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import MapHeader from "./map/MapHeader";
import MapArea from "./map/MapArea";
import NotesSection from "./map/NotesSection";
import HelpDialog from "./map/HelpDialog";
import LoadingScreen from "./map/LoadingScreen";
import { clues } from "@/data/cluesData";
import { useUserLocationPermission } from "@/hooks/useUserLocationPermission";

const DEFAULT_CENTER = { lat: 45.4642, lng: 9.19 }; // Milano

const Map = () => {
  // Map state
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchAreas, setSearchAreas] = useState<any[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [buzzClickCount, setBuzzClickCount] = useState(0);
  
  // Get user location
  const { userLocation } = useUserLocationPermission();
  const currentLocation = userLocation;

  const addMarker = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    const newMarker = {
      id: crypto.randomUUID(),
      lat,
      lng,
      note: "",
      editing: true,
    };
    
    setMarkers([...markers, newMarker]);
    setActiveMarker(newMarker.id);
    setIsAddingMarker(false);
  };

  const addSearchArea = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    const newSearchArea = {
      id: crypto.randomUUID(),
      lat,
      lng,
      radius: 100000, // 100km
      label: "Area di ricerca",
      editing: true,
    };
    
    setSearchAreas([...searchAreas, newSearchArea]);
    setActiveSearchArea(newSearchArea.id);
    setIsAddingSearchArea(false);
  };

  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(
      markers.map((m) =>
        m.id === id ? { ...m, note, editing: false } : m
      )
    );
    setActiveMarker(null);
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    setSearchAreas(
      searchAreas.map((area) =>
        area.id === id ? { ...area, label, radius, editing: false } : area
      )
    );
    setActiveSearchArea(null);
  };

  const editMarker = (id: string) => {
    setMarkers(
      markers.map((m) => (m.id === id ? { ...m, editing: true } : m))
    );
  };

  const editSearchArea = (id: string) => {
    setSearchAreas(
      searchAreas.map((area) =>
        area.id === id ? { ...area, editing: true } : area
      )
    );
  };

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id));
    setActiveMarker(null);
  };

  const deleteSearchArea = (id: string) => {
    setSearchAreas(searchAreas.filter((area) => area.id !== id));
    setActiveSearchArea(null);
  };

  const clearAllMarkers = () => {
    setMarkers([]);
    setActiveMarker(null);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (isAddingMarker) {
      addMarker(e);
    } else if (isAddingSearchArea) {
      addSearchArea(e);
    }
  };

  const handleMapDoubleClick = (e: google.maps.MapMouseEvent) => {
    addMarker(e);
  };

  const processCluesAndAddSearchArea = () => {
    const newClickCount = buzzClickCount + 1;
    setBuzzClickCount(newClickCount);

    const baseRadius = 100000;
    const reduction = Math.min(newClickCount - 1, 10) * 5000;
    const radius = Math.max(baseRadius - reduction, 50000);

    const unlockedClues = clues.filter(clue => !clue.isLocked);

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

    toast.success(`Area di ricerca aggiunta!`);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Mappa Interattiva</h1>
      <div className="space-y-6">
        <MapHeader
          onAddMarker={() => setIsAddingMarker(true)}
          onAddArea={() => setIsAddingSearchArea(true)}
          onHelp={() => setHelpOpen(true)}
          onBuzz={processCluesAndAddSearchArea}
          isAddingMarker={isAddingMarker}
          isAddingArea={isAddingSearchArea}
        />
        
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesSection
            markers={markers}
            setActiveMarker={setActiveMarker}
            clearAllMarkers={clearAllMarkers}
          />
        </div>
      </div>
      
      <HelpDialog open={helpOpen} setOpen={setHelpOpen} />
    </div>
  );
};

export default Map;
