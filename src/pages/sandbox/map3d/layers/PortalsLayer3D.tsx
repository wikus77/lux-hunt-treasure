// Portals Layer for MapLibre 3D - Portal markers overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { PORTALS_SEED } from '@/data/portals.seed';
import PortalOverlay from '@/features/living-map/components/PortalOverlay';
import type { PortalDTO } from '@/features/living-map/adapters/readOnlyData';
import { getLivePortals, onPortalsChanged } from '@/features/living-map/adapters/readOnlyData';

interface PortalsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
}

const PortalsLayer3D: React.FC<PortalsLayer3DProps> = ({ map, enabled }) => {
  const [portals, setPortals] = useState<PortalDTO[]>([]);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selectedPortal, setSelectedPortal] = useState<PortalDTO | null>(null);
  const rafRef = React.useRef<number | null>(null);

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

  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      portals.forEach(portal => {
        const point = map.project([portal.lng, portal.lat]);
        newPositions.set(portal.id, { x: point.x, y: point.y });
      });
      setPositions(newPositions);
    };

    const updateOnRender = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePositions);
    };

    updatePositions();
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);
    map.on('render', updateOnRender);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
      map.off('render', updateOnRender);
    };
  }, [map, portals, enabled]);

  useEffect(() => {
    const handlePortalEvent = (e: CustomEvent) => {
      const { type, enabled: filterEnabled } = e.detail;
      console.log(`🌀 Portal filter event: ${type} - ${filterEnabled ? 'VISIBLE' : 'HIDDEN'}`);
    };

    window.addEventListener('M1_PORTAL_FILTER', handlePortalEvent as EventListener);
    return () => window.removeEventListener('M1_PORTAL_FILTER', handlePortalEvent as EventListener);
  }, []);

  if (!enabled || portals.length === 0) return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 11 }}>
        {portals.map((portal) => {
          const pos = positions.get(portal.id);
          if (!pos) return null;

          return (
            <div
              key={portal.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setSelectedPortal(portal)}
            >
              <div
                className="m1-portal-dot"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#00f0ff',
                  boxShadow: '0 0 12px rgba(0,255,255,0.8)',
                  border: '2px solid rgba(0,240,255,0.3)'
                }}
                title={portal.name}
              />
            </div>
          );
        })}
      </div>
      
      <PortalOverlay
        portal={selectedPortal}
        isVisible={!!selectedPortal}
        onClose={() => setSelectedPortal(null)}
      />
    </>
  );
};

export default PortalsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
