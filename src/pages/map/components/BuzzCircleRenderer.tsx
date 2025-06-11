
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
  const currentMapView = useRef<{ center: L.LatLng; zoom: number } | null>(null);
  
  const currentColor = getCurrentColor();
  
  // Store current map view before any changes
  useEffect(() => {
    currentMapView.current = {
      center: map.getCenter(),
      zoom: map.getZoom()
    };
  }, [map]);
  
  // CRITICAL: Block rendering if areas are present when they shouldn't be
  useEffect(() => {
    if (areas.length > 0) {
      console.debug("🔍 RENDER CHECK (FIXED CENTER): Areas present in component:", {
        areas_count: areas.length,
        areas_detail: areas.map(a => ({ 
          id: a.id, 
          user_id: a.user_id, 
          radius_km: a.radius_km, 
          radius_meters: a.radius_km * 1000,
          lat: a.lat, 
          lng: a.lng 
        })),
        source: 'react-query',
        fixed_center_mode: true
      });
    } else {
      console.debug("✅ RENDER CHECK (FIXED CENTER): No areas to render - clean state");
    }
  }, [areas]);

  useEffect(() => {
    // PREVENT CONCURRENT CLEANUP
    if (isCleanupRunning.current) {
      console.debug('🚫 Cleanup already running, skipping');
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
    
    console.debug('🔄 Update check (FIXED CENTER):', {
      needsUpdate,
      areasCount: areas.length,
      source: 'react-query-only',
      fixed_center_mode: true
    });
    
    if (!needsUpdate) {
      console.debug('🔄 No update needed, areas unchanged');
      return;
    }
    
    isCleanupRunning.current = true;
    lastAreasData.current = currentAreasData;
    
    console.debug('🔥 Effect triggered (FIXED CENTER):', {
      areasCount: areas.length,
      data_source: 'react-query-only',
      fixed_center_mode: true
    });
    
    // STEP 1: COMPLETE LEAFLET CLEANUP (ALWAYS) - ENHANCED
    console.debug('🧹 Starting COMPLETE Leaflet cleanup...');
    
    // Clear existing layer group
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      console.debug('🗑️ Removed existing layer group');
    }
    
    // CRITICAL: Nuclear cleanup of ALL Circles and LayerGroups from map
    let removedCount = 0;
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.LayerGroup) {
        map.removeLayer(layer);
        removedCount++;
      }
    });
    
    console.debug('🧹 Cleaned', removedCount, 'existing circles/groups from map');
    
    // Clear all references
    layerGroupRef.current = null;
    
    // CRITICAL BLOCKING: Stop render if areas is empty - ENHANCED
    if (areas.length === 0) {
      console.debug('✅ RENDER COMPLETE (FIXED CENTER) - areas.length === 0, map cleared completely');
      // DO NOT CHANGE MAP VIEW - maintain current position and zoom
      isCleanupRunning.current = false;
      
      // CRITICAL: Additional check for any remaining circles after cleanup
      let remainingCircles = 0;
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          remainingCircles++;
        }
      });
      
      if (remainingCircles > 0) {
        console.warn('⚠️ CLEANUP WARNING: Found', remainingCircles, 'remaining circles after cleanup');
        // Force additional cleanup
        map.eachLayer((layer) => {
          if (layer instanceof L.Circle) {
            map.removeLayer(layer);
          }
        });
      } else {
        console.debug('✅ CLEANUP VERIFIED: No remaining circles on map');
      }
      
      return;
    }
    
    // CRITICAL: Only proceed with rendering if areas are truly valid
    console.debug('🔵 Creating', areas.length, 'new circles with FIXED CENTER');
    
    // Create new layer group
    layerGroupRef.current = L.layerGroup().addTo(map);
    console.debug('✅ New layer group created');
    
    areas.forEach((area, index) => {
      console.debug(`🔵 Creating circle ${index + 1}/${areas.length} (FIXED CENTER):`, {
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        radius_meters: area.radius_km * 1000
      });
      
      // Validate area data
      if (!area.lat || !area.lng || !area.radius_km || 
          isNaN(area.lat) || isNaN(area.lng) || isNaN(area.radius_km)) {
        console.error('❌ Invalid area data:', area);
        return;
      }
      
      const radiusInMeters = area.radius_km * 1000;
      
      try {
        // FORCE AREA GENERATION: Create circle with exact radius
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
        
        // DEBUG VISUAL MANDATORY
        console.log("▶️ layer created:", true);
        console.log("✅ Area creata con raggio:", radiusInMeters, "m, generazione:", index + 1);
        
        console.debug(`✅ Circle ${index + 1} created successfully (FIXED CENTER)`);
        
      } catch (error) {
        console.error(`❌ Error creating circle ${index + 1}:`, error);
        console.log("▶️ layer created:", false);
      }
    });
    
    // CRITICAL: DO NOT CHANGE MAP VIEW - maintain current view
    console.debug('🔒 MAINTAINING CURRENT MAP VIEW - No fitBounds or setView called');
    
    // STEP 3: VERIFY FINAL STATE - ENHANCED
    const finalCircleCount = layerGroupRef.current?.getLayers().length || 0;
    console.debug('🔍 Final verification (FIXED CENTER):', {
      expected_areas: areas.length,
      rendered_circles: finalCircleCount,
      is_consistent: areas.length === finalCircleCount,
      areas_empty: areas.length === 0,
      circles_cleared: finalCircleCount === 0,
      view_preserved: true
    });
    
    // CRITICAL: Log any inconsistencies
    if (areas.length !== finalCircleCount) {
      console.warn('⚠️ INCONSISTENCY DETECTED:', {
        expected: areas.length,
        actual: finalCircleCount,
        difference: areas.length - finalCircleCount
      });
    }
    
    // Force map refresh and mark cleanup as done (without changing view)
    setTimeout(() => {
      map.invalidateSize();
      console.debug('🔄 Map size invalidated, cleanup complete (FIXED CENTER)');
      isCleanupRunning.current = false;
    }, 100);
    
  }, [JSON.stringify(areas), map, currentColor]);

  // Cleanup on unmount - ENHANCED
  useEffect(() => {
    return () => {
      console.debug('🧹 Component unmounting - starting cleanup...');
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
        console.debug('🧹 Cleanup on unmount completed');
      }
      isCleanupRunning.current = false;
      lastAreasData.current = '';
    };
  }, [map]);

  return null;
};

export default BuzzCircleRenderer;
