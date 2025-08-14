// © 2025 Joseph MULÉ – M1SSION™
import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Marker, Popup, useMap, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import '@/styles/qr-markers.css';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';

// Lazy load the modal for better performance
const ClaimRewardModal = lazy(() => import('@/components/marker-rewards/ClaimRewardModal'));

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
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const map = useMap();
  const RADIUS_M = 500;
  const NEAR_M = 75;
  const watcher = useGeoWatcher();
  const showGeoDebug = (import.meta.env.DEV) && (((import.meta as any).env?.VITE_SHOW_GEO_DEBUG === '1') || (new URLSearchParams(window.location.search).get('geo') === '1'));
  const TRACE_ID = 'M1QR-TRACE';

  // Hook to fetch rewards for selected marker
  const { rewards } = useMarkerRewards(selectedMarker);

  const icon = (active:boolean) => L.divIcon({
    className: `qr-marker ${active ? 'qr--active' : 'qr--redeemed'}`,
    iconSize: [16,16]
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

        console.log('📍 Markers loaded:', processedItems.length);
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
    setShowLayer(z >= markerMinZoom);
    if (import.meta.env.DEV) console.debug('[QR] layer toggle', { z, show: z >= markerMinZoom, minZoom: markerMinZoom });
  };
  update();
  map.on('zoomend', update);
  return () => { map.off('zoomend', update); };
}, [map, markerMinZoom]);

  const handleClaimSuccess = (nextRoute?: string) => {
    console.log('M1QR-TRACE:', { step: 'claim_success_redirect', nextRoute });
    setSelectedMarker(null); // Close modal
    
    if (nextRoute) {
      setTimeout(() => {
        setLocation(nextRoute);
      }, 1000);
    }
  };

  const handleModalClose = () => {
    console.log('M1QR-TRACE:', { step: 'modal_close' });
    setSelectedMarker(null);
  };

  if (isLoading) return null;

return (
  <>
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
                click: () => {
                  console.log('M1QR-TRACE: QR marker clicked - opening popup for code:', qr.code);
                  // Popup opens on click - no navigation to QR pages
                }
              }}
            >
              <Popup>
                <div className="text-center space-y-3 min-w-[200px]">
                  <div className="flex items-center gap-2 justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">M1SSION™ QR</h3>
                  </div>
                  <div>
                    <p className="font-semibold text-base">{qr.title || 'QR'}</p>
                    <Badge style={{ background: qr.is_active ? '#22c55e' : '#ef4444', color: 'white' }}>
                      {qr.is_active ? 'ATTIVO' : 'RISCATTATO'}
                    </Badge>
                  </div>
                  {userLocation && (
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{Math.round(distance(userLocation, {lat:qr.lat,lng:qr.lng}))}m</span>
                    </div>
                  )}
                  {(qr.is_active && userLocation) && (inRange ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={()=>{
                      console.log('M1QR-TRACE: QR reward popup triggered for code:', qr.code);
                      setSelectedMarker(qr.code);
                    }}>🎯 Riscatta</Button>
                  ) : (
                    <Badge variant="outline" className="w-full">📍 Avvicinati (≤500m)</Badge>
                  ))}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LayerGroup>
    )}
    
    {/* Lazy-loaded ClaimRewardModal */}
    {selectedMarker && (
      <Suspense fallback={<div>Loading...</div>}>
        <ClaimRewardModal
          isOpen={!!selectedMarker}
          onClose={handleModalClose}
          markerId={selectedMarker}
          rewards={rewards}
          onSuccess={handleClaimSuccess}
        />
      </Suspense>
    )}
  </>
);
};
