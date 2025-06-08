
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
  const lastAreasData = useRef<string>('');
  
  const currentColor = getCurrentColor();
  
  // CRITICAL: Log areas updates
  useEffect(() => {
    console.debug("🔄 AREAS UPDATED:", areas);
    console.debug("📊 Areas count:", areas.length);
    console.debug("📋 Areas detail:", areas.map(a => ({ id: a.id, radius_km: a.radius_km })));
  }, [areas]);

  useEffect(() => {
    // PREVENT CONCURRENT CLEANUP
    if (isCleanupRunning.current) {
      console.debug('🚫 CIRCLE RENDERER: Cleanup already running, skipping');
      return;
    }
    
    // CRITICAL: Use deep comparison for areas data
    const currentAreasData = JSON.stringify(areas.map(a => ({ 
      id: a.id, 
      radius_km: a.radius_km, 
      lat: a.lat, 
      lng: a.lng 
    })));
    
    const needsUpdate = currentAreasData !== lastAreasData.current;
    
    if (!needsUpdate) {
      console.debug('🔄 CIRCLE RENDERER: No update needed, areas unchanged');
      return;
    }
    
    isCleanupRunning.current = true;
    lastAreasData.current = currentAreasData;
    
    console.debug('🔥 CIRCLE RENDERER: Effect triggered', {
      areasCount: areas.length,
      needsCleanup: true,
      currentAreasData
    });
    
    // STEP 1: COMPLETE LEAFLET CLEANUP (ALWAYS)
    console.debug('🧹 CIRCLE RENDERER: Starting COMPLETE Leaflet cleanup...');
    
    // Clear existing layer group
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      console.debug('🗑️ CIRCLE RENDERER: Removed existing layer group');
    }
    
    // CRITICAL: Nuclear cleanup of ALL Circles and LayerGroups from map
    let removedCount = 0;
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.LayerGroup) {
        map.removeLayer(layer);
        removedCount++;
      }
    });
    
    console.debug('🧹 CIRCLE RENDERER: Cleaned', removedCount, 'existing circles/groups from map');
    
    // Clear all references
    layerGroupRef.current = null;
    
    // STEP 2: CREATE NEW LAYER GROUP ONLY IF AREAS EXIST
    if (areas && areas.length > 0) {
      console.debug('🔵 CIRCLE RENDERER: Creating', areas.length, 'new circles');
      
      // Create new layer group
      layerGroupRef.current = L.layerGroup().addTo(map);
      console.debug('✅ CIRCLE RENDERER: New layer group created');
      
      areas.forEach((area, index) => {
        console.debug(`🔵 CIRCLE RENDERER: Creating circle ${index + 1}/${areas.length}:`, {
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
          
          console.debug(`✅ CIRCLE RENDERER: Circle ${index + 1} created successfully:`, {
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
              console.debug('🎯 CIRCLE RENDERER: Map view updated to show all circles');
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
      
      console.debug('🎉 CIRCLE RENDERER: All circles rendered successfully');
      
    } else {
      console.debug('❌ CIRCLE RENDERER: No areas to display, map cleared');
      map.setView([41.9028, 12.4964], 6);
    }
    
    // STEP 3: VERIFY FINAL STATE and LOG SYNC STATUS
    const finalCircleCount = layerGroupRef.current?.getLayers().length || 0;
    console.debug('🔍 CIRCLE RENDERER: Final verification:', {
      expected_areas: areas.length,
      rendered_circles: finalCircleCount,
      is_consistent: areas.length === finalCircleCount,
      areas_empty: areas.length === 0,
      circles_cleared: finalCircleCount === 0
    });
    
    // CRITICAL: Log sync completion status
    if (areas.length === 0 && finalCircleCount === 0) {
      console.debug('✅ SYNC COMPLETE: user_map_areas.length === 0 AND leafletLayerGroup.getLayers().length === 0');
    } else if (areas.length === finalCircleCount) {
      console.debug('✅ SYNC COMPLETE: Areas and circles match perfectly');
    } else {
      console.warn('❗ SYNC INCOMPLETE: Inconsistency detected:', {
        expected: areas.length,
        actual: finalCircleCount
      });
    }
    
    // Force map refresh and mark cleanup as done
    setTimeout(() => {
      map.invalidateSize();
      console.debug('🔄 CIRCLE RENDERER: Map size invalidated, cleanup complete');
      isCleanupRunning.current = false;
    }, 100);
    
  }, [JSON.stringify(areas), map, currentColor]); // CRITICAL: Use JSON.stringify for deep comparison

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
        console.debug('🧹 CIRCLE RENDERER: Cleanup on unmount completed');
      }
      isCleanupRunning.current = false;
      lastAreasData.current = '';
    };
  }, [map]);

  return null;
};

export default BuzzCircleRenderer;
