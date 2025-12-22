// @ts-nocheck
// Portals Layer for MapLibre 3D - Portal markers using native MapLibre markers
// 🔥 FIX: Converted from HTML overlay to native markers for perfect map sync
import React, { useEffect, useState, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { PORTALS_SEED } from '@/data/portals.seed';
import { PortalBehaviorOverlay } from '@/components/portals/PortalBehaviorOverlay';
import type { PortalDTO } from '@/features/living-map/adapters/readOnlyData';
import { getLivePortals, onPortalsChanged } from '@/features/living-map/adapters/readOnlyData';
import { getPortalBehavior } from '@/config/portalsConfig';

interface PortalsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
}

// 🔥 PORTAL DISCOVERY: Portals only visible at zoom >= 10 (must zoom in to discover)
const MIN_ZOOM_FOR_PORTALS = 10;

const PortalsLayer3D: React.FC<PortalsLayer3DProps> = ({ map, enabled }) => {
  const [portals, setPortals] = useState<PortalDTO[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<PortalDTO | null>(null);
  const [isZoomSufficient, setIsZoomSufficient] = useState(false);
  const mapRef = useRef<MLMap | null>(null);
  
  // 🔥 Native MapLibre markers ref for cleanup
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  
  // Keep map ref updated for camera effects
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // 🔥 ZOOM CONTROL: Show/hide portals based on zoom level
  useEffect(() => {
    if (!map) return;

    const checkZoom = () => {
      const zoom = map.getZoom();
      setIsZoomSufficient(zoom >= MIN_ZOOM_FOR_PORTALS);
    };

    // Initial check
    checkZoom();

    // Listen to zoom changes
    map.on('zoom', checkZoom);

    return () => {
      try {
        map.off('zoom', checkZoom);
      } catch (e) {
        // Map may be destroyed
      }
    };
  }, [map]);

  useEffect(() => {
    if (!enabled) return;

    // Load live portals from mock/DB
    getLivePortals().then(livePortals => {
      // Merge with seed portals (convert seed format to PortalDTO)
      const seedPortals: PortalDTO[] = PORTALS_SEED.map(p => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        name: p.name,
        status: 'active' as const,
        intensity: 75,
        lastUpdate: new Date().toISOString()
      }));
      setPortals([...livePortals, ...seedPortals]);
    });

    const unsubscribe = onPortalsChanged(setPortals);
    return () => unsubscribe();
  }, [enabled]);

  // 🔥 FIX: Use native MapLibre markers for perfect map sync (no floating!)
  useEffect(() => {
    if (!map || !enabled) return;

    // 🔥 ZOOM CHECK: Hide all markers if zoom is too low
    if (!isZoomSufficient) {
      markersRef.current.forEach(marker => {
        try {
          marker.getElement().style.display = 'none';
        } catch (e) {}
      });
      return;
    }

    const currentPortalIds = new Set(portals.map(p => p.id));
    
    // Remove markers that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!currentPortalIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    portals.forEach(portal => {
      const existingMarker = markersRef.current.get(portal.id);
      
      // Get portal behavior for color coding
      const behavior = getPortalBehavior(portal.id);
      const portalColor = behavior?.type === 'SHADOW_RED_ZONE' || 
                          behavior?.type === 'SHADOW_INTERFERENCE' ||
                          behavior?.type === 'GATEWAY_ZERO' ||
                          behavior?.type === 'LOST_FREQUENCY'
        ? '#FF3366' // SHADOW portals: red
        : behavior?.type === 'ECHO_ARCHIVE'
        ? '#9966FF' // ECHO portal: purple
        : '#00f0ff'; // MCP portals: cyan (default)
      
      if (existingMarker) {
        // Update position of existing marker and show it
        existingMarker.setLngLat([portal.lng, portal.lat]);
        existingMarker.getElement().style.display = 'block';
      } else {
        // Create new marker element
        const el = document.createElement('div');
        el.className = 'maplibre-portal-marker';
        el.style.cssText = `
          cursor: pointer;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${portalColor};
          box-shadow: 0 0 14px ${portalColor};
          border: 2px solid ${portalColor}40;
        `;
        el.title = portal.name;
        
        // Click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedPortal(portal);
        });
        
        // Create native MapLibre marker
        const marker = new maplibregl.Marker({ 
          element: el,
          anchor: 'center'
        })
          .setLngLat([portal.lng, portal.lat])
          .addTo(map);
        
        markersRef.current.set(portal.id, marker);
      }
    });

    // Cleanup function
    return () => {
      try {
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            // Marker already removed
          }
        });
        markersRef.current.clear();
      } catch (e) {
        // Silent cleanup
      }
    };
  }, [map, portals, enabled, isZoomSufficient]);

  useEffect(() => {
    const handlePortalEvent = (e: CustomEvent) => {
      const { type, enabled: filterEnabled } = e.detail;
      console.log(`🌀 Portal filter event: ${type} - ${filterEnabled ? 'VISIBLE' : 'HIDDEN'}`);
    };

    window.addEventListener('M1_PORTAL_FILTER', handlePortalEvent as EventListener);
    return () => window.removeEventListener('M1_PORTAL_FILTER', handlePortalEvent as EventListener);
  }, []);

  // Only render the overlay, markers are added directly to the map
  return (
    <PortalBehaviorOverlay
      portal={selectedPortal}
      isVisible={!!selectedPortal}
      onClose={() => setSelectedPortal(null)}
      mapRef={mapRef}
    />
  );
};

export default PortalsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
