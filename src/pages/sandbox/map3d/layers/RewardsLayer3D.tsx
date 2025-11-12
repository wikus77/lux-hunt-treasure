// Rewards Layer for MapLibre 3D - Reward markers overlay (indizi)
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ClaimRewardModal from '@/components/marker-rewards/ClaimRewardModal';

interface DbRewardMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  active: boolean;
  visible_from?: string;
  visible_to?: string;
}

interface RewardsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  markers?: DbRewardMarker[]; // Dev mocks override
  userPosition?: { lat: number; lng: number } | null;
}

const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RewardsLayer3D: React.FC<RewardsLayer3DProps> = ({ 
  map, 
  enabled, 
  markers: markersProp,
  userPosition 
}) => {
  const [rewardMarkers, setRewardMarkers] = useState<DbRewardMarker[]>([]);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const { rewards } = useMarkerRewards(selectedMarker);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Load reward markers from DB (or use dev mocks)
  useEffect(() => {
    if (!enabled) return;

    // If markers prop provided (dev mocks), use directly
    if (markersProp) {
      setRewardMarkers(markersProp);
      return;
    }

    // Production: load from Supabase
    let mounted = true;

    const isVisibleNow = (m: DbRewardMarker) => {
      const now = Date.now();
      const fromOk = !m.visible_from || new Date(m.visible_from).getTime() <= now;
      const toOk = !m.visible_to || new Date(m.visible_to).getTime() >= now;
      return fromOk && toOk && m.active !== false;
    };

    const load = async () => {
      if (!isAuthenticated) {
        console.warn('⚠️ Not authenticated - skipping indizi load');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('markers')
          .select('id, lat, lng, title, active, visible_from, visible_to')
          .eq('active', true)
          .limit(2000);

        if (error) {
          console.error('[RewardsLayer3D] RLS error loading indizi:', error);
          if (error.code === 'PGRST301') {
            toast.warning('Accedi per vedere gli indizi', {
              description: 'I marker degli indizi richiedono autenticazione',
              duration: 5000
            });
          }
          throw error;
        }

        if (!mounted) return;
        const visible = (data || []).filter(isVisibleNow);
        setRewardMarkers(visible);
        console.log('✅ Loaded indizi:', visible.length);
      } catch (e) {
        console.error('[RewardsLayer3D] Reward markers load error', e);
      }
    };

    load();

    // Realtime updates
    const channel = supabase
      .channel('markers-changes-3d')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'markers' }, (payload) => {
        if (!isAuthenticated) return;

        setRewardMarkers((prev) => {
          const current = [...prev];
          if (payload.eventType === 'INSERT') {
            const m = payload.new as DbRewardMarker;
            return isVisibleNow(m) ? [...current, m] : current;
          }
          if (payload.eventType === 'UPDATE') {
            const m = payload.new as DbRewardMarker;
            const idx = current.findIndex((x) => x.id === m.id);
            if (idx >= 0) {
              if (isVisibleNow(m)) {
                current[idx] = m;
                return [...current];
              }
              current.splice(idx, 1);
              return [...current];
            }
            return isVisibleNow(m) ? [...current, m] : current;
          }
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as any)?.id as string;
            return current.filter((x) => x.id !== id);
          }
          return current;
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [enabled, isAuthenticated, markersProp]);

  // Update screen positions
  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      rewardMarkers.forEach(marker => {
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
  }, [map, rewardMarkers, enabled]);

  if (!enabled || rewardMarkers.length === 0) return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 660 }}>
        {rewardMarkers.map((marker) => {
          const pos = positions.get(marker.id);
          if (!pos) return null;

          // GREEN REWARDS visible only when distance < 90m
          const distance = userPosition
            ? distanceMeters(userPosition.lat, userPosition.lng, marker.lat, marker.lng)
            : Infinity;
          const shouldShow = distance < 90;

          if (!shouldShow) return null;

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
                className="reward-marker"
                data-layer="rewards"
                data-reward-id={marker.id}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 0 8px 2px rgba(16, 185, 129, 0.8), 0 0 16px 4px rgba(16, 185, 129, 0.4)',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease'
                }}
                title={`💎 ${marker.title}`}
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
