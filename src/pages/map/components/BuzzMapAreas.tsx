
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import L from 'leaflet';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
  buzzCounter?: number; // For dynamic color calculation
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas, buzzCounter = 0 }) => {
  const map = useMap();
  const buzzCircleRef = useRef<L.Circle | null>(null);
  
  // DYNAMIC COLOR SYSTEM - Neon colors that cycle every 4 generations
  const NEON_COLORS = ['#FFFF00', '#FF00FF', '#00FF00', '#FF66CC']; // Yellow, Pink, Green, Fuchsia
  const NEON_COLOR_NAMES = ['GIALLO NEON', 'ROSA NEON', 'VERDE NEON', 'FUCSIA NEON'];
  
  const getCurrentColor = () => {
    const colorIndex = buzzCounter % 4;
    const selectedColor = NEON_COLORS[colorIndex];
    console.log('🎨 DYNAMIC COLOR - Selected color for generation', buzzCounter + 1, ':', selectedColor, '(index:', colorIndex, ')');
    return selectedColor;
  };
  
  const getCurrentColorName = () => {
    const colorIndex = buzzCounter % 4;
    return NEON_COLOR_NAMES[colorIndex];
  };
  
  const currentColor = getCurrentColor();
  const currentColorName = getCurrentColorName();
  
  console.log('🗺️ BuzzMapAreas - DIRECT LEAFLET RENDERING with UPDATED RADIUS:', {
    areas: areas,
    buzzCounter: buzzCounter,
    currentColor: currentColor,
    currentColorName: currentColorName
  });

  // CRITICAL: DIRECT LEAFLET API RENDERING - FORCED DESTRUCTION AND RECREATION
  useEffect(() => {
    console.log('🚨 DIRECT LEAFLET - BuzzMapAreas useEffect triggered:', {
      areas: areas,
      buzzCounter: buzzCounter,
      currentColor: currentColor,
      currentColorName: currentColorName
    });
    
    // STEP 1: FORCEFULLY REMOVE ALL CIRCLES FROM MAP (not just buzz circles)
    console.log('🧹 FORCE REMOVING ALL CIRCLES from map using DIRECT LEAFLET API...');
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        console.log('🗑️ FORCE REMOVING Circle layer from map:', layer);
        map.removeLayer(layer);
      }
    });
    
    // STEP 2: CLEAR REFERENCE
    buzzCircleRef.current = null;
    console.log('🧹 ALL Circle layers FORCEFULLY REMOVED from map');
    
    // STEP 3: IF THERE ARE AREAS, CREATE NEW CIRCLE USING DIRECT LEAFLET API
    if (areas && areas.length > 0) {
      const area = areas[0]; // Get the latest area
      const radiusInMeters = area.radius_km * 1000;
      
      console.log('🔥 DIRECT LEAFLET - FORCE CREATING new circle with UPDATED RADIUS and DYNAMIC COLOR:', {
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        radiusInMeters: radiusInMeters,
        color: currentColor,
        colorName: currentColorName,
        buzzCounter: buzzCounter,
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL RADIUS VERIFICATION
      console.log(`📏 DIRECT LEAFLET RADIUS VERIFICATION - Area ${area.id}:`, {
        radius_km_from_db: area.radius_km,
        radius_meters_calculated: radiusInMeters,
        should_be_different_from_previous: true,
        color: currentColor,
        colorName: currentColorName
      });
      
      // CREATE CIRCLE using DIRECT Leaflet API WITH UPDATED RADIUS AND COLOR
      const circle = L.circle([area.lat, area.lng], {
        radius: radiusInMeters, // UPDATED VALUE FROM DB
        color: currentColor, // DYNAMIC COLOR
        fillColor: currentColor, // DYNAMIC COLOR
        fillOpacity: 0.25,
        weight: 3,
        opacity: 1,
        className: 'buzz-map-area-direct' // For identification
      });
      
      // FORCEFULLY ADD to map
      circle.addTo(map);
      buzzCircleRef.current = circle;
      
      console.log('🟢 DIRECT LEAFLET - Cerchio BUZZ ridisegnato:', {
        areaId: area.id,
        radius_km: area.radius_km,
        radius_meters: radiusInMeters,
        color: currentColor,
        colorName: currentColorName,
        buzzGeneration: buzzCounter + 1,
        circleOnMap: map.hasLayer(circle)
      });
      
      // FORCE layer to front
      circle.bringToFront();
      
      // DETAILED LOG for radius verification
      console.log('🔍 DIRECT LEAFLET - Final circle verification:', {
        layerOnMap: map.hasLayer(circle),
        layerLatLng: circle.getLatLng(),
        layerRadius: circle.getRadius(),
        expectedRadius: radiusInMeters,
        layerColor: currentColor,
        colorName: currentColorName,
        radiusMatch: circle.getRadius() === radiusInMeters,
        buzzGeneration: buzzCounter + 1
      });
      
      console.log('🎉 DIRECT LEAFLET - NEW CIRCLE with UPDATED RADIUS AND COLOR CREATED AND ADDED TO MAP');
    } else {
      console.log('❌ No BUZZ areas to display - map cleared');
    }
    
    // STEP 4: FORCE a map refresh
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size FORCEFULLY invalidated for refresh with DIRECT LEAFLET');
    }, 50);
    
  }, [areas, map, currentColor, buzzCounter]); // Depends on areas, map, color AND buzzCounter

  // DEBUG OVERLAY - Visual confirmation of current values
  const debugOverlay = areas.length > 0 ? (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        border: `2px solid ${currentColor}`,
        boxShadow: `0 0 10px ${currentColor}50`
      }}
    >
      <div>🎯 BUZZ AREA DEBUG</div>
      <div>AREA: {areas[0].radius_km.toFixed(1)} km</div>
      <div>COLORE: {currentColorName}</div>
      <div>GENERAZIONE: {buzzCounter + 1}</div>
      <div>COORDINATE: {areas[0].lat.toFixed(4)}, {areas[0].lng.toFixed(4)}</div>
      <div style={{ color: currentColor }}>████ {currentColor}</div>
    </div>
  ) : null;

  // Return debug overlay and glow style
  return (
    <>
      {debugOverlay}
      
      <style>
        {`
        .buzz-map-area-direct {
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
