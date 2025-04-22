
import React, { useState } from "react";
import { City } from "./useMapMarkers";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";

interface Area {
  lat: number;
  lng: number;
  radius: number;
  label: string;
  id: string;
}

interface MarkerWithNote {
  lat: number;
  lng: number;
  note: string;
  id: string;
}

type Props = {
  map: google.maps.Map | null;
  onAddMarker: (marker: MarkerWithNote) => void;
  onAddArea: (area: Area) => void;
};

const MapMarkerManager: React.FC<Props> = ({ map, onAddMarker, onAddArea }) => {
  // Local state if needed for feedback

  // Handle double click for marker
  const handleMapDoubleClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Very basic note for now (could add modal further)
    const note = prompt("Aggiungi una nota per questo punto:", "") || "";
    const id = `${lat},${lng}-${Date.now()}`;
    onAddMarker({ lat, lng, note, id });
  };

  // Handle click for area creation (this is a simplification; for a true "draw" tool, one could use the Google Maps Drawing library)
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (window.confirm("Vuoi cerchiare un'area qui?")) {
      const radius = parseInt(prompt("Raggio dell'area in metri:", "500") || "500", 10);
      const label = prompt("Nome dell'area di interesse:", "Area di ricerca") || "Area di ricerca";
      const id = `${lat},${lng}-${Date.now()}`;
      onAddArea({ lat, lng, radius, label, id });
    }
  };

  // Attach to map events using React effect/hook if map present
  React.useEffect(() => {
    if (!map) return;
    const dblClickListener = map.addListener("dblclick", handleMapDoubleClick);
    const clickListener = map.addListener("click", handleMapClick);

    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(dblClickListener);
    };
  }, [map]);

  return null; // No UI, only side effects
};

export default MapMarkerManager;
