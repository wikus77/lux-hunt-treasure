import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import MapHeader from "./MapHeader";
import MapArea from "./MapArea";
import NotesSection from "./NotesSection";
import HelpDialog from "./HelpDialog";
import LoadingScreen from "./LoadingScreen";
import { clues } from "@/data/cluesData";
import { useUserLocationPermission } from "@/hooks/useUserLocationPermission";
import { analyzeCluesForLocation } from "@/utils/clueAnalyzer";
import BuzzMapBanner from "@/components/buzz/BuzzMapBanner";

const DEFAULT_CENTER = { lat: 45.4642, lng: 9.19 }; // Milano

const buzzPricingSteps = [
  { min: 1, max: 5, price: 2.99 },
  { min: 6, max: 10, price: 5.99 },
  { min: 11, max: 15, price: 11.99 },
  { min: 16, max: 20, price: 15.99 },
  { min: 21, max: 30, price: 19.99 },
  { min: 31, max: 40, price: 25.99 },
  { min: 41, max: 45, price: 27.99 },
  { min: 46, max: 50, price: 29.99 },
  { min: 51, max: 55, price: 35.99 },
  { min: 56, max: 60, price: 39.99 },
  { min: 61, max: 65, price: 45.99 },
  { min: 66, max: 70, price: 50.99 }
];

function getBuzzMapPrice(clueCount: number) {
  const found = buzzPricingSteps.find(
    s => clueCount >= s.min && clueCount <= s.max
  );
  if (found) return found.price;
  if (clueCount > 70) return 99.99;
  return 2.99;
}

const MapLogicProvider: React.FC = () => {
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchAreas, setSearchAreas] = useState<any[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [buzzClickCount, setBuzzClickCount] = useState(0);

  const [showBuzzBanner, setShowBuzzBanner] = useState(false);
  const buzzAreaPosition = useRef<{lat:number, lng:number} | null>(null);

  const { userLocation } = useUserLocationPermission();
  const currentLocation = userLocation;

  const unlockedClues = clues.filter(clue => !clue.isLocked);
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  const totalClues = unlockedClues.length + notifications.length;
  const buzzMapPrice = getBuzzMapPrice(totalClues);

  useEffect(() => {
    const paymentCompleted = localStorage.getItem('paymentCompleted');
    if (paymentCompleted === 'true') {
      localStorage.removeItem('paymentCompleted');
      createIntelligentSearchArea();
    }
  // eslint-disable-next-line
  }, []);

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

  const createIntelligentSearchArea = () => {
    const newClickCount = buzzClickCount + 1;
    setBuzzClickCount(newClickCount);

    const locationInfo = analyzeCluesForLocation(
      clues.filter(clue => !clue.isLocked),
      JSON.parse(localStorage.getItem('notifications') || '[]')
    );

    const lat = locationInfo.lat || (currentLocation ? currentLocation[0] : DEFAULT_CENTER.lat);
    const lng = locationInfo.lng || (currentLocation ? currentLocation[1] : DEFAULT_CENTER.lng);

    buzzAreaPosition.current = {lat, lng};

    const newSearchArea = {
      id: crypto.randomUUID(),
      lat,
      lng,
      radius: 500000, // 500km
      label: `Area suggerita (Analisi ${newClickCount})`,
      editing: false,
      isAI: true,
      confidence: locationInfo.confidence || "bassa"
    };

    const filteredAreas = searchAreas.filter(area => !area.isAI);
    setSearchAreas([...filteredAreas, newSearchArea]);
    setActiveSearchArea(newSearchArea.id);

    setShowBuzzBanner(true);

    toast.success(`Area di ricerca aggiunta!`);
  };

  const processCluesAndAddSearchArea = () => {
    const newClickCount = buzzClickCount + 1;
    setBuzzClickCount(newClickCount);

    localStorage.setItem('buzzRequest', 'map');
    localStorage.setItem('buzzMapPrice', buzzMapPrice.toString());
    window.location.href = '/payment-methods';
  };

  const handleBuzzBannerClose = () => {
    setShowBuzzBanner(false);
    if (buzzAreaPosition.current) {
      setTimeout(() => {
        setActiveSearchArea(
          searchAreas.find(area => area.isAI)?.id || null
        );
      }, 100);
    }
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
          buzzMapPrice={buzzMapPrice}
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

        <BuzzMapBanner
          open={showBuzzBanner}
          onClose={handleBuzzBannerClose}
          area={searchAreas.find(area => area.isAI) || null}
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

export default MapLogicProvider;
