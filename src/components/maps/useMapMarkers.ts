
import { useState, useCallback, useEffect } from "react";
import { italianCities } from "./useFilteredLocations";

export type City = {
  name: string;
  lat: number;
  lng: number;
  province?: string;
};

export type Marker = {
  name: string;
  lat: number;
  lng: number;
};

interface UseMapMarkersProps {
  map: google.maps.Map | null;
}

export const useMapMarkers = ({ map }: UseMapMarkersProps) => {
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Create markers for cities when map loads or changes
  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // Cleanup old markers
    markers.forEach((marker) => marker.map = null);
    setMarkers([]);

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    italianCities.forEach((city) => {
      if (!city || typeof city.lat !== "number" || typeof city.lng !== "number") return;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: city.lat, lng: city.lng },
        title: city.name,
      });
      marker.addListener("click", () => {
        setSelectedCity(city);
        map.panTo({ lat: city.lat, lng: city.lng });
        map.setZoom(12);
      });
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Cleanup
    return () => {
      newMarkers.forEach((marker) => (marker.map = null));
    };
    // eslint-disable-next-line
  }, [map, typeof window.google?.maps?.marker?.AdvancedMarkerElement]);

  return { markers, setMarkers, selectedCity, setSelectedCity };
};
