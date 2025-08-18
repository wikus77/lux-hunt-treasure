// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ

import React, { useEffect, useState, Suspense } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { fetchActiveMarkers, type MapMarker } from '@/lib/fetchMarkers';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';

// Lazy per performance: il modal si carica solo quando serve
const ClaimRewardModal = React.lazy(() => import('@/components/marker-rewards/ClaimRewardModal'));

export const QRMarkers: React.FC = () => {
  // Marker caricati da Supabase (view buzz_map_markers → { id, title, latitude, longitude })
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Hook ricompense (esistente)
  const { rewards, fetchRewards } = useMarkerRewards();

  // Carica i marker al mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.debug('M1MARK-TRACE', { step: 'MARKER_FETCH_START' });
        const data = await fetchActiveMarkers();
        if (alive) setMarkers(data);
        console.debug('M1MARK-TRACE', { step: 'MARKER_FETCH_END', count: data.length });
      } catch (e) {
        console.error('MARKER_FETCH_ERROR', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Quando seleziono un marker, carico i rewards
  useEffect(() => {
    if (selectedMarkerId) {
      fetchRewards(selectedMarkerId);
    }
  }, [selectedMarkerId, fetchRewards]);

  const openClaimFor = (markerId: string) => {
    setSelectedMarkerId(markerId);
  };

  const handleClaimSuccess = (nextRoute?: string) => {
    if (nextRoute) {
      window.location.assign(nextRoute);
      return;
    }
    setSelectedMarkerId(null);
  };

  const handleModalClose = () => {
    setSelectedMarkerId(null);
  };

  if (loading) return null;

  return (
    <>
      {markers.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]}>
          <Popup>
            <div className="text-sm space-y-2">
              <div className="font-semibold">{m.title}</div>
              <button
                data-testid="claim-reward-cta"
                onClick={() => openClaimFor(m.id)}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-black hover:opacity-90"
              >
                Riscatta
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedMarkerId && rewards.length > 0 && (
        <Suspense fallback={<div>Loading…</div>}>
          <ClaimRewardModal
            isOpen={true}
            onClose={handleModalClose}
            markerId={selectedMarkerId}
            rewards={rewards}
            onSuccess={handleClaimSuccess}
          />
        </Suspense>
      )}
    </>
  );
};

export default QRMarkers;