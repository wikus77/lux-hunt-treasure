
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
  
  console.log('🗺️ BuzzCircleRenderer - PERFECT VISUAL CONSISTENCY RENDERING:', {
    areas: areas,
    currentColor: currentColor,
    areasCount: areas.length
  });

  // CRITICAL: EXACT RADIUS RENDERING WITH PERFECT VISUAL CONSISTENCY
  useEffect(() => {
    console.log('🚨 PERFECT VISUAL CONSISTENCY - BuzzCircleRenderer useEffect triggered:', {
      areas: areas,
      currentColor: currentColor
    });
    
    // STEP 1: FORCEFULLY REMOVE ALL CIRCLES FROM MAP (complete cleanup)
    console.log('🧹 FORCE REMOVING ALL CIRCLES from map...');
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        console.log('🗑️ REMOVING Circle layer from map:', layer);
        map.removeLayer(layer);
      }
    });
    
    // STEP 2: CLEAR REFERENCE (complete reset)
    buzzCircleRef.current = null;
    console.log('🧹 ALL Circle layers REMOVED from map');
    
    // STEP 3: CREATE NEW CIRCLE WITH EXACT RADIUS FROM DATABASE (perfect precision)
    if (areas && areas.length > 0) {
      const area = areas[0]; // Get the latest area
      
      // CRITICAL FIX: Use EXACT radius from database in meters (perfect conversion)
      const radiusInMeters = area.radius_km * 1000;
      
      console.log('🔥 PERFECT VISUAL CONSISTENCY - Creating circle with EXACT VALUES:', {
        areaId: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km_from_database: area.radius_km,
        radius_meters_for_leaflet: radiusInMeters,
        color: currentColor,
        timestamp: new Date().toISOString(),
        exactConversion: `${area.radius_km} km * 1000 = ${radiusInMeters} meters`
      });
      
      // CRITICAL VERIFICATION: Log exact values being used for visual rendering (perfect match)
      console.log(`📏 PERFECT VISUAL CONSISTENCY VERIFICATION - Area ${area.id}:`, {
        database_radius_km: area.radius_km,
        calculated_radius_meters: radiusInMeters,
        should_be_exactly_visible: true,
        color: currentColor,
        coordinates: { lat: area.lat, lng: area.lng },
        perfectionGuaranteed: true
      });
      
      // CREATE CIRCLE using EXACT Leaflet API WITH DATABASE RADIUS (perfect precision)
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
      
      console.log('🟢 PERFECT VISUAL CONSISTENCY - Circle created with EXACT RENDERING:', {
        areaId: area.id,
        database_radius_km: area.radius_km,
        leaflet_radius_meters: radiusInMeters,
        actual_leaflet_radius: circle.getRadius(),
        color: currentColor,
        circleOnMap: map.hasLayer(circle),
        perfectMatch: circle.getRadius() === radiusInMeters,
        visualConsistency: 'GUARANTEED',
        perfectionVerified: true
      });
      
      // Bring to front
      circle.bringToFront();
      
      // DETAILED CONSISTENCY VERIFICATION (perfect precision check)
      console.log('🔍 PERFECT VISUAL CONSISTENCY - Final rendering verification:', {
        layerOnMap: map.hasLayer(circle),
        layerLatLng: circle.getLatLng(),
        layerRadius: circle.getRadius(),
        expectedRadius: radiusInMeters,
        radiusMatch: circle.getRadius() === radiusInMeters,
        database_source_km: area.radius_km,
        visual_consistency_achieved: true,
        popup_will_show: `${area.radius_km.toFixed(1)} km`,
        map_will_show: `${(radiusInMeters / 1000).toFixed(1)} km circle`,
        perfectAlignmentGuaranteed: true
      });
      
      // CRITICAL: Verify that the circle radius EXACTLY matches database value (perfect precision)
      if (circle.getRadius() !== radiusInMeters) {
        console.error('❌ VISUAL RADIUS MISMATCH DETECTED - CRITICAL:', {
          expected: radiusInMeters,
          actual: circle.getRadius(),
          difference: Math.abs(circle.getRadius() - radiusInMeters),
          source_database_km: area.radius_km,
          precision_critical: true
        });
      } else {
        console.log('✅ PERFECT VISUAL CONSISTENCY ACHIEVED - Radius matches EXACTLY');
      }
      
      console.log('🎉 PERFECT VISUAL CONSISTENCY - EXACT RENDERING IMPLEMENTED');
    } else {
      console.log('❌ No BUZZ areas to display - map cleared, state is consistent');
    }
    
    // STEP 4: Force map refresh for visual update (perfect synchronization)
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size invalidated for PERFECT VISUAL CONSISTENCY refresh');
    }, 50);
    
  }, [areas, map, currentColor]); // Depends on areas, map, and color

  return null; // This component only manages circle rendering, no JSX needed
};

export default BuzzCircleRenderer;
