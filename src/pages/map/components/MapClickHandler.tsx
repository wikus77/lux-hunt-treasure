
import React, { useEffect } from 'react';
import L from 'leaflet';

// Global array to store circles outside of React lifecycle
const drawnCircles: L.Circle[] = [];

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

      // Store in global array
      drawnCircles.push(circle);

      console.log('✅ TEST: CERCHIO STATICO INSERITO', lat, lng);
    }, 1500); // attende caricamento mappa

    // Remove any existing click handlers
    map.off('click');

    // Only add click handler if we're in area adding mode
    if (isAddingSearchArea) {
      console.log("Adding click handler to map, radius:", selectedRadius);
      
      // DIAGNOSTIC TEST: Use once to test click handling
      map.once('click', function handleSingleClick(e) {
        const { lat, lng } = e.latlng;

        console.log("✅ CLICK RICEVUTO:", lat, lng);
        console.log("🧠 MAP REF ATTIVO:", mapRef.current);

        if (!mapRef.current) {
          console.error("❌ MAP REF NON DISPONIBILE");
          return;
        }

        console.log("📍 CLICK SINGOLO:", lat, lng);

        // Create and add the circle with diagnostic logging
        const circle = L.circle([lat, lng], {
          radius: 500,
          color: "#FF0000",
          fillOpacity: 0.5
        }).addTo(mapRef.current!);

        console.log("🔥 CERCHIO CLICK RENDERED:", circle.getLatLng());

        // Store in global array to prevent garbage collection
        drawnCircles.push(circle);
        
        // Test: check for active circles on the map
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Circle) {
            console.log("🟢 CERCHIO PRESENTE:", layer.getLatLng(), "Radius:", layer.getRadius());
          }
        });
        
        // Re-add the normal click handler for subsequent clicks
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
          
          // Store in global array
          drawnCircles.push(newCircle);
          
          console.log("✅ CERCHIO NORMALE INSERITO", newCircle.getLatLng(), "Total circles:", drawnCircles.length);
          
          // Check for all circles after adding a new one
          mapRef.current?.eachLayer((layer) => {
            if (layer instanceof L.Circle) {
              console.log("🟢 CERCHIO PRESENTE DOPO AGGIUNTA:", layer.getLatLng(), "Radius:", layer.getRadius());
            }
          });
          
          // Call the handler function
          handleMapClickArea(e);
        });
      });
    }

    // IMPORTANT: Do NOT clear any layers in this cleanup function
    return () => {
      if (map) {
        map.off('click');
        // DO NOT clear layers or remove circles here
        console.log("🔄 CLEANUP: click handlers removed but circles preserved");
      }
    };
  }, [isAddingSearchArea, handleMapClickArea, mapRef, selectedRadius]);

  return null;
};

export default MapClickHandler;
