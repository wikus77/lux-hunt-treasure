
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import L from 'leaflet';
import { getCurrentColor } from './BuzzColorManager';

interface BuzzCircleRendererProps {
  areas: BuzzMapArea[];
}

const BuzzCircleRenderer: React.FC<BuzzCircleRendererProps> = ({ areas }) => {
  const map = useMap();
  const buzzCircleRef = useRef<L.Circle | null>(null);
  
  const currentColor = getCurrentColor();
  
  console.log('🗺️ BuzzCircleRenderer - DIRECT LEAFLET RENDERING with FIXED COLOR:', {
    areas: areas,
    currentColor: currentColor
  });

  // CRITICAL: DIRECT LEAFLET API RENDERING - FORCED DESTRUCTION AND RECREATION
  useEffect(() => {
    console.log('🚨 DIRECT LEAFLET - BuzzCircleRenderer useEffect triggered:', {
      areas: areas,
      currentColor: currentColor
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
      
      console.log('🔥 DIRECT LEAFLET - FORCE CREATING new circle with UPDATED RADIUS and FIXED NEON COLOR:', {
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        radiusInMeters: radiusInMeters,
        color: currentColor,
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL RADIUS VERIFICATION
      console.log(`📏 DIRECT LEAFLET RADIUS VERIFICATION - Area ${area.id}:`, {
        radius_km_from_db: area.radius_km,
        radius_meters_calculated: radiusInMeters,
        should_be_different_from_previous: true,
        color: currentColor
      });
      
      // CREATE CIRCLE using DIRECT Leaflet API WITH UPDATED RADIUS AND FIXED COLOR
      const circle = L.circle([area.lat, area.lng], {
        radius: radiusInMeters, // UPDATED VALUE FROM DB
        color: currentColor, // FIXED NEON CYAN COLOR
        fillColor: currentColor, // FIXED NEON CYAN COLOR
        fillOpacity: 0.25,
        weight: 3,
        opacity: 1,
        className: 'buzz-map-area-direct' // For identification
      });
      
      // FORCEFULLY ADD to map
      circle.addTo(map);
      buzzCircleRef.current = circle;
      
      console.log('🟢 DIRECT LEAFLET - Cerchio BUZZ ridisegnato con COLORE FISSO:', {
        areaId: area.id,
        radius_km: area.radius_km,
        radius_meters: radiusInMeters,
        color: currentColor,
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
        radiusMatch: circle.getRadius() === radiusInMeters,
        fixedColorApplied: true
      });
      
      console.log('🎉 DIRECT LEAFLET - NEW CIRCLE with UPDATED RADIUS AND FIXED NEON COLOR CREATED AND ADDED TO MAP');
    } else {
      console.log('❌ No BUZZ areas to display - map cleared');
    }
    
    // STEP 4: FORCE a map refresh
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size FORCEFULLY invalidated for refresh with DIRECT LEAFLET');
    }, 50);
    
  }, [areas, map, currentColor]); // Depends on areas, map, and fixed color

  return null; // This component only manages circle rendering, no JSX needed
};

export default BuzzCircleRenderer;
