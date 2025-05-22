
import { useEffect } from 'react';
import L from 'leaflet';
import { SearchArea } from '@/components/maps/types';

/**
 * Custom hook to manage map bounds based on search areas
 */
export function useMapBounds(
  map: L.Map | null,
  searchAreas: SearchArea[]
) {
  // Ensure search areas are visible in the viewport
  useEffect(() => {
    if (searchAreas.length > 0 && map) {
      const bounds = L.latLngBounds([]);
      searchAreas.forEach(area => {
        bounds.extend([area.lat, area.lng]);
      });
      
      // Only fit bounds if we have valid bounds
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [searchAreas, map]);
}
