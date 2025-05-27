
import { useState, useRef, useCallback } from 'react';
import L from 'leaflet';

export const useMapCenterLogic = (defaultLocation: [number, number]) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultLocation);
  const mapRef = useRef<L.Map | null>(null);

  // Funzione per aggiornare il centro quando la mappa si muove
  const handleMapMove = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      setMapCenter([center.lat, center.lng]);
    }
  }, []);

  // Callback for when map is ready
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    map.on('moveend', handleMapMove);
    console.log("🗺️ Map initialized and ready for point addition");
  }, [handleMapMove]);

  // Funzione per centrare la mappa su una nuova area generata
  const handleAreaGenerated = useCallback((lat: number, lng: number, radiusKm: number) => {
    if (mapRef.current) {
      console.log('🎯 Centrando mappa su nuova area:', { lat, lng, radiusKm });
      
      // Centra la mappa sulle nuove coordinate
      mapRef.current.setView([lat, lng], 13);
      
      // Calcola lo zoom appropriato per visualizzare l'area completa
      const radiusMeters = radiusKm * 1000;
      const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2); // Diametro completo
      
      // Adatta lo zoom per mostrare l'area con un po' di margine
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
  }, []);

  return {
    mapCenter,
    mapRef,
    handleMapReady,
    handleAreaGenerated
  };
};
