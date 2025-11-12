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
}

interface RewardsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  markers?: RewardMarker[];
}

const RewardsLayer3D: React.FC<RewardsLayer3DProps> = ({ map, enabled, markers = [] }) => {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const { rewards } = useMarkerRewards(selectedMarker);

  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      markers.forEach(marker => {
        const point = map.project([marker.lng, marker.lat]);
        newPositions.set(marker.id, { x: point.x, y: point.y });
      });
      setPositions(newPositions);
    };

    updatePositions();
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
    };
  }, [map, markers, enabled]);

  if (!enabled || markers.length === 0) return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 12 }}>
        {markers.map((marker) => {
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
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 0 15px rgba(255,215,0,0.8)',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
                title={marker.title || 'Reward'}
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
