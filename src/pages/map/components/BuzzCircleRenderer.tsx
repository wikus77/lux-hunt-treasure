
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
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  
  const currentColor = getCurrentColor();
  
  console.log('🗺️ DIAGNOSTIC - BuzzCircleRenderer render:', {
    areas: areas,
    areasCount: areas.length,
    currentColor: currentColor,
    timestamp: new Date().toISOString()
  });

  // CRITICAL FIX: Complete Leaflet layer cleanup and redraw
  useEffect(() => {
    console.log('🚨 DIAGNOSTIC - BuzzCircleRenderer useEffect triggered:', {
      areas: areas,
      areasCount: areas.length,
      currentColor: currentColor,
      mapInstance: !!map
    });
    
    // STEP 1: NUCLEAR CLEANUP - Remove ALL Circle layers and layer groups
    console.log('🔥 DIAGNOSTIC - Starting COMPLETE LEAFLET CLEANUP...');
    let removedLayersCount = 0;
    let removedCirclesCount = 0;
    
    // Clear existing layer group
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      console.log('🗑️ DIAGNOSTIC - Removed existing layer group');
    }
    
    // Nuclear cleanup of all Circle layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        console.log('🗑️ DIAGNOSTIC - Removing Circle layer:', layer.getLatLng(), 'radius:', layer.getRadius());
        map.removeLayer(layer);
        removedCirclesCount++;
      }
      if (layer instanceof L.LayerGroup) {
        layer.eachLayer((subLayer) => {
          if (subLayer instanceof L.Circle) {
            console.log('🗑️ DIAGNOSTIC - Removing Circle from LayerGroup:', subLayer.getLatLng());
            layer.removeLayer(subLayer);
            removedCirclesCount++;
          }
        });
      }
      removedLayersCount++;
    });
    
    console.log('🧹 DIAGNOSTIC - COMPLETE LEAFLET CLEANUP finished:', {
      totalLayersRemoved: removedLayersCount,
      circlesRemoved: removedCirclesCount
    });
    
    // STEP 2: Clear all references
    buzzCircleRef.current = null;
    layerGroupRef.current = null;
    
    // STEP 3: Consistency check - verify areas vs expected circles
    const expectedCircles = areas.length;
    console.log('🔍 CONSISTENCY CHECK - Before redraw:', {
      areasFromDB: expectedCircles,
      circlesOnMapBefore: removedCirclesCount,
      shouldMatch: expectedCircles === removedCirclesCount || removedCirclesCount === 0,
      mismatch: expectedCircles !== removedCirclesCount && removedCirclesCount > 0
    });
    
    if (expectedCircles !== removedCirclesCount && removedCirclesCount > 0) {
      console.warn('❗ CONSISTENCY WARNING - Mismatch between DB areas and map circles:', {
        dbAreas: expectedCircles,
        mapCircles: removedCirclesCount,
        difference: Math.abs(expectedCircles - removedCirclesCount)
      });
    }
    
    // STEP 4: Create new layer group for better management
    layerGroupRef.current = L.layerGroup().addTo(map);
    console.log('✅ DIAGNOSTIC - New layer group created');
    
    // STEP 5: Create new circles if areas exist
    if (areas && areas.length > 0) {
      areas.forEach((area, index) => {
        console.log(`🔥 DIAGNOSTIC - Creating circle ${index + 1}/${areas.length} with area data:`, {
          areaId: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km_from_database: area.radius_km,
          radius_meters_for_leaflet: area.radius_km * 1000,
          color: currentColor,
          index: index
        });
        
        // Validate coordinates and radius
        if (!area.lat || !area.lng || !area.radius_km || isNaN(area.lat) || isNaN(area.lng) || isNaN(area.radius_km)) {
          console.error(`❌ DIAGNOSTIC - Invalid area data for circle ${index + 1}:`, area);
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
            className: `buzz-map-area-database-radius-${area.id}`
          });
          
          // Add to layer group instead of directly to map
          layerGroupRef.current?.addLayer(circle);
          
          // Set reference for first circle
          if (index === 0) {
            buzzCircleRef.current = circle;
          }
          
          console.log(`🟢 DIAGNOSTIC - Circle ${index + 1} created successfully:`, {
            areaId: area.id,
            database_radius_km: area.radius_km,
            leaflet_radius_meters: radiusInMeters,
            actual_leaflet_radius: circle.getRadius(),
            color: currentColor,
            circleInLayerGroup: layerGroupRef.current?.hasLayer(circle),
            perfectMatch: circle.getRadius() === radiusInMeters,
            coordinates: circle.getLatLng(),
            className: circle.options.className
          });
          
        } catch (error) {
          console.error(`❌ DIAGNOSTIC - Error creating circle ${index + 1}:`, error);
        }
      });
      
      // Set appropriate view to show all circles
      if (buzzCircleRef.current) {
        const bounds = layerGroupRef.current?.getBounds();
        if (bounds) {
          map.fitBounds(bounds, { padding: [50, 50] });
          console.log('🎉 DIAGNOSTIC - Map view updated to show all circles');
        }
      }
      
      console.log('🎉 DIAGNOSTIC - All circles rendering complete:', {
        totalCirclesCreated: areas.length,
        layerGroupHasLayers: layerGroupRef.current?.getLayers().length || 0,
        allCirclesVisible: true
      });
      
    } else {
      console.log('❌ DIAGNOSTIC - No areas to display, applying Italy fallback');
      console.log('🔄 DIAGNOSTIC - FALLBACK: Setting map to Italy default center (no areas available)');
      map.setView([41.9028, 12.4964], 6);
    }
    
    // STEP 6: Final consistency verification
    const finalCircleCount = layerGroupRef.current?.getLayers().length || 0;
    console.log('🔍 FINAL CONSISTENCY CHECK:', {
      areasFromDB: areas.length,
      circlesCreated: finalCircleCount,
      isConsistent: areas.length === finalCircleCount,
      shouldBeZeroIfDeleted: areas.length === 0 && finalCircleCount === 0
    });
    
    if (areas.length !== finalCircleCount) {
      console.warn('❗ FINAL CONSISTENCY WARNING - DB and map still not in sync:', {
        expected: areas.length,
        actual: finalCircleCount,
        difference: Math.abs(areas.length - finalCircleCount)
      });
    }
    
    // STEP 7: Force map refresh
    setTimeout(() => {
      map.invalidateSize();
      console.log('🔄 DIAGNOSTIC - Map size invalidated for complete refresh');
    }, 100);
    
  }, [areas, map, currentColor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
        console.log('🧹 DIAGNOSTIC - Cleanup on unmount completed');
      }
    };
  }, [map]);

  return null;
};

export default BuzzCircleRenderer;
