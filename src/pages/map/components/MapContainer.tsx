
import React from "react";
import MapArea from "../MapArea";
import { MapMarker, SearchArea } from "@/components/maps/MapMarkers";

interface MapContainerProps {
  onMapReady: () => void;
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
}

const MapContainer = (props: MapContainerProps) => {
  return (
    <div className="w-full h-[65vh] md:h-[70vh]">
      <MapArea {...props} />
    </div>
  );
};

export default MapContainer;
