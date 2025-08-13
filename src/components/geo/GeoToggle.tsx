// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

export const GeoToggle:React.FC=()=> {
  const {status,enabled,enable,disable} = useGeolocation();
  const on = enabled && status==='granted';
  return (
    <div style={{position:'absolute',right:12,top:12,zIndex:9999}}>
      <button onClick={on?disable:enable} className={`px-3 py-1 rounded-full ${on?'bg-emerald-500':'bg-zinc-700'}`}>
        Geolocalizzazione {on?'ON':'OFF'}
      </button>
      {enabled && status==='denied' && (
        <div className="mt-2 text-xs opacity-70">Permessi negati. <a href="/help/geo" className="underline">Sblocca?</a></div>
      )}
    </div>
  );
};
