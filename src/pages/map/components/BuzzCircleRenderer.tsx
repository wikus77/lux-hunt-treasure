
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
  
  console.log('🗺️ BuzzCircleRenderer - EXACT RADIUS RENDERING:', {
    areas: areas,
    currentColor: currentColor
  });

  // CRITICAL: EXACT RADIUS RENDERING WITH PERFECT VISUAL CONSISTENCY
  useEffect(() => {
    console.log('🚨 EXACT RADIUS - BuzzCircleRenderer useEffect triggered:', {
      areas: areas,
      currentColor: currentColor
    });
    
    // STEP 1: FORCEFULLY REMOVE ALL CIRCLES FROM MAP
    console.log('🧹 FORCE REMOVING ALL CIRCLES from map...');
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        console.log('🗑️ REMOVING Circle layer from map:', layer);
        map.removeLayer(layer);
      }
    });
    
    // STEP 2: CLEAR REFERENCE
    buzzCircleRef.current = null;
    console.log('🧹 ALL Circle layers REMOVED from map');
    
    // STEP 3: CREATE NEW CIRCLE WITH EXACT RADIUS FROM DATABASE
    if (areas && areas.length > 0) {
      const area = areas[0]; // Get the latest area
      
      // CRITICAL FIX: Use EXACT radius from database in meters
      const radiusInMeters = area.radius_km * 1000;
      
      console.log('🔥 EXACT RADIUS - Creating circle with PRECISE VALUES:', {
        areaId: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km_from_database: area.radius_km,
        radius_meters_calculated: radiusInMeters,
        color: currentColor,
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL VERIFICATION: Log exact values being used
      console.log(`📏 EXACT RADIUS VERIFICATION - Area ${area.id}:`, {
        database_radius_km: area.radius_km,
        calculated_radius_meters: radiusInMeters,
        should_be_exact_match: true,
        color: currentColor
      });
      
      // CREATE CIRCLE using EXACT Leaflet API WITH DATABASE RADIUS
      const circle = L.circle([area.lat, area.lng], {
        radius: radiusInMeters, // EXACT VALUE FROM DATABASE
        color: currentColor,
        fillColor: currentColor,
        fillOpacity: 0.25,
        weight: 3,
        opacity: 1,
        className: 'buzz-map-area-exact-radius' // For identification
      });
      
      // Add to map
      circle.addTo(map);
      buzzCircleRef.current = circle;
      
      console.log('🟢 EXACT RADIUS - Circle created with PRECISE CONSISTENCY:', {
        areaId: area.id,
        database_radius_km: area.radius_km,
        leaflet_radius_meters: radiusInMeters,
        actual_leaflet_radius: circle.getRadius(),
        color: currentColor,
        circleOnMap: map.hasLayer(circle),
        perfectMatch: circle.getRadius() === radiusInMeters
      });
      
      // Bring to front
      circle.bringToFront();
      
      // DETAILED CONSISTENCY VERIFICATION
      console.log('🔍 EXACT RADIUS - Final consistency verification:', {
        layerOnMap: map.hasLayer(circle),
        layerLatLng: circle.getLatLng(),
        layerRadius: circle.getRadius(),
        expectedRadius: radiusInMeters,
        radiusMatch: circle.getRadius() === radiusInMeters,
        database_source: area.radius_km,
        visual_consistency: true
      });
      
      // CRITICAL: Verify that the circle radius exactly matches database value
      if (circle.getRadius() !== radiusInMeters) {
        console.error('❌ RADIUS MISMATCH DETECTED:', {
          expected: radiusInMeters,
          actual: circle.getRadius(),
          difference: Math.abs(circle.getRadius() - radiusInMeters),
          source_database_km: area.radius_km
        });
      } else {
        console.log('✅ PERFECT RADIUS CONSISTENCY ACHIEVED');
      }
      
      console.log('🎉 EXACT RADIUS - PERFECT VISUAL CONSISTENCY IMPLEMENTED');
    } else {
      console.log('❌ No BUZZ areas to display - map cleared');
    }
    
    // STEP 4: Force map refresh for visual update
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size invalidated for EXACT RADIUS refresh');
    }, 50);
    
  }, [areas, map, currentColor]); // Depends on areas, map, and color

  return null; // This component only manages circle rendering, no JSX needed
};

export default BuzzCircleRenderer;
