// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
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
import { AuthPrompt } from './AuthPrompt';
import ClaimRewardButton from './ClaimRewardButton';
import { GeoDebugBanner } from './GeoDebugBanner';
import { invalidateMarkerCache, setupOnlineRefresh } from '@/utils/markerCacheUtils';

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
  id: string;
  lat: number;
  lng: number;
  title: string | null;
  active: boolean;
};

export const QRMapDisplay: React.FC<{ userLocation?: { lat:number; lng:number } | null }> = ({ userLocation }) => {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
        if (cached) setMarkerMinZoom(Number(cached) || 10); // Lowered default to 10
      } catch {}

      const { data } = await supabase
        .from('app_config')
        .select('value_int')
        .eq('key', 'marker_min_zoom')
        .maybeSingle();

      if (data?.value_int) {
        const minZoom = Math.min(data.value_int, 12); // Cap at zoom 12 for better visibility
        setMarkerMinZoom(minZoom);
        try { localStorage.setItem('cfg_marker_min_zoom', String(minZoom)); } catch {}
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
            const minZoom = Math.min(v, 12); // Cap at zoom 12 for better visibility
            setMarkerMinZoom(minZoom);
            try { localStorage.setItem('cfg_marker_min_zoom', String(minZoom)); } catch {}
          }
        }
      )
      .subscribe();

    return () => { try { supabase.removeChannel(ch); } catch {} };
  }, []);

  // Marker loading function
  const loadMarkers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // M1MARK-TRACE: Start marker loading with enhanced telemetry
      const traceData = { step: 'markers_fetch_start', timestamp: new Date().toISOString() };
      if (import.meta.env.DEV) console.info('M1MARK-TRACE:', traceData);
      
      // Clear cache to ensure fresh data
      await invalidateMarkerCache();
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const authError = { step: 'auth_missing', reason: 'No authenticated user' };
        if (import.meta.env.DEV) console.info('M1MARK-TRACE:', authError);
        setIsAuthenticated(false);
        setItems([]);
        return;
      }

      setIsAuthenticated(true);

      // Query markers with enhanced fields - use public access now available
      const { data, error, count } = await supabase
        .from('markers')
        .select('id,title,lat,lng,active,visible_from,visible_to,zoom_min,zoom_max,created_at,updated_at', { count: 'exact' })
        .eq('active', true);

      if (error) {
        const errorTrace = { step: 'query_error', error: error.message, code: error.code };
        if (import.meta.env.DEV) console.error('M1MARK-TRACE:', errorTrace);
        setItems([]);
        return;
      }

      // M1MARK-TRACE: Raw data received
      const rawDataTrace = { 
        step: 'raw_data_received', 
        total_count: count, 
        payload_length: data?.length || 0,
        first_record_sanitized: data?.[0] ? {
          id: data[0].id,
          active: data[0].active,
          has_coords: !!(data[0].lat && data[0].lng),
          visible_from: data[0].visible_from,
          visible_to: data[0].visible_to,
          zoom_constraints: { min: data[0].zoom_min, max: data[0].zoom_max }
        } : null
      };
      if (import.meta.env.DEV) console.info('M1MARK-TRACE:', rawDataTrace);

      // Apply temporal filtering
      const now = new Date();
      const temporalFiltered = (data || []).filter((r: any) => {
        const visibleFrom = r.visible_from ? new Date(r.visible_from) : null;
        const visibleTo = r.visible_to ? new Date(r.visible_to) : null;
        
        const isTemporallyVisible = (!visibleFrom || visibleFrom <= now) && (!visibleTo || visibleTo >= now);
        return isTemporallyVisible;
      });

      // Transform data to expected format with coordinate validation
      const processedItems = temporalFiltered
        .map((r: any) => ({
          id: String(r.id),
          lat: typeof r.lat === 'number' ? r.lat : Number(r.lat),
          lng: typeof r.lng === 'number' ? r.lng : Number(r.lng),
          title: r.title ?? `Marker ${r.id.slice(-4)}`,
          active: r.active !== false,
          zoom_min: r.zoom_min,
          zoom_max: r.zoom_max
        }))
        .filter((r: Item) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

      // M1MARK-TRACE: Final processed data
      const processedTrace = {
        step: 'processing_complete',
        records_after_temporal_filter: temporalFiltered.length,
        records_after_coordinate_filter: processedItems.length,
        filtered_out: {
          temporal: (data?.length || 0) - temporalFiltered.length,
          coordinate: temporalFiltered.length - processedItems.length
        },
        current_time_utc: now.toISOString()
      };
      if (import.meta.env.DEV) console.info('M1MARK-TRACE:', processedTrace);

      setItems(processedItems);
    } catch(e) {
      const errorTrace = { step: 'fetch_exception', error: e instanceof Error ? e.message : String(e) };
      if (import.meta.env.DEV) console.error('M1MARK-TRACE:', errorTrace);
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  // Initial load and setup online refresh
  useEffect(() => {
    loadMarkers();
    
    // Setup online/visibility refresh
    const cleanup = setupOnlineRefresh(loadMarkers);
    
    // Setup realtime subscription for marker changes
    const channel = supabase
      .channel('markers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'markers' }, (payload) => {
        if (import.meta.env.DEV) console.info('M1MARK-TRACE: Realtime marker update:', payload);
        loadMarkers(); // Reload all markers on any change
      })
      .subscribe();
    
    return () => {
      cleanup();
      supabase.removeChannel(channel);
    };
  }, [loadMarkers]);

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
    return dist <= RADIUS_M || !item.active; // Show all inactive markers regardless of distance
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
      markersVisible: shouldShow,
      markersCount: items.length
    });
  };
  update();
  map.on('zoomend', update);
  return () => { map.off('zoomend', update); };
}, [map, markerMinZoom, items.length]);

// Fit map bounds to show all markers when they load
useEffect(() => {
  if (!map || items.length === 0) return;
  
  try {
    const bounds = items.map(item => [item.lat, item.lng] as [number, number]);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
      console.log('🗺️ Map fitted to', bounds.length, 'markers');
    }
  } catch (e) {
    console.log('Could not fit bounds:', e);
  }
}, [map, items]);


  // Show authentication prompt if user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="p-4">
        <AuthPrompt 
          onLogin={() => setLocation('/auth')}
          onSignup={() => setLocation('/auth')}
        />
      </div>
    );
  }

  if (isLoading) return null;

  const currentZoom = map?.getZoom() ?? 0;
  const debugReason = (() => {
    if (items.length === 0 && !isLoading) return 'empty';
    if (!showLayer && currentZoom < markerMinZoom) return 'zoom';
    return undefined;
  })();

  return (
    <>
      {/* DEV-only GeoDebugBanner */}
      <GeoDebugBanner
        show={import.meta.env.DEV && (items.length === 0 || !showLayer || debugReason !== undefined)}
        markersCount={items.length}
        currentZoom={currentZoom}
        minZoom={markerMinZoom}
        isAuthenticated={isAuthenticated}
        reason={debugReason}
        additionalInfo={visibleMarkers.length !== items.length ? `Filtered: ${items.length - visibleMarkers.length}` : undefined}
      />
      
      {showLayer && (
        <LayerGroup>
          {visibleMarkers.map((marker) => {
            const inRange = !!userLocation && distance(userLocation, {lat:marker.lat,lng:marker.lng}) <= RADIUS_M;
            return (
              <MarkerComponent
                key={marker.id}
                marker={marker}
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
  marker: Item;
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick: (markerId: string, e?: any) => void;
  distance: (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => number;
  icon: (active: boolean) => L.DivIcon;
}>(({ marker, userLocation, onMarkerClick, distance, icon }) => {
  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon(marker.active)}
      eventHandlers={{
        click: (e) => onMarkerClick(marker.id, e)
      }}
      aria-label={`Marker M1SSION ${marker.title || marker.id}, ${marker.active ? 'attivo' : 'già riscattato'}`}
      // @ts-ignore - Adding accessibility attributes
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onMarkerClick(marker.id);
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
            <p className="font-medium text-sm">{marker.title || marker.id}</p>
            <Badge style={{ background: marker.active ? '#22c55e' : '#ef4444', color: 'white' }} className="text-xs">
              {marker.active ? 'ATTIVO' : 'RISCATTATO'}
            </Badge>
          </div>
          {userLocation && (
            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{Math.round(distance(userLocation, {lat:marker.lat,lng:marker.lng}))}m</span>
            </div>
          )}
          <ClaimRewardButton markerId={marker.id} />
        </div>
      </Popup>
    </Marker>
  );
});
