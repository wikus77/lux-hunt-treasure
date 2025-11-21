// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { shouldShowToast } from '@/utils/toastDedup';

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
  };
}

const MapStateContext = createContext<MapStateContextType | undefined>(undefined);

export const MapStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<MapStatus>('idle');
  const [center, setCenter] = useState<LatLng | null>(null);
  const [lastClick, setLastClick] = useState<LatLng | null>(null);
  const warnedToast = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('locating');

    if (!('geolocation' in navigator)) {
      setStatus('error');
      if (!warnedToast.current) {
        toast.error('❌ Geolocalizzazione non supportata dal browser');
        warnedToast.current = true;
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          setCenter({ lat: latitude, lng: longitude });
          setStatus('ready');
          if (shouldShowToast('gps_detected')) {
            toast.success('📍 Posizione GPS rilevata con precisione');
          }
        } else {
          setStatus('error');
          if (!warnedToast.current) {
            toast.error('❌ Coordinate GPS non valide');
            warnedToast.current = true;
          }
        }
      },
      () => {
        if (cancelled) return;
        setStatus('denied');
        if (!warnedToast.current) {
          toast.error('❌ Geolocalizzazione GPS negata');
          warnedToast.current = true;
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
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
      actions: { setCenter, setLastClick },
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

// GPS-only geolocation - no fallbacks to specific cities
