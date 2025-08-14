// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMap, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import '@/styles/qr-markers.css';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { toast } from 'sonner';

type Item = {
  code: string;
  lat: number;
  lng: number;
  title: string | null;
  reward_type: string;
  is_active: boolean;
};

export const QRMapDisplay: React.FC<{ userLocation?: { lat:number; lng:number } | null }> = ({ userLocation }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLayer, setShowLayer] = useState(false);
  const map = useMap();
  const MIN_ZOOM = 14;  // Restored to working version
  const RADIUS_M = 500;
  const NEAR_M = 75;
  const watcher = useGeoWatcher();
  const showGeoDebug = (import.meta.env.DEV) && (((import.meta as any).env?.VITE_SHOW_GEO_DEBUG === '1') || (new URLSearchParams(window.location.search).get('geo') === '1'));
  const TRACE_ID = 'M1QR-TRACE';

  const icon = (active:boolean) => L.divIcon({
    className: `qr-marker ${active ? 'qr--active' : 'qr--redeemed'}`,
    iconSize: [16,16]
  });

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

// Toggle layer visibility on zoom changes (must run regardless of loading to keep hooks order)
useEffect(() => {
  if (!map) return;
  const update = () => {
    const z = map.getZoom?.() ?? 0;
    setShowLayer(z >= MIN_ZOOM);
    if (import.meta.env.DEV) console.debug('[QR] layer toggle', { z, show: z >= MIN_ZOOM });
  };
  update();
  map.on('zoomend', update);
  return () => { map.off('zoomend', update); };
}, [map]);

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
                  const url = `/qr?c=${encodeURIComponent(qr.code)}`;
                  if (import.meta.env.DEV) {
                    console.debug(TRACE_ID, { tag:'M1QR', step:'map:click', code: qr.code, url, ts: Date.now() });
                  }
                  window.location.href = url;
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
                      const url = `/qr?c=${encodeURIComponent(qr.code)}`;
                      if (import.meta.env.DEV) console.debug('[QR] navigate', qr.code, url);
                      window.location.href = url;
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
  </>
);
};
