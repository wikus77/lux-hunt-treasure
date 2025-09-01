// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { supabase } from '@/integrations/supabase/client';

function haversine(a:{lat:number;lng:number}, b:{lat:number;lng:number}){
  const R=6371000; const dLat=(b.lat-a.lat)*Math.PI/180; const dLng=(b.lng-a.lng)*Math.PI/180;
  const aa=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(aa),Math.sqrt(1-aa));
}

function canNotify(code:string){
  try{
    const k=`qr-notified:${code}`; const v=localStorage.getItem(k);
    if(!v) return true; const last=Number(v)||0; return Date.now()-last>10*60*1000;
  }catch{return true;}
}
function markNotified(code:string){ try{ localStorage.setItem(`qr-notified:${code}`, String(Date.now())); }catch{} }

export const GeoDebugOverlay: React.FC = () => {
  const dev = !!import.meta.env.DEV;
  const enabled = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('geo'));
  const { granted, coords, ts, error, requestPermissions } = useGeoWatcher();
  if (!enabled) return null;

  const ageSec = useMemo(()=> ts ? Math.round((Date.now()-ts)/1000) : undefined, [ts]);

  const testNearest = async () => {
    try{
      if(!coords){ toast.info('Posizione non disponibile'); return; }
      const { data, error } = await (supabase as any)
        .from('qr_codes_map').select('code,lat,lng,is_active').eq('is_active', true).limit(1000);
      if(error) throw error;
      const rows = (data||[]).filter((r:any)=>Number.isFinite(r.lat)&&Number.isFinite(r.lng));
      if(rows.length===0){ toast.message('Nessun QR attivo'); return; }
      let best = { d: Number.POSITIVE_INFINITY, code:'' };
      for(const r of rows){
        const d = haversine({lat:coords.lat,lng:coords.lng}, {lat:Number(r.lat),lng:Number(r.lng)});
        if (d < best.d) best = { d, code: String(r.code) };
      }
      toast.success(`QR più vicino a ~${Math.round(best.d)}m`);
      if (best.d <= 75 && canNotify(best.code)){
        try{
          if (Notification && Notification.permission === 'granted'){
            new Notification('M1SSION™ – QR vicino', { body: `Sei a ~${Math.round(best.d)}m`, tag: 'qr-near' });
          }
        }catch{}
        markNotified(best.code);
      }
      console.debug('[GEO TEST] nearest', best);
    }catch(e:any){ toast.error(e?.message||'Errore test QR'); }
  };

  const ask = async () => {
    try{ await Notification.requestPermission().catch(()=>{}); }catch{}
    await requestPermissions();
  };

  return (
    <div className="absolute top-14 right-3 z-[1001] bg-black/70 text-white text-xs px-3 py-2 rounded-lg space-y-1">
      <div className="font-semibold">Geo Debug</div>
      <div>Stato: {granted ? 'Granted' : 'Denied'}</div>
      <div>Lat,Lon: {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : '—'}</div>
      <div>±Acc: {coords ? `${Math.round(coords.acc)}m` : '—'} • Age: {ageSec ?? '—'}s</div>
      {error && <div className="text-red-300">{error}</div>}
      <div className="flex gap-2 pt-1">
        <button onClick={ask} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition">Richiedi permesso</button>
        <button onClick={testNearest} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition">Test QR vicino</button>
      </div>
    </div>
  );
};
