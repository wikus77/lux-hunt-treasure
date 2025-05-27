
import React, { useEffect, useRef } from 'react';
import { Circle, useMap } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import L from 'leaflet';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
  buzzCounter?: number; // NEW: Counter for dynamic color
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas, buzzCounter = 0 }) => {
  const map = useMap();
  const previousLayersRef = useRef<L.Circle[]>([]);
  const renderCountRef = useRef(0);
  
  // DYNAMIC COLOR SYSTEM - Neon colors that cycle every 4 generations
  const NEON_COLORS = ['#FFFF00', '#FF00FF', '#00FF00', '#FF66CC']; // Yellow, Pink, Green, Fuchsia
  const getCurrentColor = () => {
    const colorIndex = buzzCounter % 4;
    const selectedColor = NEON_COLORS[colorIndex];
    console.log('🎨 DYNAMIC COLOR - Selected color for generation', buzzCounter + 1, ':', selectedColor, '(index:', colorIndex, ')');
    return selectedColor;
  };
  
  const currentColor = getCurrentColor();
  
  console.log('🗺️ BuzzMapAreas - Rendering BUZZ map areas with DYNAMIC COLOR:', {
    areas: areas,
    buzzCounter: buzzCounter,
    currentColor: currentColor,
    renderCount: ++renderCountRef.current
  });

  // CRITICO: FORZATURA DISTRUZIONE E RICREAZIONE DEL CERCHIO CON COLORE DINAMICO
  useEffect(() => {
    console.log('🚨 CRITICAL FIX - BuzzMapAreas useEffect triggered with DYNAMIC COLOR:', {
      areas: areas,
      buzzCounter: buzzCounter,
      currentColor: currentColor
    });
    
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
    
    // STEP 3: SE CI SONO AREE, CREA NUOVI LAYER FORZATAMENTE CON COLORE DINAMICO
    if (areas && areas.length > 0) {
      console.log('🔥 FORCE CREATING NEW LAYERS with DYNAMIC COLOR:', currentColor);
      
      areas.forEach((area, index) => {
        const radiusInMeters = area.radius_km * 1000;
        console.log(`🎯 FORCE CREATING new layer for area ${area.id} with DYNAMIC COLOR:`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          color: currentColor,
          buzzCounter: buzzCounter,
          timestamp: new Date().toISOString()
        });
        
        // CREA MANUALMENTE il cerchio usando l'API Leaflet diretta CON COLORE DINAMICO
        const circle = L.circle([area.lat, area.lng], {
          radius: radiusInMeters, // VALORE AGGIORNATO DAL DB
          color: currentColor, // COLORE DINAMICO BASATO SU BUZZ COUNTER
          fillColor: currentColor, // COLORE DINAMICO BASATO SU BUZZ COUNTER
          fillOpacity: 0.25,
          weight: 3,
          opacity: 1,
        });
        
        // AGGIUNGI FORZATAMENTE alla mappa
        circle.addTo(map);
        console.log('✅ NEW LAYER with DYNAMIC COLOR FORCEFULLY ADDED to map:', {
          areaId: area.id,
          radius: area.radius_km + ' km',
          color: currentColor,
          buzzGeneration: buzzCounter + 1
        });
        
        // SALVA il riferimento per la prossima distruzione
        previousLayersRef.current.push(circle);
        
        // FORZA il layer in primo piano
        circle.bringToFront();
        
        // LOG DETTAGLIATO per debug con colore
        console.log('🔍 Layer verification with DYNAMIC COLOR:', {
          layerOnMap: map.hasLayer(circle),
          layerLatLng: circle.getLatLng(),
          layerRadius: circle.getRadius(),
          expectedRadius: radiusInMeters,
          layerColor: currentColor,
          buzzGeneration: buzzCounter + 1
        });
      });
      
      console.log('🎉 ALL NEW LAYERS with DYNAMIC COLOR CREATED AND ADDED TO MAP');
    } else {
      console.log('❌ No BUZZ areas to display with DYNAMIC COLOR - map cleared');
    }
    
    // STEP 4: FORZA un refresh della mappa
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size FORCEFULLY invalidated for refresh with DYNAMIC COLOR');
    }, 50);
    
  }, [areas, map, currentColor, buzzCounter]); // DIPENDE da areas, map, colore E buzzCounter

  // RENDERIZZA anche i componenti React-Leaflet con KEY DINAMICA e COLORE DINAMICO
  if (!areas || areas.length === 0) {
    console.log('❌ No BUZZ areas to display with React-Leaflet and DYNAMIC COLOR');
    return null;
  }

  console.log('✅ Rendering', areas.length, 'BUZZ areas with React-Leaflet and DYNAMIC COLOR:', currentColor);

  return (
    <>
      {areas.map((area, index) => {
        const radiusInMeters = area.radius_km * 1000;
        
        console.log(`📏 React-Leaflet rendering area ${area.id} (${index}) with DYNAMIC COLOR:`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          color: currentColor,
          buzzCounter: buzzCounter,
          created_at: area.created_at
        });
        
        // KEY DINAMICA che include RAGGIO E COLORE per forzare re-render quando cambia
        const dynamicKey = `buzz-area-${area.id}-${area.radius_km}-${currentColor}-${buzzCounter}-${area.created_at}-${renderCountRef.current}-${index}`;
        
        return (
          <Circle
            key={dynamicKey} // CRITICO: Key dinamica che include il raggio E il colore
            center={[area.lat, area.lng]}
            radius={radiusInMeters} // VALORE AGGIORNATO DAL DB
            pathOptions={{
              color: currentColor, // COLORE DINAMICO BASATO SU BUZZ COUNTER
              fillColor: currentColor, // COLORE DINAMICO BASATO SU BUZZ COUNTER
              fillOpacity: 0.25,
              weight: 3,
              opacity: 1,
            }}
            className="buzz-map-area"
            eventHandlers={{
              add: (e) => {
                const layer = e.target as L.Circle;
                console.log('✅ React-Leaflet Circle with DYNAMIC COLOR FORCEFULLY added to map:', {
                  id: area.id,
                  radius_km: area.radius_km,
                  radiusInMeters: radiusInMeters,
                  layerRadius: layer.getRadius(),
                  layerLatLng: layer.getLatLng(),
                  color: currentColor,
                  buzzGeneration: buzzCounter + 1,
                  dynamicKey: dynamicKey
                });
                
                layer.bringToFront();
                console.log('🔍 React-Leaflet layer verification with DYNAMIC COLOR:', {
                  isOnMap: map.hasLayer(layer),
                  radiusMatch: layer.getRadius() === radiusInMeters,
                  expectedColor: currentColor
                });
              },
              remove: (e) => {
                console.log('🗑️ React-Leaflet Circle with DYNAMIC COLOR FORCEFULLY removed from map:', {
                  id: area.id,
                  color: currentColor,
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
          filter: drop-shadow(0 0 12px ${currentColor}77);
          animation: buzzGlow 3s infinite ease-in-out;
          z-index: 1000 !important;
        }
        
        @keyframes buzzGlow {
          0% { filter: drop-shadow(0 0 6px ${currentColor}55); }
          50% { filter: drop-shadow(0 0 18px ${currentColor}99); }
          100% { filter: drop-shadow(0 0 6px ${currentColor}55); }
        }
        `}
      </style>
    </>
  );
};

export default BuzzMapAreas;
