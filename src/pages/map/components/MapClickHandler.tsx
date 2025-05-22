
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

    // Remove any existing click handlers
    map.off('click');

    // Only add click handler if we're in area adding mode
    if (isAddingSearchArea) {
      console.log("Adding click handler to map, radius:", selectedRadius);
      
      // Use once to ensure handler is triggered only once
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        console.log("Map clicked at:", lat, lng);
        
        // Draw circle immediately on the map
        if (mapRef.current) {
          const circle = L.circle([lat, lng], {
            radius: selectedRadius,
            color: '#00BFFF',
            fillOpacity: 0.4,
          }).addTo(mapRef.current);
          
          console.log("✅ CERCHIO INSERITO SU MAPPA");
          
          // Debug: check all circles on the map
          mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Circle) {
              console.log("👁️ CERCHIO TROVATO", layer.getLatLng());
            }
          });
        }
        
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
