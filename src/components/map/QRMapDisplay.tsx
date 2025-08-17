// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import React, { useEffect, useMemo, useState, lazy, Suspense, useCallback } from 'react';
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
        console.log('🎯 Fetching QR markers from qr_codes table...');
        
        // Query qr_codes table directly for better security (avoiding security definer views)
        const { data, error } = await supabase
          .from('qr_codes')
          .select('code,title,lat,lng,reward_type,is_active')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .eq('is_hidden', false);

        if (error) {
          console.warn('qr_codes query error:', error?.message);
          return;
        }

        // Transform data to expected format
        const transformedData = (data || []).map(r => ({
          code: r.code,
          title: r.title || r.code,
          latitude: typeof r.lat === 'number' ? r.lat : Number(r.lat),
          longitude: typeof r.lng === 'number' ? r.lng : Number(r.lng),
          reward_type: r.reward_type || 'buzz_credit',
          is_active: r.is_active !== false
        }));

        const processedItems = transformedData
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

// Performance optimizations - memoized values
const visibleMarkers = useMemo(() => {
  if (!showLayer) return [];
  return items.filter(item => {
    if (!userLocation) return true;
    const dist = distance(userLocation, { lat: item.lat, lng: item.lng });
    return dist <= RADIUS_M || !item.is_active; // Show all inactive markers regardless of distance
  });
}, [items, showLayer, userLocation]);

// Memoized callbacks for performance
const handleClaimSuccess = useCallback((nextRoute?: string) => {
  console.log('M1QR-TRACE', { step: 'claim_success_redirect', nextRoute });
  setClaimData({ isOpen: false, markerId: '', rewards: [] });
  
  if (nextRoute) {
    setLocation(nextRoute);
  }
}, [setLocation]);

const handleModalClose = useCallback(() => {
  console.log('M1QR-TRACE', { step: 'modal_close' });
  setClaimData({ isOpen: false, markerId: '', rewards: [] });
}, []);

const handleMarkerClick = useCallback(async (markerId: string, e?: any) => {
  e?.originalEvent?.stopPropagation();
  console.log('M1QR-TRACE', { step: 'click_marker_start', markerId });
  
  try {
    const { data: rewards, error } = await supabase
      .from('marker_rewards')
      .select('reward_type, payload, description')
      .eq('marker_id', markerId);

    if (error) {
      console.error('M1QR-TRACE', { step: 'rewards_fetch_error', markerId, error });
      return;
    }

    setClaimData({ isOpen: true, markerId, rewards: rewards || [] });
    console.log('M1QR-TRACE', { step: 'open_modal', markerId, rewardsCount: (rewards || []).length });
  } catch (err) {
    console.error('M1QR-TRACE', { step: 'click_error', markerId, err });
  }
}, []);

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


  if (isLoading) return null;

return (
  <>
    {console.log('M1QR-TRACE:', { 
      step: 'render_check', 
      showLayer, 
      markersCount: items.length,
      markersWillRender: showLayer ? visibleMarkers.length : 0 
    })}
    {showLayer && (
      <LayerGroup>
        {visibleMarkers.map((qr) => {
          const inRange = !!userLocation && distance(userLocation, {lat:qr.lat,lng:qr.lng}) <= RADIUS_M;
          return (
            <MarkerComponent
              key={qr.code}
              qr={qr}
              userLocation={userLocation}
              onMarkerClick={handleMarkerClick}
              distance={distance}
              icon={icon}
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

// Memoized marker component for performance
const MarkerComponent = React.memo<{
  qr: Item;
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick: (markerId: string, e?: any) => void;
  distance: (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => number;
  icon: (active: boolean) => L.DivIcon;
}>(({ qr, userLocation, onMarkerClick, distance, icon }) => {
  return (
    <Marker
      position={[qr.lat, qr.lng]}
      icon={icon(qr.is_active)}
      eventHandlers={{
        click: (e) => onMarkerClick(qr.code, e)
      }}
      aria-label={`Marker M1SSION ${qr.title || qr.code}, ${qr.is_active ? 'attivo' : 'già riscattato'}`}
      // @ts-ignore - Adding accessibility attributes
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onMarkerClick(qr.code);
        }
      }}
    >
      <Popup>
        <div className="text-center space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2 justify-center">
            <QrCode className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">M1SSION™</h3>
          </div>
          <div>
            <p className="font-medium text-sm">{qr.title || qr.code}</p>
            <Badge style={{ background: qr.is_active ? '#22c55e' : '#ef4444', color: 'white' }} className="text-xs">
              {qr.is_active ? 'ATTIVO' : 'RISCATTATO'}
            </Badge>
          </div>
          {userLocation && (
            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{Math.round(distance(userLocation, {lat:qr.lat,lng:qr.lng}))}m</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Click marker for rewards
          </div>
        </div>
      </Popup>
    </Marker>
  );
});
