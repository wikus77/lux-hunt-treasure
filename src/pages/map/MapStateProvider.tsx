// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export type MapStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error';

export interface LatLng {
  lat: number;
  lng: number;
}

interface MapStateContextType {
  status: MapStatus;
  center: LatLng | null;
  lastClick: LatLng | null;
  actions: {
    setCenter: (ll: LatLng | null) => void;
    setLastClick: (ll: LatLng | null) => void;
    fallbackToMilano: () => void;
  };
}

const DEFAULT_MILANO: LatLng = { lat: 45.4642, lng: 9.19 } as const;

const MapStateContext = createContext<MapStateContextType | undefined>(undefined);

export const MapStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<MapStatus>('idle');
  const [center, setCenter] = useState<LatLng | null>(null);
  const [lastClick, setLastClick] = useState<LatLng | null>(null);
  const warnedToast = useRef(false);

  const fallbackToMilano = () => {
    setCenter(DEFAULT_MILANO);
  };

  useEffect(() => {
    let cancelled = false;
    setStatus('locating');

    if (!('geolocation' in navigator)) {
      setStatus('error');
      if (!warnedToast.current) {
        toast('Geolocalizzazione non disponibile — fallback: Milano');
        warnedToast.current = true;
      }
      fallbackToMilano();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          setCenter({ lat: latitude, lng: longitude });
          setStatus('ready');
        } else {
          setStatus('error');
          if (!warnedToast.current) {
            toast('Geolocalizzazione non valida — fallback: Milano');
            warnedToast.current = true;
          }
          fallbackToMilano();
        }
      },
      () => {
        if (cancelled) return;
        setStatus('denied');
        if (!warnedToast.current) {
          toast('Geolocalizzazione non disponibile — fallback: Milano');
          warnedToast.current = true;
        }
        fallbackToMilano();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 2000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<MapStateContextType>(
    () => ({
      status,
      center,
      lastClick,
      actions: { setCenter, setLastClick, fallbackToMilano },
    }),
    [status, center, lastClick]
  );

  return <MapStateContext.Provider value={value}>{children}</MapStateContext.Provider>;
};

export function useMapState() {
  const ctx = useContext(MapStateContext);
  if (!ctx) throw new Error('useMapState must be used within MapStateProvider');
  return ctx;
}

export const DEFAULT_CENTER_MILANO = DEFAULT_MILANO;
