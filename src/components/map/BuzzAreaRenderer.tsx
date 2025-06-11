
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface BuzzArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
}

interface BuzzAreaRendererProps {
  areas: BuzzArea[];
}

const BuzzAreaRenderer: React.FC<BuzzAreaRendererProps> = ({ areas }) => {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    console.debug('🔵 Rendering buzz areas:', areas.length);
    
    // Clear existing layers
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
    }

    // Create new layer group
    layerGroupRef.current = L.layerGroup().addTo(map);

    if (areas.length === 0) {
      console.debug('✅ No areas to render');
      return;
    }

    areas.forEach((area, index) => {
      const radiusInMeters = area.radius_km * 1000;
      
      console.log("🟢 AREA RENDER:", radiusInMeters, "lat/lng", area.lat, area.lng);
      
      try {
        const circle = L.circle([area.lat, area.lng], {
          radius: radiusInMeters,
          color: '#00D1FF',
          fillColor: '#00D1FF',
          fillOpacity: 0.25,
          weight: 3,
          opacity: 1
        });

        if (layerGroupRef.current) {
          layerGroupRef.current.addLayer(circle);
        }

        console.log("✅ Area creata con raggio:", radiusInMeters, "m, generazione:", index + 1);
        console.log("▶️ layer created:", true);
        
      } catch (error) {
        console.error('❌ Error creating circle:', error);
        console.log("▶️ layer created:", false);
      }
    });

    // Force map refresh
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [areas, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map]);

  return null;
};

export default BuzzAreaRenderer;
