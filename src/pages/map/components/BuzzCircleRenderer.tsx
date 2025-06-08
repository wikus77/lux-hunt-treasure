
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
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const isCleanupRunning = useRef(false);
  
  const currentColor = getCurrentColor();
  
  console.log('🗺️ CIRCLE RENDERER: Render triggered with areas:', {
    count: areas.length,
    areas: areas.map(a => ({ id: a.id, radius_km: a.radius_km })),
    color: currentColor,
    cleanupRunning: isCleanupRunning.current
  });

  useEffect(() => {
    // Prevent concurrent cleanup operations
    if (isCleanupRunning.current) {
      console.log('🚫 CIRCLE RENDERER: Cleanup already running, skipping');
      return;
    }
    
    isCleanupRunning.current = true;
    
    console.log('🔥 CIRCLE RENDERER: Effect triggered for', areas.length, 'areas');
    
    // STEP 1: COMPLETE LEAFLET CLEANUP
    console.log('🧹 CIRCLE RENDERER: Starting complete Leaflet cleanup...');
    
    // Clear existing layer group
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      console.log('🗑️ CIRCLE RENDERER: Removed existing layer group');
    }
    
    // Nuclear cleanup of ALL Circle layers from map
    let removedCount = 0;
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        map.removeLayer(layer);
        removedCount++;
      }
      // Also clean LayerGroups that might contain circles
      if (layer instanceof L.LayerGroup) {
        layer.eachLayer((subLayer) => {
          if (subLayer instanceof L.Circle) {
            layer.removeLayer(subLayer);
            removedCount++;
          }
        });
      }
    });
    
    console.log('🧹 CIRCLE RENDERER: Cleaned', removedCount, 'existing circles from map');
    
    // Clear all references
    layerGroupRef.current = null;
    
    // STEP 2: CREATE NEW LAYER GROUP ONLY IF AREAS EXIST
    if (areas && areas.length > 0) {
      console.log('🔵 CIRCLE RENDERER: Creating', areas.length, 'new circles');
      
      // Create new layer group
      layerGroupRef.current = L.layerGroup().addTo(map);
      console.log('✅ CIRCLE RENDERER: New layer group created');
      
      areas.forEach((area, index) => {
        console.log(`🔵 CIRCLE RENDERER: Creating circle ${index + 1}/${areas.length}:`, {
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radius_meters: area.radius_km * 1000
        });
        
        // Validate area data
        if (!area.lat || !area.lng || !area.radius_km || 
            isNaN(area.lat) || isNaN(area.lng) || isNaN(area.radius_km)) {
          console.error('❌ CIRCLE RENDERER: Invalid area data:', area);
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
            className: `buzz-area-${area.id}`
          });
          
          layerGroupRef.current?.addLayer(circle);
          
          console.log(`✅ CIRCLE RENDERER: Circle ${index + 1} created successfully:`, {
            id: area.id,
            radius_km: area.radius_km,
            leaflet_radius_meters: radiusInMeters,
            actual_radius: circle.getRadius(),
            coordinates: circle.getLatLng()
          });
          
        } catch (error) {
          console.error(`❌ CIRCLE RENDERER: Error creating circle ${index + 1}:`, error);
        }
      });
      
      // Set map view to show all circles
      if (layerGroupRef.current) {
        const layers = layerGroupRef.current.getLayers();
        if (layers.length > 0) {
          try {
            const featureGroup = L.featureGroup(layers);
            const bounds = featureGroup.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50] });
              console.log('🎯 CIRCLE RENDERER: Map view updated to show all circles');
            }
          } catch (error) {
            console.warn('⚠️ CIRCLE RENDERER: Could not fit bounds:', error);
            // Fallback to first area
            if (areas[0]) {
              map.setView([areas[0].lat, areas[0].lng], 10);
            }
          }
        }
      }
      
      console.log('🎉 CIRCLE RENDERER: All circles rendered successfully');
      
    } else {
      console.log('❌ CIRCLE RENDERER: No areas to display, using Italy fallback');
      map.setView([41.9028, 12.4964], 6);
    }
    
    // STEP 3: VERIFY FINAL STATE
    const finalCircleCount = layerGroupRef.current?.getLayers().length || 0;
    console.log('🔍 CIRCLE RENDERER: Final verification:', {
      expected_areas: areas.length,
      rendered_circles: finalCircleCount,
      is_consistent: areas.length === finalCircleCount
    });
    
    if (areas.length !== finalCircleCount) {
      console.warn('❗ CIRCLE RENDERER: Inconsistency detected:', {
        expected: areas.length,
        actual: finalCircleCount
      });
    }
    
    // Force map refresh
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 CIRCLE RENDERER: Map size invalidated');
      isCleanupRunning.current = false;
    }, 100);
    
  }, [areas, map, currentColor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
        console.log('🧹 CIRCLE RENDERER: Cleanup on unmount completed');
      }
      isCleanupRunning.current = false;
    };
  }, [map]);

  return null;
};

export default BuzzCircleRenderer;
