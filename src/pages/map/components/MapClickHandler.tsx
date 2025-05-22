
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
      
      // Use once instead of on to test a single click first
      map.once('click', function handleSingleClick(e) {
        const { lat, lng } = e.latlng;

        if (!mapRef.current) {
          console.error("❌ MAP REF NON DISPONIBILE");
          return;
        }

        console.log("📍 CLICK SINGOLO:", lat, lng);

        // Create and add the circle with force visibility
        try {
          const circle = L.circle([lat, lng], {
            radius: selectedRadius,
            color: "#00FF00", // Change to green for better visibility
            fillColor: "#00FF00",
            fillOpacity: 0.6,
            weight: 3
          });
          
          // Set z-index high to ensure visibility using proper Leaflet options
          circle.setStyle({ 
            pane: 'overlayPane'
          });
          
          // Add to map with direct reference
          circle.addTo(mapRef.current);
          
          console.log("✅ CERCHIO SINGOLO INSERITO", circle);
          
          // Re-add the normal click handler after successful single click test
          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            console.log("📍 CLICK NORMALE:", lat, lng);
            
            const newCircle = L.circle([lat, lng], {
              radius: selectedRadius,
              color: "#00BFFF",
              fillOpacity: 0.4
            })
            .setStyle({ pane: 'overlayPane' })
            .addTo(mapRef.current!);
            
            console.log("✅ CERCHIO NORMALE INSERITO");
            
            // Call the handler function
            handleMapClickArea(e);
          });
        } catch (error) {
          console.error("❌ ERRORE DURANTE CREAZIONE CERCHIO:", error);
        }
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
