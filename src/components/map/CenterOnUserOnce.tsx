// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useRef, useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { useGeolocation } from '@/hooks/useGeolocation';
import { userDotIcon } from './userDotIcon';
import { toast } from 'sonner';

// Centers map on user once and shows a user location marker
export const CenterOnUserOnce: React.FC = () => {
  const map = useMap();
  const didCenter = useRef(false);
  const didToast = useRef(false);
  const { status, position } = useGeolocation();

  useEffect(() => {
    if (position && !didCenter.current) {
      didCenter.current = true;
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 13), { animate: true });
    }
  }, [position, map]);

  useEffect(() => {
    if ((status === 'denied' || status === 'error') && !didToast.current) {
      didToast.current = true;
      try { toast.error('Geolocalizzazione non disponibile'); } catch {}
    }
  }, [status]);

  if (!position) return null;

  return (
    <Marker icon={userDotIcon} position={[position.lat, position.lng]} />
  );
};