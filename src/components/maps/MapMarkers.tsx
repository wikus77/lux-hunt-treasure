
import React, { useRef } from "react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import { MapPin, Pencil, X, Check, MapPinX, Circle as CircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import MapUserMarkers from "./MapUserMarkers";
import MapSearchAreas from "./MapSearchAreas";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  editing?: boolean;
};

export type SearchArea = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  editing?: boolean;
};

type MapMarkersProps = {
  isLoaded: boolean;
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
  center?: { lat: number; lng: number }; // nuovo prop opzionale
};

const mapContainerStyle = {
  width: "100%",
  height: "60vw",
  maxHeight: "60vh",
  minHeight: "300px",
  borderRadius: "1rem"
};

const defaultCenter = { lat: 45.4642, lng: 9.19 }; // Milano

export const MapMarkers = ({
  isLoaded,
  markers,
  searchAreas,
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
  center, // supporto nuovo prop
}: any) => {
  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  const newLabelRef = useRef<HTMLInputElement>(null);
  const newRadiusRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full flex justify-center">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center ?? defaultCenter} /* ora il centro può cambiare */
          onClick={onMapClick}
          onDblClick={onMapDoubleClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "auto",
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              }
            ]
          }}
        >
          {/* Search Areas */}
          <MapSearchAreas
            searchAreas={searchAreas}
            activeSearchArea={activeSearchArea}
            setActiveSearchArea={setActiveSearchArea}
            saveSearchArea={saveSearchArea}
            editSearchArea={editSearchArea}
            deleteSearchArea={deleteSearchArea}
          />

          {/* User Markers */}
          <MapUserMarkers
            markers={markers}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
            saveMarkerNote={saveMarkerNote}
            editMarker={editMarker}
            deleteMarker={deleteMarker}
          />
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Caricamento mappa...
        </div>
      )}
    </div>
  );
};
