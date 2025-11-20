// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SAFETY: References legacy table (markers) - kept as-is per SAFETY CLAUSE

import React, { useEffect, useMemo, useState } from 'react';
import { Marker } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';

interface DbMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  active?: boolean;
  visible_from?: string | null;
  visible_to?: string | null;
}

// Renders active markers from DB; auto-updates via realtime
const MapMarkers: React.FC = () => {
  const [markers, setMarkers] = useState<DbMarker[]>([]);

  const isVisibleNow = (m: DbMarker) => {
    const now = Date.now();
    const fromOk = !m.visible_from || new Date(m.visible_from).getTime() <= now;
    const toOk = !m.visible_to || new Date(m.visible_to).getTime() >= now;
    return fromOk && toOk && (m as any).active !== false;
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('markers')
          .select('id, lat, lng, title, active, visible_from, visible_to')
          .eq('active', true)
          .limit(2000);
        if (error) throw error;
        if (!mounted) return;
        setMarkers((data || []).filter(isVisibleNow));
      } catch (e) {
        console.error('[MapMarkers] load error', e);
      }
    };

    load();

    // Realtime updates
    const channel = supabase
      .channel('markers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'markers' }, (payload) => {
        setMarkers((prev) => {
          const current = [...prev];
          if (payload.eventType === 'INSERT') {
            const m = payload.new as DbMarker;
            return isVisibleNow(m) ? [...current, m] : current;
          }
          if (payload.eventType === 'UPDATE') {
            const m = payload.new as DbMarker;
            const idx = current.findIndex((x) => x.id === m.id);
            if (idx >= 0) {
              if (isVisibleNow(m)) {
                current[idx] = m;
                return [...current];
              }
              current.splice(idx, 1);
              return [...current];
            }
            return isVisibleNow(m) ? [...current, m] : current;
          }
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as any)?.id as string;
            return current.filter((x) => x.id !== id);
          }
          return current;
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const google = (window as any).google as typeof window.google | undefined;
  const icon = useMemo(() => {
    if (!google) return undefined;
    return {
      url: '/assets/marker-icon.png',
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 15),
    } as google.maps.Icon;
  }, [google]);

  return (
    <>
      {markers.map((m) => (
        <Marker key={m.id} position={{ lat: m.lat, lng: m.lng }} icon={icon} title={m.title} />
      ))}
    </>
  );
};

export default MapMarkers;