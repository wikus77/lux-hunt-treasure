// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Marker, useMap, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { redPulseIcon } from '@/components/map/redPulseIcon';
import '@/components/map/forceMarkerIcon'; // Force global marker icon
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
  const [claimData, setClaimData] = useState<ClaimData>({ isOpen: false, markerId: '' });
  const map = useMap();
  const RADIUS_M = 500;
  const NEAR_M = 75;
  const watcher = useGeoWatcher();
  const showGeoDebug = (import.meta.env.DEV) && (((import.meta as any).env?.VITE_SHOW_GEO_DEBUG === '1') || (new URLSearchParams(window.location.search).get('geo') === '1'));
  const TRACE_ID = 'M1QR-TRACE';


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
    // PREVENT DUPLICATE RENDERS: Only load if not already loaded
    if (items.length > 0) {
      console.log('M1QR-FETCH', 'Already loaded', items.length, 'markers - skipping duplicate fetch');
      return;
    }
    
    console.log('M1QR-FETCH', 'QRMapDisplay component mounted - fetching QR markers');
    console.log('M1QR-FETCH', { origin: window.location.origin });
    
    // Set body data-path for /map
    document.body.setAttribute('data-path', '/map');
    
    (async () => {
      try {
        console.log('🎯 Fetching QR markers from buzz_map_markers...');
        
        // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
        // Optimized fetch with proper error handling and caching
        let data: any = null;
        let error: any = null;
        
        try {
          const response = await fetch('/api/supabase/buzz-map-markers', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=60'
            }
          });
          
          if (response.ok) {
            data = await response.json();
          } else {
            // Fallback to direct Supabase API
            const fallbackResponse = await fetch(`https://vkjrqirvdvjbemsfzxof.supabase.co/rest/v1/buzz_map_markers?active=eq.true&select=id,title,latitude,longitude,active`, {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk',
                'Prefer': 'return=representation'
              }
            });
            data = await fallbackResponse.json();
          }
        } catch (fetchError) {
          error = fetchError;
        }

        if (error) {
          console.warn('buzz_map_markers error:', error?.message);
        }

        // Process buzz_map_markers data 
        let processedData: any[] = [];
        if (data && data.length > 0) {
          // Add missing fields for buzz_map_markers
          processedData = data.map((r: any) => ({
            code: r.id || r.code,
            title: r.title || 'Marker',
            latitude: r.latitude,
            longitude: r.longitude,
            reward_type: 'buzz_credit',
            is_active: r.active !== false
          }));
        } else {
          console.log('🔄 Fallback to qr_codes table...');
          const fb = await supabase
            .from('qr_codes')
            .select('code,lat,lng,reward_type,is_active');
          if (fb.data && fb.data.length > 0) {
            processedData = fb.data.map((r: any) => ({
              code: r.code,
              title: r.code,
              latitude: typeof r.lat === 'number' ? r.lat : Number(r.lat),
              longitude: typeof r.lng === 'number' ? r.lng : Number(r.lng),
              reward_type: r.reward_type || 'buzz_credit',
              is_active: r.is_active !== false
            }));
          }
        }

        const processedItems = (processedData || [])
          .map((r: any) => ({
            code: String(r.code || r.id), // Use either code or id
            lat: typeof r.latitude === 'number' ? r.latitude : Number(r.latitude),
            lng: typeof r.longitude === 'number' ? r.longitude : Number(r.longitude),
            title: r.title ?? '',
            reward_type: r.reward_type ?? 'buzz_credit',
            is_active: r.is_active !== false || r.active !== false
          }))
          .filter((r: Item) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

        console.log('M1QR-FETCH', { step: 'MARKER_FETCH_END', count: processedItems.length });
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

  const handleModalClose = () => {
    console.log('M1MODAL-CLOSE', { step: 'modal_close' });
    setClaimData({ isOpen: false, markerId: '' });
  };

  if (isLoading) return null;

return (
  <>
    {console.log('M1QR-RENDER:', { 
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
              icon={redPulseIcon}
              eventHandlers={{
                 click: (e) => {
                   e.originalEvent?.stopPropagation();
                   const markerId = qr.code;
                   console.log('M1QR-CLICK', { markerId, count: all.length });
                   console.log('M1MODAL-OPEN', { markerId });
                   setClaimData({ isOpen: true, markerId });
                 }
              }}
            />
          );
        })}
      </LayerGroup>
    )}
    
    {/* Lazy-loaded ClaimRewardModal */}
    {claimData.isOpen && (
      <Suspense fallback={null}>
        <ClaimRewardModal
          isOpen={claimData.isOpen}
          onClose={handleModalClose}
          markerId={claimData.markerId}
        />
      </Suspense>
    )}
  </>
);
};
