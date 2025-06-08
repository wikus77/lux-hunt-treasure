
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
  
  console.log('🗺️ DIAGNOSTIC - BuzzCircleRenderer render:', {
    areas: areas,
    areasCount: areas.length,
    currentColor: currentColor,
    timestamp: new Date().toISOString()
  });

  // NUCLEAR LAYER CLEANUP AND REDRAW
  useEffect(() => {
    console.log('🚨 DIAGNOSTIC - BuzzCircleRenderer useEffect triggered:', {
      areas: areas,
      areasCount: areas.length,
      currentColor: currentColor,
      mapInstance: !!map
    });
    
    // STEP 1: NUCLEAR CLEANUP - Remove ALL Circle layers
    console.log('🔥 DIAGNOSTIC - Starting NUCLEAR CLEANUP of all Circle layers...');
    let removedLayersCount = 0;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        console.log('🗑️ DIAGNOSTIC - Removing Circle layer:', layer.getLatLng(), 'radius:', layer.getRadius());
        map.removeLayer(layer);
        removedLayersCount++;
      }
    });
    
    console.log('🧹 DIAGNOSTIC - NUCLEAR CLEANUP complete, removed layers:', removedLayersCount);
    
    // STEP 2: Clear all references
    buzzCircleRef.current = null;
    
    // STEP 3: Create new circle if areas exist
    if (areas && areas.length > 0) {
      const area = areas[0]; // Get the latest area
      
      console.log('🔥 DIAGNOSTIC - Creating new circle with area data:', {
        areaId: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km_from_database: area.radius_km,
        radius_meters_for_leaflet: area.radius_km * 1000,
        color: currentColor
      });
      
      // Validate coordinates and radius
      if (!area.lat || !area.lng || !area.radius_km || isNaN(area.lat) || isNaN(area.lng) || isNaN(area.radius_km)) {
        console.error('❌ DIAGNOSTIC - Invalid area data, skipping circle creation:', area);
        return;
      }
      
      const radiusInMeters = area.radius_km * 1000;
      
      try {
        const circle = L.circle([area.lat, area.lng], {
          radius: radiusInMeters,
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
        
        console.log('🟢 DIAGNOSTIC - Circle created successfully:', {
          areaId: area.id,
          database_radius_km: area.radius_km,
          leaflet_radius_meters: radiusInMeters,
          actual_leaflet_radius: circle.getRadius(),
          color: currentColor,
          circleOnMap: map.hasLayer(circle),
          perfectMatch: circle.getRadius() === radiusInMeters,
          coordinates: circle.getLatLng()
        });
        
        // Bring to front
        circle.bringToFront();
        
        // Set appropriate view to show the circle
        const bounds = circle.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
        
        console.log('🎉 DIAGNOSTIC - Circle rendering complete and view updated');
      } catch (error) {
        console.error('❌ DIAGNOSTIC - Error creating circle:', error);
        // FALLBACK: Default to Italy center if circle creation fails
        console.log('🔄 DIAGNOSTIC - FALLBACK: Setting map to Italy default center due to circle error');
        map.setView([41.9028, 12.4964], 6);
      }
    } else {
      console.log('❌ DIAGNOSTIC - No areas to display, applying Italy fallback');
      console.log('🔄 DIAGNOSTIC - FALLBACK: Setting map to Italy default center (no areas available)');
      map.setView([41.9028, 12.4964], 6);
    }
    
    // STEP 4: Force map refresh
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 DIAGNOSTIC - Map size invalidated for complete refresh');
    }, 100);
    
  }, [areas, map, currentColor]);

  return null;
};

export default BuzzCircleRenderer;
