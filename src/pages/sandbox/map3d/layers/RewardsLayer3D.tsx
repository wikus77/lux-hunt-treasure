// Rewards Layer for MapLibre 3D - Reward markers overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';
import ClaimRewardModal from '@/components/marker-rewards/ClaimRewardModal';

interface RewardMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  claimed?: boolean; // Se true, marker diventa VIOLA
}

interface RewardsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  markers?: RewardMarker[];
  userPosition?: { lat: number; lng: number };
  isAdmin?: boolean; // Admin vede SEMPRE tutti i marker
}

// 🎯 ZOOM MINIMO per vedere i marker reward (utente deve essere molto vicino)
const MIN_ZOOM_FOR_REWARDS = 17;

const RewardsLayer3D: React.FC<RewardsLayer3DProps> = ({ map, enabled, markers = [], userPosition, isAdmin = false }) => {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(0);
  const { rewards } = useMarkerRewards(selectedMarker);
  const rafRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      markers.forEach(marker => {
        const point = map.project([marker.lng, marker.lat]);
        newPositions.set(marker.id, { x: point.x, y: point.y });
      });
      setPositions(newPositions);
      setCurrentZoom(map.getZoom());
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
  }, [map, markers, enabled]);

  // 🎯 Non mostrare nulla se layer disabilitato
  if (!enabled || markers.length === 0) return null;
  
  // 🟣 Marker VIOLA (riscattati) → SEMPRE visibili a qualsiasi zoom
  // 🟢 Marker VERDI (non riscattati) → solo con zoom >= MIN_ZOOM_FOR_REWARDS
  const visibleMarkers = markers.filter(m => 
    m.claimed || currentZoom >= MIN_ZOOM_FOR_REWARDS
  );
  
  if (visibleMarkers.length === 0) return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 660 }}>
        {visibleMarkers // 🎯 VIOLA sempre visibili, VERDI solo da vicino
          .map((marker) => {
            const pos = positions.get(marker.id);
            if (!pos) return null;

            return (
              <div
                key={marker.id}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => setSelectedMarker(marker.id)}
              >
                <div
                  className="m1-reward-marker"
                  style={{
                    width: marker.claimed ? 12 : 10,
                    height: marker.claimed ? 12 : 10,
                    borderRadius: '50%',
                    // 🎯 VERDE = non riscattato, VIOLA = riscattato
                    background: marker.claimed ? '#8B5CF6' : '#10b981',
                    border: '2px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: marker.claimed 
                      ? '0 0 8px 2px rgba(139, 92, 246, 0.8), 0 0 16px 4px rgba(139, 92, 246, 0.4)'
                      : '0 0 8px 2px rgba(16, 185, 129, 0.8), 0 0 16px 4px rgba(16, 185, 129, 0.4)',
                    animation: marker.claimed ? 'none' : 'rewardPulse 2s ease-in-out infinite'
                  }}
                  title={marker.claimed ? `${marker.title || 'Reward'} (Riscattato)` : marker.title || 'Reward'}
                />
              </div>
            );
          })}
      </div>

      {selectedMarker && rewards.length > 0 && (
        <ClaimRewardModal
          isOpen={true}
          onClose={() => setSelectedMarker(null)}
          markerId={selectedMarker}
          rewards={rewards}
        />
      )}
    </>
  );
};

export default RewardsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
