
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
  
  // DIAGNOSTIC: Log areas updates with source identification
  useEffect(() => {
    console.debug("🔄 DIAGNOSTIC: AREAS UPDATED in BuzzCircleRenderer:", areas);
    console.debug("📊 DIAGNOSTIC: Areas count received:", areas.length);
    console.debug("📋 DIAGNOSTIC: Areas detail received:", areas.map(a => ({ id: a.id, radius_km: a.radius_km })));
    console.debug("🔍 DIAGNOSTIC: Areas source validation:", {
      areas_isArray: Array.isArray(areas),
      areas_actualLength: areas.length,
      areas_isEmpty: areas.length === 0,
      areas_hasValidStructure: areas.every(a => a.id && a.lat && a.lng && a.radius_km)
    });
  }, [areas]);

  useEffect(() => {
    // PREVENT CONCURRENT CLEANUP
    if (isCleanupRunning.current) {
      console.debug('🚫 DIAGNOSTIC: CIRCLE RENDERER - Cleanup already running, skipping');
      return;
    }
    
    // CRITICAL: Use JSON.stringify for deep comparison
    const currentAreasData = JSON.stringify(areas.map(a => ({ 
      id: a.id, 
      radius_km: a.radius_km, 
      lat: a.lat, 
      lng: a.lng 
    })));
    
    const needsUpdate = currentAreasData !== lastAreasData.current;
    
    console.debug('🔄 DIAGNOSTIC: CIRCLE RENDERER - Update check:', {
      needsUpdate,
      areasCount: areas.length,
      currentAreasData_preview: currentAreasData.substring(0, 100) + '...',
      lastAreasData_preview: lastAreasData.current.substring(0, 100) + '...'
    });
    
    if (!needsUpdate) {
      console.debug('🔄 DIAGNOSTIC: CIRCLE RENDERER - No update needed, areas unchanged');
      return;
    }
    
    isCleanupRunning.current = true;
    lastAreasData.current = currentAreasData;
    
    console.debug('🔥 DIAGNOSTIC: CIRCLE RENDERER - Effect triggered:', {
      areasCount: areas.length,
      needsCleanup: true,
      currentAreasData_length: currentAreasData.length
    });
    
    // STEP 1: COMPLETE LEAFLET CLEANUP (ALWAYS)
    console.debug('🧹 DIAGNOSTIC: CIRCLE RENDERER - Starting COMPLETE Leaflet cleanup...');
    
    // Clear existing layer group
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      console.debug('🗑️ DIAGNOSTIC: CIRCLE RENDERER - Removed existing layer group');
    }
    
    // CRITICAL: Nuclear cleanup of ALL Circles and LayerGroups from map
    let removedCount = 0;
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.LayerGroup) {
        map.removeLayer(layer);
        removedCount++;
      }
    });
    
    console.debug('✅ DIAGNOSTIC: map.clearLayers called');
    console.debug('🧹 DIAGNOSTIC: CIRCLE RENDERER - Cleaned', removedCount, 'existing circles/groups from map');
    
    // Clear all references
    layerGroupRef.current = null;
    
    // STEP 2: CREATE NEW LAYER GROUP ONLY IF AREAS EXIST
    if (areas && areas.length > 0) {
      console.debug('🔵 DIAGNOSTIC: CIRCLE RENDERER - Creating', areas.length, 'new circles');
      console.debug('🔍 DIAGNOSTIC: CIRCLE RENDERER - Areas validation before rendering:', {
        areas_length: areas.length,
        areas_sample: areas[0] || 'No first area',
        all_areas_valid: areas.every(area => 
          area.lat && area.lng && area.radius_km && 
          !isNaN(area.lat) && !isNaN(area.lng) && !isNaN(area.radius_km)
        )
      });
      
      // Create new layer group
      layerGroupRef.current = L.layerGroup().addTo(map);
      console.debug('✅ DIAGNOSTIC: CIRCLE RENDERER - New layer group created');
      
      areas.forEach((area, index) => {
        console.debug(`🔵 DIAGNOSTIC: CIRCLE RENDERER - Creating circle ${index + 1}/${areas.length}:`, {
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          radius_meters: area.radius_km * 1000
        });
        
        // Validate area data
        if (!area.lat || !area.lng || !area.radius_km || 
            isNaN(area.lat) || isNaN(area.lng) || isNaN(area.radius_km)) {
          console.error('❌ DIAGNOSTIC: CIRCLE RENDERER - Invalid area data:', area);
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
          
          console.debug(`✅ DIAGNOSTIC: CIRCLE RENDERER - Circle ${index + 1} created successfully:`, {
            id: area.id,
            radius_km: area.radius_km,
            leaflet_radius_meters: radiusInMeters,
            actual_radius: circle.getRadius(),
            coordinates: circle.getLatLng()
          });
          
        } catch (error) {
          console.error(`❌ DIAGNOSTIC: CIRCLE RENDERER - Error creating circle ${index + 1}:`, error);
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
              console.debug('🎯 DIAGNOSTIC: CIRCLE RENDERER - Map view updated to show all circles');
            }
          } catch (error) {
            console.warn('⚠️ DIAGNOSTIC: CIRCLE RENDERER - Could not fit bounds:', error);
            // Fallback to first area
            if (areas[0]) {
              map.setView([areas[0].lat, areas[0].lng], 10);
            }
          }
        }
      }
      
      console.debug('🎉 DIAGNOSTIC: CIRCLE RENDERER - All circles rendered successfully');
      console.debug('✅ DIAGNOSTIC: map.render() executed with', areas.length, 'areas');
      
    } else {
      console.debug('❌ DIAGNOSTIC: CIRCLE RENDERER - No areas to display, map cleared');
      console.debug('✅ DIAGNOSTIC: map.render() executed with 0 areas');
      console.debug('🔍 DIAGNOSTIC: CIRCLE RENDERER - Empty state validation:', {
        areas_length: areas.length,
        areas_isEmptyArray: Array.isArray(areas) && areas.length === 0,
        map_should_be_clear: true
      });
      map.setView([41.9028, 12.4964], 6);
    }
    
    // STEP 3: VERIFY FINAL STATE and LOG SYNC STATUS
    const finalCircleCount = layerGroupRef.current?.getLayers().length || 0;
    console.debug('🔍 DIAGNOSTIC: CIRCLE RENDERER - Final verification:', {
      expected_areas: areas.length,
      rendered_circles: finalCircleCount,
      is_consistent: areas.length === finalCircleCount,
      areas_empty: areas.length === 0,
      circles_cleared: finalCircleCount === 0,
      leaflet_map_cleared: finalCircleCount === 0 && areas.length === 0
    });
    
    // CRITICAL: Log sync completion status
    if (areas.length === 0 && finalCircleCount === 0) {
      console.debug('✅ DIAGNOSTIC: SYNC COMPLETE - user_map_areas.length === 0 AND leafletLayerGroup.getLayers().length === 0');
    } else if (areas.length === finalCircleCount && areas.length > 0) {
      console.debug('✅ DIAGNOSTIC: SYNC COMPLETE - Areas and circles match perfectly');
    } else {
      console.warn('❗ DIAGNOSTIC: SYNC INCOMPLETE - Inconsistency detected:', {
        expected: areas.length,
        actual: finalCircleCount,
        data_source: 'react-query',
        leaflet_state: 'out-of-sync'
      });
    }
    
    // Force map refresh and mark cleanup as done
    setTimeout(() => {
      map.invalidateSize();
      console.debug('🔄 DIAGNOSTIC: CIRCLE RENDERER - Map size invalidated, cleanup complete');
      isCleanupRunning.current = false;
    }, 100);
    
  }, [JSON.stringify(areas), map, currentColor]); // CRITICAL: Use JSON.stringify for deep comparison

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
        console.debug('🧹 DIAGNOSTIC: CIRCLE RENDERER - Cleanup on unmount completed');
      }
      isCleanupRunning.current = false;
      lastAreasData.current = '';
    };
  }, [map]);

  return null;
};

export default BuzzCircleRenderer;
