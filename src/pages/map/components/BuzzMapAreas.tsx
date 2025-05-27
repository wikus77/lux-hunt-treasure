
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
  console.log('🔍 BuzzMapAreas - Map instance available:', !!map);

  // CRITICO: FORZATURA DISTRUZIONE E RICREAZIONE DEL CERCHIO
  useEffect(() => {
    console.log('🚨 CRITICAL FIX - BuzzMapAreas useEffect triggered with areas:', areas);
    console.log('🗑️ DESTROYING all previous layers:', previousLayersRef.current.length);
    
    // STEP 1: RIMUOVI FORZATAMENTE tutti i layer precedenti dalla mappa
    previousLayersRef.current.forEach((layer, index) => {
      if (map.hasLayer(layer)) {
        console.log(`🗑️ FORCE REMOVING layer ${index} from map`);
        map.removeLayer(layer);
      }
    });
    
    // STEP 2: PULISCI completamente l'array dei layer precedenti
    previousLayersRef.current = [];
    console.log('🧹 ALL previous BUZZ layers FORCEFULLY REMOVED from map');
    
    // STEP 3: SE CI SONO AREE, CREA NUOVI LAYER FORZATAMENTE
    if (areas && areas.length > 0) {
      console.log('🔥 FORCE CREATING NEW LAYERS for areas:', areas.length);
      
      areas.forEach((area, index) => {
        const radiusInMeters = area.radius_km * 1000;
        console.log(`🎯 FORCE CREATING new layer for area ${area.id}:`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          timestamp: new Date().toISOString()
        });
        
        // CREA MANUALMENTE il cerchio usando l'API Leaflet diretta
        const circle = L.circle([area.lat, area.lng], {
          radius: radiusInMeters, // VALORE AGGIORNATO DAL DB
          color: '#00cfff',
          fillColor: '#00cfff',
          fillOpacity: 0.15,
          weight: 3,
          opacity: 1,
        });
        
        // AGGIUNGI FORZATAMENTE alla mappa
        circle.addTo(map);
        console.log('✅ NEW LAYER FORCEFULLY ADDED to map for area:', area.id, 'with radius:', area.radius_km, 'km');
        
        // SALVA il riferimento per la prossima distruzione
        previousLayersRef.current.push(circle);
        
        // FORZA il layer in primo piano
        circle.bringToFront();
        
        // LOG DETTAGLIATO per debug
        console.log('🔍 Layer verification:', {
          layerOnMap: map.hasLayer(circle),
          layerLatLng: circle.getLatLng(),
          layerRadius: circle.getRadius(),
          expectedRadius: radiusInMeters
        });
      });
      
      console.log('🎉 ALL NEW LAYERS CREATED AND ADDED TO MAP');
    } else {
      console.log('❌ No BUZZ areas to display - map cleared');
    }
    
    // STEP 4: FORZA un refresh della mappa
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size FORCEFULLY invalidated for refresh');
    }, 50);
    
  }, [areas, map]); // DIPENDE da areas E map per triggerare ad ogni cambiamento

  // RENDERIZZA anche i componenti React-Leaflet con KEY DINAMICA per forzare re-render
  if (!areas || areas.length === 0) {
    console.log('❌ No BUZZ areas to display with React-Leaflet');
    return null;
  }

  console.log('✅ Rendering', areas.length, 'BUZZ areas with React-Leaflet');

  return (
    <>
      {areas.map((area, index) => {
        const radiusInMeters = area.radius_km * 1000;
        
        console.log(`📏 React-Leaflet rendering area ${area.id} (${index}):`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          created_at: area.created_at
        });
        
        // KEY DINAMICA che include RAGGIO per forzare re-render quando cambia
        const dynamicKey = `buzz-area-${area.id}-${area.radius_km}-${area.created_at}-${renderCountRef.current}-${index}`;
        
        return (
          <Circle
            key={dynamicKey} // CRITICO: Key dinamica che include il raggio
            center={[area.lat, area.lng]}
            radius={radiusInMeters} // VALORE AGGIORNATO DAL DB
            pathOptions={{
              color: '#00cfff',
              fillColor: '#00cfff',
              fillOpacity: 0.15,
              weight: 3,
              opacity: 1,
            }}
            className="buzz-map-area"
            eventHandlers={{
              add: (e) => {
                const layer = e.target as L.Circle;
                console.log('✅ React-Leaflet Circle FORCEFULLY added to map:', {
                  id: area.id,
                  radius_km: area.radius_km,
                  radiusInMeters: radiusInMeters,
                  layerRadius: layer.getRadius(),
                  layerLatLng: layer.getLatLng(),
                  dynamicKey: dynamicKey
                });
                
                layer.bringToFront();
                console.log('🔍 React-Leaflet layer verification:', {
                  isOnMap: map.hasLayer(layer),
                  radiusMatch: layer.getRadius() === radiusInMeters
                });
              },
              remove: (e) => {
                console.log('🗑️ React-Leaflet Circle FORCEFULLY removed from map:', {
                  id: area.id,
                  dynamicKey: dynamicKey
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
