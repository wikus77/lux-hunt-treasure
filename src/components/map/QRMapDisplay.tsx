// © M1SSION™
import React, { useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import '@/styles/qr-markers.css';

interface QRMapItem {
  id: string;
  code: string;
  lat: number;
  lng: number;
  title?: string | null;
  reward_type: string;
  is_active?: boolean;
}

export const QRMapDisplay: React.FC<{ userLocation?: { lat:number; lng:number } | null }> = ({ userLocation }) => {
  const [qrCodes, setQrCodes] = useState<QRMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const map = useMap();
  const RADIUS_M = 500;
  const MIN_ZOOM = 9;

  const getIcon = (active: boolean, inRange: boolean) =>
    L.divIcon({
      className: `qr-marker ${active ? (inRange ? 'qr--active' : 'qr--hidden') : 'qr--redeemed'}`,
      iconSize: [12, 12],
    });

  useEffect(() => { loadQRCodes(); }, []);

  const loadQRCodes = async () => {
    try {
      // usa vista snella: qr_codes_map
      const { data, error } = await (supabase as any)
        .from('qr_codes_map')
        .select('code, lat, lng, title, reward_type, is_active');
      if (error) throw error;
      const mapped = (data || []).map((r:any, i:number) => ({
        id: r.code ?? String(i),
        code: String(r.code),
        lat: typeof r.lat==='number'?r.lat:Number(r.lat),
        lng: typeof r.lng==='number'?r.lng:Number(r.lng),
        title: r.title,
        reward_type: r.reward_type,
        is_active: r.is_active === true
      })).filter((r:any)=>Number.isFinite(r.lat)&&Number.isFinite(r.lng));
      setQrCodes(mapped);
    } catch(e){ if (import.meta.env.DEV) console.debug('[map] load error', e); }
    finally { setIsLoading(false); }
  };

  const calculateDistance = (lat1:number, lng1:number, lat2:number, lng2:number) => {
    const R = 6371000, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const allValid = useMemo(()=> (qrCodes||[]).filter(q=>Number.isFinite(q.lat)&&Number.isFinite(q.lng)),[qrCodes]);
  if (isLoading) return null;
  const zoom = map?.getZoom?.() ?? 3;
  if (zoom < MIN_ZOOM) return null;

  return (
    <>
      {allValid.map((qr) => {
        const inRange = !!userLocation && calculateDistance(userLocation.lat, userLocation.lng, qr.lat, qr.lng) <= RADIUS_M;
        const isActive = qr.is_active === true;
        return (
          <Marker key={qr.id}
            position={[qr.lat, qr.lng]}
            icon={getIcon(isActive, inRange)}
            eventHandlers={{ click: () => { window.location.href = `/qr/${encodeURIComponent(qr.code)}`; } }}
          >
            <Popup>
              <div className="text-center space-y-3 min-w-[200px]">
                <div className="flex items-center gap-2 justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">M1SSION™ QR</h3>
                </div>
                <div>
                  <p className="font-semibold text-base">{qr.title || 'QR'}</p>
                  <Badge style={{ background: isActive ? '#10b981' : '#ef4444', color: 'white' }}>
                    {isActive ? 'ATTIVO' : 'RISCATTATO'}
                  </Badge>
                </div>
                {userLocation && (
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{Math.round(calculateDistance(userLocation.lat, userLocation.lng, qr.lat, qr.lng))}m</span>
                  </div>
                )}
                {isActive && userLocation && (inRange ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={()=>window.location.href=`/qr/${encodeURIComponent(qr.code)}`}>🎯 Riscatta</Button>
                ) : (
                  <Badge variant="outline" className="w-full">📍 Avvicinati (≤500m)</Badge>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
