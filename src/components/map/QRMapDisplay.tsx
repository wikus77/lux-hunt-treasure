// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Marker, useMap, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import '@/styles/qr-markers.css';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

// Lazy load the modal for better performance
const ClaimRewardModal = lazy(() => import('@/components/marker-rewards/ClaimRewardModal'));

interface MarkerReward {
  reward_type: string;
  payload: any;
  description: string;
}

interface ClaimData {
  isOpen: boolean;
  markerId: string;
  rewards: MarkerReward[];
}

type Item = {
  code: string;
  lat: number;
  lng: number;
  title: string | null;
  reward_type: string;
  is_active: boolean;
};

export const QRMapDisplay: React.FC<{ userLocation?: { lat:number; lng:number } | null }> = ({ userLocation }) => {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLayer, setShowLayer] = useState(false);
  const [markerMinZoom, setMarkerMinZoom] = useState<number>(17); // Default from app_config
  const [claimData, setClaimData] = useState<ClaimData>({ isOpen: false, markerId: '', rewards: [] });
  const map = useMap();
  const RADIUS_M = 500;
  const NEAR_M = 75;
  const watcher = useGeoWatcher();
  const showGeoDebug = (import.meta.env.DEV) && (((import.meta as any).env?.VITE_SHOW_GEO_DEBUG === '1') || (new URLSearchParams(window.location.search).get('geo') === '1'));
  const TRACE_ID = 'M1QR-TRACE';

  const icon = (active:boolean) => L.divIcon({
    className: 'm1-red-pulse',
    html: '<div class="dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Load marker min zoom from app_config with cache and realtime updates
  useEffect(() => {
    (async () => {
      try {
        const cached = localStorage.getItem('cfg_marker_min_zoom');
        if (cached) setMarkerMinZoom(Number(cached) || 17);
      } catch {}

      const { data } = await supabase
        .from('app_config')
        .select('value_int')
        .eq('key', 'marker_min_zoom')
        .maybeSingle();

      if (data?.value_int) {
        setMarkerMinZoom(Number(data.value_int));
        try { localStorage.setItem('cfg_marker_min_zoom', String(data.value_int)); } catch {}
      }
    })();

    const ch = supabase
      .channel('cfg_marker_min_zoom')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_config', filter: 'key=eq.marker_min_zoom' },
        (payload: any) => {
          const v = payload?.new?.value_int ?? payload?.old?.value_int;
          if (typeof v === 'number') {
            setMarkerMinZoom(v);
            try { localStorage.setItem('cfg_marker_min_zoom', String(v)); } catch {}
          }
        }
      )
      .subscribe();

    return () => { try { supabase.removeChannel(ch); } catch {} };
  }, []);

  useEffect(() => {
    console.log('M1SSION_CANARY: QRMapDisplay component mounted - rendering QR markers');
    console.info('M1-ENV', { origin: window.location.origin, VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL });
    (async () => {
      try {
        console.log('🎯 Fetching QR markers from buzz_map_markers...');
        
        // Try buzz_map_markers view first
        let { data, error } = await supabase
          .from('buzz_map_markers')
          .select('code,title,latitude,longitude');

        if (error) {
          console.warn('buzz_map_markers error:', error?.message);
        }

        // Fallback to qr_codes if view is empty or fails
        if (!data || data.length === 0) {
          console.log('🔄 Fallback to qr_codes table...');
          const fb = await supabase
            .from('qr_codes')
            .select('code,lat,lng,reward_type,is_active');
          if (fb.data && fb.data.length > 0) {
            data = fb.data.map(r => ({
              code: r.code,
              title: r.code,
              latitude: typeof r.lat === 'number' ? r.lat : Number(r.lat),
              longitude: typeof r.lng === 'number' ? r.lng : Number(r.lng),
              reward_type: r.reward_type || 'buzz_credit',
              is_active: r.is_active !== false
            }));
          }
        } else {
          // Add missing fields for buzz_map_markers
          data = data.map(r => ({
            ...r,
            reward_type: 'buzz_credit',
            is_active: true
          }));
        }

        const processedItems = (data || [])
          .map((r: any) => ({
            code: String(r.code),
            lat: typeof r.latitude === 'number' ? r.latitude : Number(r.latitude),
            lng: typeof r.longitude === 'number' ? r.longitude : Number(r.longitude),
            title: r.title ?? '',
            reward_type: r.reward_type ?? 'buzz_credit',
            is_active: r.is_active !== false
          }))
          .filter((r: Item) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

        console.log('M1MARK-TRACE', { step: 'MARKER_FETCH_END', count: processedItems.length });
        setItems(processedItems);
      } catch(e) {
        if (import.meta.env.DEV) console.debug('[qr map] load error', e);
      } finally { setIsLoading(false); }
    })();
  }, []);

  const distance = (a:{lat:number;lng:number}, b:{lat:number;lng:number}) => {
    const R=6371000, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180;
    const aa = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
    return 2*R*Math.atan2(Math.sqrt(aa),Math.sqrt(1-aa));
  };

const all = useMemo(() => items, [items]);

// Toggle layer visibility on zoom changes using dynamic marker min zoom
useEffect(() => {
  if (!map) return;
  const update = () => {
    const z = map.getZoom?.() ?? 0;
    const shouldShow = z >= markerMinZoom;
    setShowLayer(shouldShow);
    console.log('M1QR-TRACE:', { 
      step: 'zoom_check', 
      currentZoom: z, 
      minZoom: markerMinZoom, 
      showLayer: shouldShow,
      markersVisible: shouldShow 
    });
  };
  update();
  map.on('zoomend', update);
  return () => { map.off('zoomend', update); };
}, [map, markerMinZoom]);

  const handleClaimSuccess = (nextRoute?: string) => {
    console.log('M1QR-TRACE', { step: 'claim_success_redirect', nextRoute });
    setClaimData({ isOpen: false, markerId: '', rewards: [] }); // Close modal
    
    if (nextRoute) {
      setLocation(nextRoute);
    }
  };

  const handleModalClose = () => {
    console.log('M1QR-TRACE', { step: 'modal_close' });
    setClaimData({ isOpen: false, markerId: '', rewards: [] });
  };

  if (isLoading) return null;

return (
  <>
    {console.log('M1QR-TRACE:', { 
      step: 'render_check', 
      showLayer, 
      markersCount: all.length,
      markersWillRender: showLayer ? all.length : 0 
    })}
    {showLayer && (
      <LayerGroup>
        {all.map((qr) => {
          const inRange = !!userLocation && distance(userLocation, {lat:qr.lat,lng:qr.lng}) <= RADIUS_M;
          return (
            <Marker
              key={qr.code}
              position={[qr.lat, qr.lng]}
              icon={icon(qr.is_active)}
              eventHandlers={{
                 click: async (e) => {
                   e.originalEvent?.stopPropagation();
                   const markerId = qr.code;
                   console.log('M1MARK-TRACE', { step: 'POPUP_OPENED', markerId });
                   
                   // Fetch rewards directly for immediate modal opening
                   try {
                     const { data: rewards, error } = await supabase
                       .from('marker_rewards')
                       .select('reward_type, payload, description')
                       .eq('marker_id', markerId);

                     if (error) {
                       console.error('M1MARK-TRACE', { step: 'rewards_fetch_error', markerId, error });
                       return;
                     }

                     setClaimData({ isOpen: true, markerId, rewards: rewards || [] });
                     console.log('M1MARK-TRACE', { step: 'open_modal', markerId, rewardsCount: (rewards || []).length });
                   } catch (err) {
                     console.error('M1MARK-TRACE', { step: 'click_error', markerId, err });
                   }
                 }
              }}
            />
          );
        })}
      </LayerGroup>
    )}
    
    {/* Lazy-loaded ClaimRewardModal */}
    {claimData.isOpen && (
      <Suspense fallback={<div>Loading...</div>}>
        <ClaimRewardModal
          isOpen={claimData.isOpen}
          onClose={handleModalClose}
          markerId={claimData.markerId}
          rewards={claimData.rewards}
          onSuccess={handleClaimSuccess}
        />
      </Suspense>
    )}
  </>
);
};
