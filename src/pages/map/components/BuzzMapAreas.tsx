
import React, { useEffect, useRef } from 'react';
import { Circle, useMap } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import L from 'leaflet';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas }) => {
  const map = useMap();
  const previousLayersRef = useRef<L.Circle[]>([]);
  
  console.log('🗺️ BuzzMapAreas - Rendering BUZZ map areas:', areas);

  // CRITICO: Rimuovi tutti i layer precedenti prima di renderizzare la nuova area
  useEffect(() => {
    console.log('🔄 BuzzMapAreas useEffect triggered with areas:', areas);
    
    // Rimuovi tutti i layer precedenti dalla mappa
    previousLayersRef.current.forEach(layer => {
      if (map.hasLayer(layer)) {
        console.log('🗑️ Removing previous layer from map');
        map.removeLayer(layer);
      }
    });
    
    // Pulisci l'array dei layer precedenti
    previousLayersRef.current = [];
    
    console.log('🗑️ All previous BUZZ layers REMOVED from map');
  }, [areas, map]);

  // Se non ci sono aree da mostrare, non renderizzare nulla
  if (!areas || areas.length === 0) {
    console.log('❌ No BUZZ areas to display');
    return null;
  }

  console.log('✅ Rendering', areas.length, 'BUZZ areas');

  return (
    <>
      {areas.map((area, index) => {
        // CONVERSIONE CORRETTA: radius_km → metri per Leaflet
        const radiusInMeters = area.radius_km * 1000;
        
        console.log(`📏 Rendering area ${area.id}:`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          created_at: area.created_at
        });
        
        return (
          <Circle
            key={`buzz-area-${area.id}-${area.created_at}-${index}`} // Key unica per forzare re-render
            center={[area.lat, area.lng]}
            radius={radiusInMeters} // CRITICO: Converti km in metri per Leaflet
            pathOptions={{
              color: '#00cfff', // Neon blu M1SSION
              fillColor: '#00cfff',
              fillOpacity: 0.15,
              weight: 3,
              opacity: 1, // Sempre visibile al 100% - solo UNA area mostrata
            }}
            className="buzz-map-area"
            eventHandlers={{
              add: (e) => {
                // Salva il riferimento al layer appena aggiunto
                const layer = e.target as L.Circle;
                previousLayersRef.current.push(layer);
                console.log('✅ NEW BUZZ layer added to map:', {
                  id: area.id,
                  radius_km: area.radius_km,
                  radiusInMeters: radiusInMeters,
                  layerRadius: layer.getRadius()
                });
              }
            }}
          />
        );
      })}
      
      <style>
        {`
        .buzz-map-area {
          filter: drop-shadow(0 0 12px rgba(0, 207, 255, 0.7));
          animation: buzzGlow 3s infinite ease-in-out;
        }
        
        @keyframes buzzGlow {
          0% { filter: drop-shadow(0 0 6px rgba(0, 207, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 18px rgba(0, 207, 255, 0.9)); }
          100% { filter: drop-shadow(0 0 6px rgba(0, 207, 255, 0.5)); }
        }
        `}
      </style>
    </>
  );
};

export default BuzzMapAreas;
