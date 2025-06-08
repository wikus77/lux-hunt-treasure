
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
  
  console.log('🗺️ BuzzCircleRenderer - COMPLETE LAYER MANAGEMENT:', {
    areas: areas,
    currentColor: currentColor,
    areasCount: areas.length
  });

  // CRITICAL: COMPLETE LAYER MANAGEMENT WITH NUCLEAR CLEANUP
  useEffect(() => {
    console.log('🚨 COMPLETE LAYER MANAGEMENT - BuzzCircleRenderer useEffect triggered:', {
      areas: areas,
      currentColor: currentColor
    });
    
    // STEP 1: NUCLEAR CLEANUP - Remove ALL layers from map
    console.log('🔥 NUCLEAR CLEANUP - Removing ALL layers from map...');
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        console.log('🗑️ REMOVING Circle layer from map:', layer);
        map.removeLayer(layer);
      }
    });
    
    // STEP 2: CLEAR ALL REFERENCES
    buzzCircleRef.current = null;
    console.log('🧹 ALL Circle layers REMOVED from map - NUCLEAR CLEANUP COMPLETE');
    
    // STEP 3: CREATE NEW CIRCLE WITH DATABASE RADIUS OR APPLY FALLBACK
    if (areas && areas.length > 0) {
      const area = areas[0]; // Get the latest area
      
      // CRITICAL FIX: Use EXACT radius from DATABASE in meters
      const radiusInMeters = area.radius_km * 1000;
      
      console.log('🔥 COMPLETE LAYER MANAGEMENT - Creating circle with DATABASE VALUES:', {
        areaId: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km_from_database: area.radius_km,
        radius_meters_for_leaflet: radiusInMeters,
        color: currentColor,
        timestamp: new Date().toISOString()
      });
      
      // CREATE CIRCLE using EXACT Leaflet API WITH DATABASE RADIUS
      try {
        const circle = L.circle([area.lat, area.lng], {
          radius: radiusInMeters, // EXACT VALUE FROM DATABASE
          color: currentColor,
          fillColor: currentColor,
          fillOpacity: 0.25,
          weight: 3,
          opacity: 1,
          className: 'buzz-map-area-database-radius'
        });
        
        // Add to map
        circle.addTo(map);
        buzzCircleRef.current = circle;
        
        console.log('🟢 COMPLETE LAYER MANAGEMENT - Circle created with DATABASE RENDERING:', {
          areaId: area.id,
          database_radius_km: area.radius_km,
          leaflet_radius_meters: radiusInMeters,
          actual_leaflet_radius: circle.getRadius(),
          color: currentColor,
          circleOnMap: map.hasLayer(circle),
          perfectMatch: circle.getRadius() === radiusInMeters,
          layerManagement: 'COMPLETE'
        });
        
        // Bring to front
        circle.bringToFront();
        
        // VERIFICATION - Ensure radius matches database exactly
        if (circle.getRadius() !== radiusInMeters) {
          console.error('❌ LAYER RADIUS MISMATCH DETECTED:', {
            expected: radiusInMeters,
            actual: circle.getRadius(),
            difference: Math.abs(circle.getRadius() - radiusInMeters),
            source_database_km: area.radius_km
          });
        } else {
          console.log('✅ COMPLETE LAYER MANAGEMENT VERIFIED - Radius matches DATABASE exactly');
        }
        
        // Set appropriate view to show the circle
        const bounds = circle.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
        
        console.log('🎉 COMPLETE LAYER MANAGEMENT - DATABASE RENDERING IMPLEMENTED');
      } catch (error) {
        console.error('❌ Error creating circle:', error);
        // FALLBACK: Default to Italy center if circle creation fails
        console.log('🔄 FALLBACK: Setting map to Italy default center due to circle error');
        map.setView([41.9028, 12.4964], 6);
      }
    } else {
      console.log('❌ No BUZZ areas to display - APPLYING ITALY FALLBACK');
      // CRITICAL FALLBACK: Set default view to prevent grey map
      console.log('🔄 FALLBACK: Setting map to Italy default center (no areas available)');
      map.setView([41.9028, 12.4964], 6);
    }
    
    // STEP 4: Force map refresh for complete synchronization
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 Map size invalidated for COMPLETE LAYER MANAGEMENT refresh');
    }, 100);
    
  }, [areas, map, currentColor]);

  return null;
};

export default BuzzCircleRenderer;
