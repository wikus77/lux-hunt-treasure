
import React, { useEffect } from 'react';
import L from 'leaflet';

type MapClickHandlerProps = {
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
  selectedRadius: number;
};

const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  isAddingSearchArea,
  handleMapClickArea,
  mapRef,
  selectedRadius
}) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // TEST CODE: Add a static circle to verify rendering works
    setTimeout(() => {
      if (!mapRef.current) return;

      const lat = 41.9028;
      const lng = 12.4964;

      const circle = L.circle([lat, lng], {
        radius: 800,
        color: '#00FF00',
        fillOpacity: 0.6
      })
      .setStyle({ pane: 'overlayPane' })
      .addTo(mapRef.current!);

      console.log('✅ TEST: CERCHIO STATICO INSERITO', lat, lng);
    }, 1500); // attende caricamento mappa

    // Remove any existing click handlers
    map.off('click');

    // Only add click handler if we're in area adding mode
    if (isAddingSearchArea) {
      console.log("Adding click handler to map, radius:", selectedRadius);
      
      // Add the new click handler with enhanced visibility
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        if (!mapRef.current) {
          console.error("❌ MAP REF NON DISPONIBILE");
          return;
        }

        console.log("📍 CLICK A:", lat, lng);
        console.log("🎯 MAP REF:", mapRef.current);

        const circle = L.circle([lat, lng], {
          radius: selectedRadius,
          color: "#00BFFF",
          fillOpacity: 0.4
        })
        .setStyle({ pane: 'overlayPane' }) // forza visibilità su layer visibile
        .addTo(mapRef.current);

        console.log("✅ CERCHIO INSERITO SU MAPPA");
        
        // Debug: check all circles on the map
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Circle) {
            console.log("👁️ CERCHIO TROVATO", layer.getLatLng());
          }
        });
        
        // Call the handler function to save to Supabase, etc.
        handleMapClickArea(e);
      });
    }

    return () => {
      if (map) {
        map.off('click');
      }
    };
  }, [isAddingSearchArea, handleMapClickArea, mapRef, selectedRadius]);

  return null;
};

export default MapClickHandler;
