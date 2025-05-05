
import React from "react";
import { LoadScript } from "@react-google-maps/api";
import { MapMarkers, type MapMarker, type SearchArea } from "@/components/maps/MapMarkers";
import { useIsMobile } from "@/hooks/use-mobile";

const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";
const DEFAULT_CENTER = { lat: 45.4642, lng: 9.19 };

type MapAreaProps = {
  onMapReady?: () => void;
  markers: MapMarker[];
  searchAreas: SearchArea[];
  isAddingMarker: boolean;
  isAddingSearchArea: boolean;
  activeMarker: string | null;
  activeSearchArea: string | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onMapDoubleClick: (e: google.maps.MapMouseEvent) => void;
  setActiveMarker: (id: string | null) => void;
  setActiveSearchArea: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editMarker: (id: string) => void;
  editSearchArea: (id: string) => void;
  deleteMarker: (id: string) => void;
  deleteSearchArea: (id: string) => void;
  currentLocation: [number, number] | null;
};

const MapArea: React.FC<MapAreaProps> = ({
  onMapReady,
  markers = [],
  searchAreas = [],
  isAddingMarker,
  isAddingSearchArea,
  activeMarker,
  activeSearchArea,
  onMapClick,
  onMapDoubleClick,
  setActiveMarker,
  setActiveSearchArea,
  saveMarkerNote,
  saveSearchArea,
  editMarker,
  editSearchArea,
  deleteMarker,
  deleteSearchArea,
  currentLocation
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-black/50 border border-projectx-deep-blue/40 rounded-lg sm:rounded-xl overflow-hidden shadow-xl h-full">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} loadingElement={<div className="h-full flex items-center justify-center">Caricamento mappa...</div>}>
        <MapMarkers
          isLoaded={true}
          markers={markers}
          searchAreas={searchAreas}
          isAddingMarker={isAddingMarker}
          isAddingSearchArea={isAddingSearchArea}
          activeMarker={activeMarker}
          activeSearchArea={activeSearchArea}
          onMapClick={onMapClick}
          onMapDoubleClick={onMapDoubleClick}
          setActiveMarker={setActiveMarker}
          setActiveSearchArea={setActiveSearchArea}
          saveMarkerNote={saveMarkerNote}
          saveSearchArea={saveSearchArea}
          editMarker={editMarker}
          editSearchArea={editSearchArea}
          deleteMarker={deleteMarker}
          deleteSearchArea={deleteSearchArea}
          center={
            currentLocation
              ? { lat: currentLocation[0], lng: currentLocation[1] }
              : DEFAULT_CENTER
          }
          mapOptions={{
            mapTypeControl: !isMobile,
            fullscreenControl: !isMobile,
            streetViewControl: !isMobile,
            zoomControlOptions: isMobile ? { position: google.maps.ControlPosition.RIGHT_BOTTOM } : undefined,
            gestureHandling: isMobile ? "greedy" : "auto",
            zoomControl: true
          }}
        />
      </LoadScript>
    </div>
  );
};

export default MapArea;
