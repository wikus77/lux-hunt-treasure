
import L from 'leaflet';

export const handleMapMove = (mapRef: React.MutableRefObject<L.Map | null>, setMapCenter: (center: [number, number]) => void) => {
  return () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      setMapCenter([center.lat, center.lng]);
    }
  };
};

export const handleMapReady = (
  mapRef: React.MutableRefObject<L.Map | null>,
  handleMapMove: () => void
) => {
  return (map: L.Map) => {
    mapRef.current = map;
    map.on('moveend', handleMapMove);
    console.log("🗺️ Map initialized and ready for point addition");
  };
};

export const handleAddNewPoint = (
  isAddingPoint: boolean,
  addNewPoint: (lat: number, lng: number) => void,
  setIsAddingPoint: (value: boolean) => void
) => {
  return (lat: number, lng: number) => {
    console.log("⭐ handleAddNewPoint called with coordinates:", { lat, lng });
    console.log("🔄 Current isAddingPoint state:", isAddingPoint);
    
    if (isAddingPoint) {
      console.log("✅ Creating new point at coordinates:", lat, lng);
      addNewPoint(lat, lng);
      setIsAddingPoint(false);
      console.log("🔄 isAddingPoint set to false after point creation");
    } else {
      console.log("❌ Not in adding point mode, ignoring click");
    }
  };
};

export const handleAreaGenerated = (
  mapRef: React.MutableRefObject<L.Map | null>
) => {
  return (lat: number, lng: number, radiusKm: number) => {
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
  };
};
