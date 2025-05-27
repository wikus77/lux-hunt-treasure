
import React, { useEffect, useRef } from 'react';
import { Circle, useMap } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import L from 'leaflet';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
  buzzCounter?: number; // For dynamic color calculation
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
  
  console.log('🗺️ BuzzMapAreas - Rendering BUZZ map areas with UPDATED RADIUS:', {
    areas: areas,
    buzzCounter: buzzCounter,
    currentColor: currentColor,
    renderCount: ++renderCountRef.current
  });

  // CRITICAL: FORCED DESTRUCTION AND RECREATION OF CIRCLE WITH UPDATED RADIUS
  useEffect(() => {
    console.log('🚨 CRITICAL RADIUS FIX - BuzzMapAreas useEffect triggered:', {
      areas: areas,
      buzzCounter: buzzCounter,
      currentColor: currentColor
    });
    
    // STEP 1: FORCEFULLY REMOVE ALL PREVIOUS BUZZ LAYERS FROM MAP
    console.log('🧹 FORCE REMOVING ALL BUZZ LAYERS from map...');
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle && layer.options.className === 'buzz-map-area') {
        console.log('🗑️ FORCE REMOVING BUZZ layer from map:', layer);
        map.removeLayer(layer);
      }
    });
    
    // STEP 2: CLEAR PREVIOUS LAYERS ARRAY
    previousLayersRef.current = [];
    console.log('🧹 ALL previous BUZZ layers FORCEFULLY REMOVED from map');
    
    // STEP 3: IF THERE ARE AREAS, CREATE NEW LAYERS FORCEFULLY WITH UPDATED RADIUS
    if (areas && areas.length > 0) {
      console.log('🔥 FORCE CREATING NEW LAYERS with UPDATED RADIUS and DYNAMIC COLOR:', currentColor);
      
      areas.forEach((area, index) => {
        const radiusInMeters = area.radius_km * 1000;
        console.log(`🎯 CRITICAL RADIUS - FORCE CREATING new layer for area ${area.id}:`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          color: currentColor,
          buzzCounter: buzzCounter,
          timestamp: new Date().toISOString()
        });
        
        // VERIFY RADIUS IS UPDATED
        console.log(`📏 RADIUS VERIFICATION - Area ${area.id} radius:`, {
          radius_km_from_db: area.radius_km,
          radius_meters_calculated: radiusInMeters,
          should_be_different_from_previous: true
        });
        
        // CREATE MANUALLY the circle using direct Leaflet API WITH UPDATED RADIUS
        const circle = L.circle([area.lat, area.lng], {
          radius: radiusInMeters, // UPDATED VALUE FROM DB
          color: currentColor, // DYNAMIC COLOR
          fillColor: currentColor, // DYNAMIC COLOR
          fillOpacity: 0.25,
          weight: 3,
          opacity: 1,
          className: 'buzz-map-area' // For identification
        });
        
        // FORCEFULLY ADD to map
        circle.addTo(map);
        console.log('✅ NEW LAYER with UPDATED RADIUS FORCEFULLY ADDED to map:', {
          areaId: area.id,
          radius_km: area.radius_km,
          radius_meters: radiusInMeters,
          color: currentColor,
          buzzGeneration: buzzCounter + 1
        });
        
        // SAVE reference for next destruction
        previousLayersRef.current.push(circle);
        
        // FORCE layer to front
        circle.bringToFront();
        
        // DETAILED LOG for radius verification
        console.log('🔍 RADIUS Layer verification:', {
          layerOnMap: map.hasLayer(circle),
          layerLatLng: circle.getLatLng(),
          layerRadius: circle.getRadius(),
          expectedRadius: radiusInMeters,
          layerColor: currentColor,
          radiusMatch: circle.getRadius() === radiusInMeters,
          buzzGeneration: buzzCounter + 1
        });
      });
      
      console.log('🎉 ALL NEW LAYERS with UPDATED RADIUS CREATED AND ADDED TO MAP');
    } else {
      console.log('❌ No BUZZ areas to display - map cleared');
    }
    
    // STEP 4: FORCE a map refresh
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size FORCEFULLY invalidated for refresh with UPDATED RADIUS');
    }, 50);
    
  }, [areas, map, currentColor, buzzCounter]); // Depends on areas, map, color AND buzzCounter

  // RENDER React-Leaflet components with DYNAMIC KEY and UPDATED RADIUS
  if (!areas || areas.length === 0) {
    console.log('❌ No BUZZ areas to display with React-Leaflet');
    return null;
  }

  console.log('✅ Rendering', areas.length, 'BUZZ areas with React-Leaflet and UPDATED RADIUS');

  return (
    <>
      {areas.map((area, index) => {
        const radiusInMeters = area.radius_km * 1000;
        
        console.log(`📏 CRITICAL RADIUS - React-Leaflet rendering area ${area.id} (${index}):`, {
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radiusInMeters: radiusInMeters,
          color: currentColor,
          buzzCounter: buzzCounter,
          created_at: area.created_at
        });
        
        // CRITICAL: DYNAMIC KEY that includes RADIUS AND COLOR AND TIMESTAMP to force re-render
        const dynamicKey = `buzz-area-${area.id}-${area.radius_km}-${currentColor}-${buzzCounter}-${area.created_at}-${renderCountRef.current}-${index}-${Date.now()}`;
        
        return (
          <Circle
            key={dynamicKey} // CRITICAL: Dynamic key including radius and timestamp for forced re-render
            center={[area.lat, area.lng]}
            radius={radiusInMeters} // UPDATED VALUE FROM DB
            pathOptions={{
              color: currentColor, // DYNAMIC COLOR
              fillColor: currentColor, // DYNAMIC COLOR
              fillOpacity: 0.25,
              weight: 3,
              opacity: 1,
              className: 'buzz-map-area' // For identification
            }}
            eventHandlers={{
              add: (e) => {
                const layer = e.target as L.Circle;
                console.log('✅ RADIUS VERIFICATION - React-Leaflet Circle FORCEFULLY added to map:', {
                  id: area.id,
                  radius_km: area.radius_km,
                  radiusInMeters: radiusInMeters,
                  layerRadius: layer.getRadius(),
                  layerLatLng: layer.getLatLng(),
                  color: currentColor,
                  radiusMatch: layer.getRadius() === radiusInMeters,
                  buzzGeneration: buzzCounter + 1,
                  dynamicKey: dynamicKey
                });
                
                layer.bringToFront();
                console.log('🔍 FINAL RADIUS VERIFICATION:', {
                  isOnMap: map.hasLayer(layer),
                  radiusCorrect: layer.getRadius() === radiusInMeters,
                  expectedColor: currentColor,
                  actualRadius: layer.getRadius(),
                  expectedRadius: radiusInMeters
                });
              },
              remove: (e) => {
                console.log('🗑️ React-Leaflet Circle FORCEFULLY removed from map:', {
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
