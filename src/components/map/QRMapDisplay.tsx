// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Marker, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

const ClaimRewardModal = lazy(() => import('@/components/marker-rewards/ClaimRewardModal'));

type Item = { id: string; lat: number; lng: number; title?: string; active?: boolean; };

export default function QRMapDisplay() {
  const map = useMap();
  const [items, setItems] = useState<Item[]>([]);
  const [minZoom] = useState(13);
  const [showLayer, setShowLayer] = useState(false);

  // stato modale
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMarkerId, setModalMarkerId] = useState<string>('');
  const [modalRewards, setModalRewards] = useState<any[]>([]);

  const icon = (active = true) =>
    L.divIcon({ className: `qr-marker ${active ? 'qr--active' : 'qr--redeemed'}`, iconSize: [20, 20] });

  useEffect(() => {
    (async () => {
      // 1) prova dalla view compat
      let { data, error } = await supabase
        .from('buzz_map_markers')
        .select('id,title,latitude,longitude,active');

      // 2) fallback tabella markers
      if (error || !data || data.length === 0) {
        const fb = await supabase.from('markers').select('id,title,lat,lng,active').eq('active', true);
        data = (fb.data || []).map(r => ({
          id: r.id, title: r.title, latitude: r.lat, longitude: r.lng, active: r.active,
        }));
      }

      const list: Item[] = (data || [])
        .map((r: any) => ({
          id: String(r.id),
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          title: r.title ?? 'M1SSION Marker',
          active: r.active !== false,
        }))
        .filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng));

      setItems(list);

      if (list.length && map) {
        const b = L.latLngBounds(list.map(m => [m.lat, m.lng]));
        map.fitBounds(b, { padding: [24, 24], maxZoom: 16 });
      }
    })();
  }, [map]);

  // mostra layer solo da zoom >= minZoom
  useEffect(() => {
    const update = () => setShowLayer((map.getZoom?.() ?? 0) >= minZoom);
    update();
    map.on('zoomend', update);
    return () => map.off('zoomend', update);
  }, [map, minZoom]);

  // click marker → apri modale + fetch rewards
  const openModal = async (markerId: string) => {
    setModalMarkerId(markerId);
    setModalOpen(true);
    try {
      const { data } = await supabase
        .from('marker_rewards')
        .select('reward_type,payload,description')
        .eq('marker_id', markerId);
      setModalRewards(data || []);
    } catch {
      setModalRewards([]);
    }
  };

  return (
    <>
      {showLayer && (
        <LayerGroup>
          {items.map(m => (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={icon(m.active)}
              eventHandlers={{ click: () => openModal(m.id) }}
            />
          ))}
        </LayerGroup>
      )}

      {modalOpen && (
        <Suspense fallback={<div className="m1ssion-popup-loading"><div className="m1ssion-loading-spinner" /></div>}>
          <ClaimRewardModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            markerId={modalMarkerId}
            rewards={modalRewards}
            onSuccess={(next) => { setModalOpen(false); if (next) window.location.assign(next); }}
          />
        </Suspense>
      )}
    </>
  );
}