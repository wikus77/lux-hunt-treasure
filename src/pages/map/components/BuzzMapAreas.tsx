
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
  const renderCountRef = useRef(0);
  
  console.log('🗺️ BuzzMapAreas - Rendering BUZZ map areas:', areas);
  console.log('🔢 BuzzMapAreas - Render count:', ++renderCountRef.current);

  // CRITICO: Gestione completa dei layer
  useEffect(() => {
    console.log('🔄 BuzzMapAreas useEffect triggered with areas:', areas);
    console.log('🗑️ Current layers to remove:', previousLayersRef.current.length);
    
    // Rimuovi tutti i layer precedenti dalla mappa
    previousLayersRef.current.forEach((layer, index) => {
      if (map.hasLayer(layer)) {
        console.log(`🗑️ Removing layer ${index} from map`);
        map.removeLayer(layer);
      }
    });
    
    // Pulisci l'array dei layer precedenti
    previousLayersRef.current = [];
    
    console.log('🗑️ All previous BUZZ layers REMOVED from map');
    
    // Forza un refresh della mappa
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size invalidated for refresh');
    }, 50);
    
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
        
        console.log(`📏 Rendering area ${area.id} (${index}):`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          created_at: area.created_at
        });
        
        // Key unica per forzare re-render completo
        const uniqueKey = `buzz-area-${area.id}-${area.created_at}-${renderCountRef.current}-${index}`;
        
        return (
          <Circle
            key={uniqueKey}
            center={[area.lat, area.lng]}
            radius={radiusInMeters} // CRITICO: Converti km in metri per Leaflet
            pathOptions={{
              color: '#00cfff', // Neon blu M1SSION
              fillColor: '#00cfff',
              fillOpacity: 0.15,
              weight: 3,
              opacity: 1, // Sempre visibile al 100%
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
                  layerRadius: layer.getRadius(),
                  layerLatLng: layer.getLatLng(),
                  uniqueKey: uniqueKey
                });
                
                // Forza il layer in primo piano
                layer.bringToFront();
              },
              remove: (e) => {
                console.log('🗑️ BUZZ layer removed from map:', {
                  id: area.id,
                  uniqueKey: uniqueKey
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
          z-index: 1000 !important;
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
