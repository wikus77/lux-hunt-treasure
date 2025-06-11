
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

  // FIX 4 - Use areas.map(a => a.id).join() instead of JSON.stringify for dependency
  const areasKey = areas.map(a => a.id).join(',');

  useEffect(() => {
    console.debug('🔥 FIX 4 – RENDERING BUZZ AREAS:', areas.length);
    
    // FIX 4 - Clean existing layers properly without isCleanupRunning
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
    }

    // Create new layer group
    layerGroupRef.current = L.layerGroup().addTo(map);

    if (areas.length === 0) {
      console.debug('❌ FIX 4 WARNING - No areas to render');
      return;
    }

    areas.forEach((area, index) => {
      const radiusInMeters = area.radius_km * 1000;
      
      console.log(`🔥 FIX 4 – AREA RENDER: ${radiusInMeters}m (${area.radius_km}km) at lat/lng ${area.lat}, ${area.lng}`);
      console.log(`✅ BUZZ #${index + 1} – Raggio: ${area.radius_km}km – ID area: ${area.id}`);
      
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
        
        console.log(`✅ FIX 4 SUCCESS - Circle added to map for area ${area.id}`);
        
      } catch (error) {
        console.error('❌ FIX 4 ERROR - Error creating circle:', error);
      }
    });

    // Force map refresh
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [areasKey, map]); // Use areasKey instead of areas

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
