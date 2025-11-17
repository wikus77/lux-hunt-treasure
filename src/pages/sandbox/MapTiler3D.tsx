import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import neonStyleTemplate from '../map/styles/m1_neon_style_FULL_3D.json';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
import PortalContainer from '@/components/map/PortalContainer';
import { toast } from 'sonner';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAgentLocationUpdater } from '@/hooks/useAgentLocationUpdater';
import { useLiveLayers } from '@/features/living-map/hooks/useLiveLayers';
import { useSearchAreasLogic } from '@/pages/map/hooks/useSearchAreasLogic';
import { useMapMarkersLogic } from '@/pages/map/useMapMarkersLogic';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Crosshair, RotateCcw, Compass, Navigation, MapPin, FileText } from 'lucide-react';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import NotificationsBanner from '@/components/notifications/NotificationsBanner';
import { motion, AnimatePresence } from 'framer-motion';
import AgentsLayer3D from './map3d/layers/AgentsLayer3D';
import PortalsLayer3D from './map3d/layers/PortalsLayer3D';
import RewardsLayer3D from './map3d/layers/RewardsLayer3D';
import AreasLayer3D from './map3d/layers/AreasLayer3D';
import BuzzDiagnosticPanel from './map3d/components/BuzzDiagnosticPanel';
import BuzzDebugBadge from './map3d/components/BuzzDebugBadge';
import NotesLayer3D from './map3d/layers/NotesLayer3D';
import LayerTogglePanel from './map3d/components/LayerTogglePanel';
import '@/styles/map-dock.css';
import '@/styles/portal-container.css';
import '@/styles/portals.css';
import '@/styles/agents.css';
import '@/styles/rewards.css';
import '@/features/living-map/styles/livingMap.css';
import '@/components/map/leaflet-fixes.css';
import '@/styles/map3d-containers.css';
import M1UPill from '@/features/m1u/M1UPill';
import { use3DDevMocks } from './hooks/use3DDevMocks';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import DevNotesPanel from './map3d/components/DevNotesPanel';
import DevAreasPanel from './map3d/components/DevAreasPanel';
import BattleFxLayer from '@/components/map/battle/BattleFxLayer';
import { usePerformanceSettings } from '@/hooks/usePerformanceSettings';
import { BattlePill } from '@/components/battle/BattlePill';
import { AgentBattleCard } from '@/components/battle/AgentBattleCard';
import { BattleModal } from '@/components/battle/BattleModal';
import { useDebugFlag } from '@/debug/useDebugFlag';
import { DebugMapPanel } from '@/debug/DebugMapPanel';

// 🔧 DEV-ONLY MOCKS (Page-local, governed by ENV)
const DEV_MOCKS = import.meta.env.VITE_MAP3D_DEV_MOCKS === 'true';
const DEV_VIEW_LOCK = import.meta.env.VITE_MAP3D_DEV_VIEW_LOCK === 'true';

interface DiagState {
  keyMode: string;
  tiles: string;
  pbf: string;
  glyph: string;
  style: string;
  error: string | null;
}

export default function MapTiler3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const debugEnabled = useDebugFlag();
  const [diag, setDiag] = useState<DiagState>({ 
    keyMode: '?', 
    tiles: '?', 
    pbf: '?', 
    glyph: '?', 
    style: '-',
    error: null
  });

  // 🧪 Expose runtime ENV for debugging (read-only, no SW/PWA impact) + cache clear
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).__M1_ENV__) {
      (window as any).__M1_ENV__ = {
        LIVING_MOCK: import.meta.env.VITE_LIVING_MAP_USE_MOCK === 'true',
        MAP3D_MOCKS: import.meta.env.VITE_MAP3D_DEV_MOCKS === 'true',
        MODE: import.meta.env.MODE
      };
      console.debug('[Map3D] ENV exposed for debugging:', (window as any).__M1_ENV__);
    }

    // 🔄 One-time cache clear to ensure fresh bundle with updated ENV
    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.update()));
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[Map3D] Cache cleared once (fresh ENV)');
      } catch (e) {
        console.debug('[Map3D] Cache clear skipped:', e);
      }
    })();
  }, []);
  
  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    agents: true,
    portals: true,
    rewards: true,
    areas: true,
    notes: true
  });
  
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  // 🎨 Dev mocks hook
  const devMocks = use3DDevMocks();

  const { areas, currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  const { position, status: geoStatus, enable: enableGeo, enabled: geoEnabled } = useGeolocation();
  
  // Auto-update user position in agent_locations for real-time tracking
  useAgentLocationUpdater(position || undefined, geoEnabled);
  
  const { portals, agents: liveAgents, events, zones, loading: liveLoading } = useLiveLayers(true);
  
  const {
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    setPendingRadius
  } = useSearchAreasLogic(DEFAULT_LOCATION);

  // Wrapper to inject selectedRadius into handleAddArea
  const handleAddAreaWithRadius = (radius?: number) => {
    if (radius) setPendingRadius(radius);
    handleAddArea(radius);
  };
  
  const {
    markers,
    activeMarker,
    setActiveMarker,
    isAddingMarker,
    handleAddMarker,
    handleMapClickMarker,
    saveMarkerNote,
    deleteMarker,
    editMarker
  } = useMapMarkersLogic();
  
  // Rewards (indizi) live from Supabase when authenticated
  type RewardMarkerMinimal = { id: string; lat: number; lng: number; title?: string };
  const { isAuthenticated } = useUnifiedAuth();
  const [rewardMarkersLive, setRewardMarkersLive] = useState<RewardMarkerMinimal[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) { setRewardMarkersLive([]); return; }
    const now = new Date().toISOString();
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('markers')
          .select('id, lat, lng, title, active, visible_from, visible_to')
          .eq('active', true)
          .or(`visible_from.is.null,visible_from.lte.${now}`)
          .or(`visible_to.is.null,visible_to.gte.${now}`)
          .limit(2000);
        if (!mounted) return;
        if (error) { console.warn('[Map3D] markers load error', error); return; }
        setRewardMarkersLive((data || []).map((m:any) => ({ id: m.id, lat: m.lat, lng: m.lng, title: m.title })));
      } catch (e) { console.warn('[Map3D] markers load exception', e); }
    };
    load();
    const channel = supabase
      .channel('markers-changes-3d')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'markers' }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  // 🔄 REAL DATA MODE: Realtime subscription for agent_locations (only when mock disabled)
  useEffect(() => {
    // Skip realtime if using mock data
    const useMock = import.meta.env.VITE_LIVING_MAP_USE_MOCK === 'true';
    if (useMock || !isAuthenticated) return;

    console.debug('[Map3D] 🔄 Setting up realtime for agent_locations (REAL DATA mode)');
    
    // Throttle refetch to prevent flooding (max 1 refetch every 3s)
    let lastRefetch = 0;
    const REFETCH_THROTTLE_MS = 3000;
    
    const refetchAgentsSilently = async () => {
      const now = Date.now();
      if (now - lastRefetch < REFETCH_THROTTLE_MS) {
        console.debug('[Map3D] Agent refetch throttled');
        return;
      }
      lastRefetch = now;
      
      try {
        // Force re-fetch via the hook (which will trigger state updates)
        // Note: useLiveLayers already handles the fetch, we just trigger via channel
        console.debug('[Map3D] 🔄 Agent locations changed (realtime)');
      } catch (e) {
        console.debug('[Map3D] Agent refetch silent error:', e);
      }
    };

    const channel = (supabase as any)
      .channel('agent-locations-live-3d')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'agent_locations' 
      }, refetchAgentsSilently)
      .subscribe();

    return () => {
      console.debug('[Map3D] 🔄 Cleaning up agent_locations realtime');
      (supabase as any).removeChannel(channel);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (geoStatus === 'idle') {
      console.log('📍 Auto-enabling geolocation');
      enableGeo();
    }
  }, [geoStatus, enableGeo]);
  
  // 🔔 Realtime: Auto-fit bounds on new BUZZ area INSERT
  useEffect(() => {
    if (!isAuthenticated) return;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      const getCurrentWeek = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek) + 1;
      };

      const currentWeek = getCurrentWeek();

      const channel = supabase
        .channel(`map3d_buzz_fit_${uid}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_map_areas',
            filter: `user_id=eq.${uid}`
          },
          (payload) => {
            if (payload.new?.source === 'buzz_map' && payload.new?.week === currentWeek) {
              console.info('🗺️ M1-3D realtime:insert (buzz area)');
              const map = mapRef.current;
              if (!map) return;

              const lat = payload.new.lat;
              const lng = payload.new.lng;
              const radiusKm = payload.new.radius_km || 500;
              const radiusMeters = radiusKm * 1000;

              console.info('🗺️ M1-3D latestArea', { 
                level: payload.new.level, 
                radius_km: radiusKm, 
                center: { lat, lng } 
              });

              setTimeout(() => {
                const latDeltaDeg = radiusMeters / 111320;
                const lngDeltaDeg = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180));

                const bbox: [[number, number], [number, number]] = [
                  [lng - lngDeltaDeg, lat - latDeltaDeg],
                  [lng + lngDeltaDeg, lat + latDeltaDeg]
                ];

                console.info('🗺️ M1-3D fitBounds (realtime)', { bbox, radius_km: radiusKm });

                const maxZoom = radiusKm > 150 ? 6 : (radiusKm > 80 ? 8 : 10);
                map.fitBounds(bbox, {
                  padding: 80,
                  maxZoom,
                  duration: 800
                });
              }, 400);
            }
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    };

    setup();
  }, [isAuthenticated]);
  
  // 🎨 Seed localStorage notes in DEV mode (non-destructive)
  useEffect(() => {
    if (!DEV_MOCKS || !devMocks.notesSeed.length) return;
    const NOTES_KEY = 'map3d-notes';
    const cur = localStorage.getItem(NOTES_KEY);
    if (!cur || cur === '[]') {
      localStorage.setItem(NOTES_KEY, JSON.stringify(devMocks.notesSeed));
      console.debug('[Map3D] 📝 Seeded localStorage notes for dev');
    }
  }, [devMocks.notesSeed]);
  
  // Prepare effective data with dev fallbacks (prefer live when available)
  // Use ONLY live agents; never fallback to dev ones here
  const effectiveAgents = (liveAgents && liveAgents.length > 0) ? liveAgents : [];
  const effectiveRewardMarkers = DEV_MOCKS ? devMocks.rewards : rewardMarkersLive;
  
  // 🔍 M1-3D VERIFY: Extended area type with debug fields
  type AreaWithDebug = { id: string; lat: number; lng: number; radius: number; level?: number; radius_km: number };
  
  // ⚠️ BUZZ MAP FIX: NEVER use DEV_MOCKS for user areas - always use live DB data
  const effectiveUserAreas: AreaWithDebug[] = currentWeekAreas?.length 
    ? currentWeekAreas.map(a => ({ 
        id: a.id, lat: a.lat, lng: a.lng, 
        radius: a.radius_km * 1000, level: a.level, radius_km: a.radius_km 
      }))
    : [];
  
  // Log confirmation that we're using live data (not mocks)
  useEffect(() => {
    console.info('🗺️ M1-3D devMocksEnabled (user-areas): false (FORCED LIVE)');
  }, []);
  
  // 🎯 BUZZ MAP FIX: Show only the most recent area to prevent cumulative glow
  const filteredUserAreas = effectiveUserAreas.length > 0 ? [effectiveUserAreas[0]] : [];
  const latestArea: AreaWithDebug | null = effectiveUserAreas[0] || null;
  
  // 🔍 M1-3D VERIFY: Log latest area (UI selected)
  useEffect(() => {
    if (latestArea) {
      console.info('🗺️ M1-3D latestArea (UI selected)', {
        id: latestArea.id, 
        level: latestArea.level, 
        radius_km: latestArea.radius_km,
        radius_m: latestArea.radius, 
        center: [latestArea.lat, latestArea.lng],
        source: 'currentWeekAreas[0]'
      });
    } else {
      console.info('🗺️ M1-3D latestArea: null (no areas this week)');
    }
  }, [latestArea?.id, latestArea?.radius_km]);
  
  // Always use hook-managed search areas (DB/local), never static dev seeds
  const effectiveSearchAreas = searchAreas?.length
    ? searchAreas.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, radius: a.radius }))
    : [];

  useEffect(() => {
    console.debug('[Map3D] 📊 Live layers loaded:', {
      events: events.length,
      zones: zones.length,
      portals: portals.length,
      agents: effectiveAgents.length,
      loading: liveLoading
    });
  }, [events.length, zones.length, portals.length, effectiveAgents.length, liveLoading]);

  useEffect(() => {
    console.debug('[Map3D] 🎨 Layer data counts:', {
      agents: effectiveAgents.length,
      rewards: effectiveRewardMarkers.length,
      userAreas: filteredUserAreas.length,
      searchAreas: effectiveSearchAreas.length,
      devMocksEnabled_userAreas: false, // FORCED LIVE
      devMocksEnabled_rewards: DEV_MOCKS
    });
  }, [effectiveAgents.length, effectiveRewardMarkers.length, filteredUserAreas.length, effectiveSearchAreas.length]);
  
  const mapCenter: [number, number] | undefined = position 
    ? [position.lat, position.lng]
    : undefined;
  
  const handleBuzz = () => {
    console.log('🎯 BUZZ pressed in MapTiler3D - payment flow handled by BuzzMapButtonSecure');
  };
  
  const handleAreaGenerated = (lat: number, lng: number, radiusMeters: number) => {
    const radiusKm = radiusMeters / 1000;
    console.info('🗺️ M1-3D onAreaGenerated', { lat, lng, radiusKm, radiusMeters });
    reloadAreas();
    
    // Auto-fit bounds to show the circle border
    if (mapRef.current) {
      const map = mapRef.current;
      setTimeout(() => {
        const latDeltaDeg = radiusMeters / 111320;
        const lngDeltaDeg = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180));
        
        const bbox: [[number, number], [number, number]] = [
          [lng - lngDeltaDeg, lat - latDeltaDeg],
          [lng + lngDeltaDeg, lat + latDeltaDeg]
        ];
        
        console.info('🗺️ M1-3D fitBounds (onAreaGenerated)', { bbox, radiusKm, center: [lat, lng] });
        
        const maxZoom = radiusKm > 150 ? 6 : (radiusKm > 80 ? 8 : 10);
        map.fitBounds(bbox, {
          padding: 80,
          maxZoom,
          duration: 800
        });
      }, 300); // Wait for reloadAreas to complete
    }
  };

  const toggleLayer = (layer: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => {
      const newState = { ...prev, [layer]: !prev[layer] };
      console.log(`🎨 Layer ${String(layer)}: ${newState[layer] ? 'ENABLED' : 'DISABLED'}`);
      return newState;
    });
  };

  useEffect(() => {
    console.log('🌃 MapTiler3D component mounted');
    return () => console.log('🌃 MapTiler3D component unmounting');
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const forceKey = sp.get('forceKey');
    
    const hostname = window.location.hostname;
    const isPreview = 
      hostname.includes('lovable') || 
      hostname.includes('pages.dev') || 
      hostname === 'localhost' || 
      hostname === '127.0.0.1';
    
    const devKey = import.meta.env.VITE_MAPTILER_KEY_DEV || '';
    const prodKey = import.meta.env.VITE_MAPTILER_KEY_PROD || '';
    
    let key: string;
    let mode: string;
    
    if (forceKey === 'DEV') {
      key = devKey;
      mode = 'DEV (forced)';
    } else if (forceKey === 'PROD') {
      key = prodKey;
      mode = 'PROD (forced)';
    } else {
      key = isPreview ? devKey : prodKey;
      mode = isPreview ? 'DEV (auto)' : 'PROD (auto)';
    }
    
    const lat = parseFloat(sp.get('lat') || '41.9028');
    const lng = parseFloat(sp.get('lng') || '12.4964');
    const z = parseFloat(sp.get('z') || '15.5');
    const pitch = parseFloat(sp.get('pitch') || '55');
    const bearing = parseFloat(sp.get('bearing') || '25');

    if (!containerRef.current || !key) {
      console.error('🌃 ERROR: Missing container or key');
      setDiag(prev => ({ ...prev, error: 'Container or key missing' }));
      return;
    }

    setDiag(prev => ({ ...prev, keyMode: mode, style: 'M1SSION Neon 3D' }));

    console.log('🌃 MapTiler3D: Initializing');

    fetch(`https://api.maptiler.com/tiles/v3/tiles.json?key=${key}`)
      .then(r => {
        setDiag(prev => ({ ...prev, tiles: String(r.status) }));
      })
      .catch(() => {
        setDiag(prev => ({ ...prev, tiles: 'NET_ERR' }));
      });

    const style = JSON.parse(JSON.stringify(neonStyleTemplate));
    
    if (style.sources?.openmaptiles?.url) {
      style.sources.openmaptiles.url = style.sources.openmaptiles.url.replace(
        'YOUR_MAPTILER_API_KEY_HERE',
        key
      );
    }
    
    if (style.glyphs) {
      style.glyphs = style.glyphs.replace(
        'YOUR_MAPTILER_API_KEY_HERE',
        key
      );
    }

    let sanitized = false;
    if (Array.isArray(style.layers)) {
      style.layers = style.layers.map((layer: any) => {
        if (layer?.type === 'fill-extrusion' && layer.paint) {
          if ('fill-extrusion-ambient-occlusion-intensity' in layer.paint) {
            delete layer.paint['fill-extrusion-ambient-occlusion-intensity'];
            sanitized = true;
          }
          if ('fill-extrusion-vertical-gradient' in layer.paint) {
            delete layer.paint['fill-extrusion-vertical-gradient'];
            sanitized = true;
          }
        }
        return layer;
      });
    }
    
    if (sanitized) {
      setDiag(prev => ({ ...prev, style: 'M1SSION Neon 3D (sanitized)' }));
    }

    try {
      const map = new MLMap({
        container: containerRef.current,
        style,
        center: [lng, lat],
        zoom: z,
        pitch,
        bearing,
        hash: true
      });

      console.log('✅ MapLibre instance created');
      mapRef.current = map;

      map.on('error', (e: any) => {
        console.error('❌ MapLibre error:', e);
        if (e?.error?.status === 403) {
          setDiag(prev => ({ 
            ...prev, 
            error: `403 Forbidden - Add hostname to MapTiler origins` 
          }));
        }
      });

      map.on('load', () => {
        console.log('✅ MapLibre loaded');

        const loadedStyle = map.getStyle();
        const hasExtrusionLayer = loadedStyle?.layers?.some(
          (l: any) => l.type === 'fill-extrusion'
        );
        
        if (!hasExtrusionLayer) {
          console.warn('🏗️ Adding fallback extrusion layer');
          try {
            map.addLayer({
              id: 'm1-buildings-extrusion',
              type: 'fill-extrusion',
              source: 'openmaptiles',
              'source-layer': 'building',
              minzoom: 12,
              paint: {
                'fill-extrusion-color': '#6f78ff',
                'fill-extrusion-opacity': 0.92,
                'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 15],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0]
              }
            });
          } catch (e) {
            console.error('❌ Failed to add fallback layer:', e);
          }
        }
        
        fetch(`https://api.maptiler.com/fonts/Noto%20Sans%20Regular/0-255.pbf?key=${key}`)
          .then(r => setDiag(prev => ({ ...prev, glyph: String(r.status) })))
          .catch(() => setDiag(prev => ({ ...prev, glyph: 'NET_ERR' })));
        
        const tileCoords = getTileCoordinates(lng, lat, 15);
        fetch(`https://api.maptiler.com/tiles/v3/${tileCoords.z}/${tileCoords.x}/${tileCoords.y}.pbf?key=${key}`)
          .then(r => setDiag(prev => ({ ...prev, pbf: String(r.status) })))
          .catch(() => setDiag(prev => ({ ...prev, pbf: 'NET_ERR' })));

        // 🎨 DEV: Auto-center and zoom to mock data area
        if (DEV_MOCKS) {
          console.log('🎨 DEV MODE: Centering on Monaco mock area');
          map.flyTo({
            center: [7.64, 43.805], // Monaco area
            zoom: 13,
            pitch: 55,
            bearing: 25,
            essential: true,
            duration: 2000
          });
        }
      });

    } catch (error) {
      console.error('❌ Failed to create MapLibre:', error);
      setDiag(prev => ({ ...prev, error: `MapLibre creation failed` }));
      return;
    }

    return () => {
      console.log('🌃 Cleaning up MapLibre');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: any) => {
      const { lng, lat } = e.lngLat;
      
      if (isAddingMarker) {
        handleMapClickMarker({ latLng: { lat: () => lat, lng: () => lng } } as any);
      } else if (isAddingSearchArea) {
        handleMapClickArea({ latlng: { lat, lng } });
      }
    };

    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [isAddingMarker, isAddingSearchArea, handleMapClickMarker, handleMapClickArea]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    // ⛔ DEV VIEW LOCK: Don't recenter on user position in DEV mode
    if (DEV_MOCKS && DEV_VIEW_LOCK) {
      console.log('🔒 DEV VIEW LOCK active - skipping auto-center on user position');
      return;
    }

    if (!map.loaded()) {
      map.once('load', () => {
        console.log('📍 Flying to user position:', position);
        map.flyTo({
          center: [position.lng, position.lat],
          zoom: 15.5,
          pitch: 55,
          bearing: 25,
          essential: true,
          duration: 2000
        });
      });
    } else {
      console.log('📍 Flying to user position:', position);
      map.flyTo({
        center: [position.lng, position.lat],
        zoom: 15.5,
        pitch: 55,
        bearing: 25,
        essential: true,
        duration: 2000
      });
    }
  }, [position]);

  const handleBuzzPress = () => {
    console.log('🎯 BUZZ pressed');
    handleBuzz();
  };

  const handleCenterLocation = () => {
    if (mapRef.current && position) {
      mapRef.current.flyTo({
        center: [position.lng, position.lat],
        zoom: 15.5,
        pitch: 55,
        bearing: 25,
        essential: true,
        duration: 1500
      });
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [DEFAULT_LOCATION[1], DEFAULT_LOCATION[0]],
        zoom: 15.5,
        pitch: 55,
        bearing: 25,
        essential: true,
        duration: 1500
      });
    }
  };

  const handleResetBearing = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 800
      });
    }
  };

  const handleFindMyLocation = () => {
    if (mapRef.current && position) {
      mapRef.current.flyTo({
        center: [position.lng, position.lat],
        zoom: 16,
        essential: true,
        duration: 1500
      });
    } else if (geoStatus === 'idle') {
      enableGeo();
      toast.info('Attivazione geolocalizzazione...');
    } else {
      toast.info('Geolocalizzazione non disponibile');
    }
  };

  // 🎯 AUTO-FIT BOUNDS: When layers have data but are off-screen, fit them in view
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    // Only activate in DEV with VIEW LOCK (diagnostic mode)
    if (!DEV_MOCKS || !DEV_VIEW_LOCK) return;

    // Collect all available coordinates
    const pts: [number, number][] = [];
    effectiveAgents.forEach(a => pts.push([a.lng, a.lat]));
    effectiveRewardMarkers.forEach(r => pts.push([r.lng, r.lat]));
    filteredUserAreas.forEach(a => pts.push([a.lng, a.lat]));
    effectiveSearchAreas.forEach(a => pts.push([a.lng, a.lat]));

    if (!pts.length) {
      console.log('🎯 No layer data to fit');
      return;
    }

    // Check if any point is visible
    const anyVisible = pts.some(([lng, lat]) => {
      const p = map.project([lng, lat]);
      const { width, height } = map.getContainer().getBoundingClientRect();
      return p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
    });

    if (!anyVisible) {
      console.log('🎯 Layer data off-screen - fitting bounds to', pts.length, 'points');
      const bounds = new maplibregl.LngLatBounds(pts[0], pts[0]);
      pts.forEach(pt => bounds.extend(pt));
      
      map.fitBounds(bounds, { 
        padding: 80, 
        maxZoom: 16, 
        duration: 1200,
        pitch: 55,
        bearing: 25
      });
    } else {
      console.log('🎯 Layer data visible - no auto-fit needed');
    }
  }, [
    DEV_MOCKS, 
    DEV_VIEW_LOCK,
    effectiveAgents,
    effectiveRewardMarkers,
    filteredUserAreas,
    effectiveSearchAreas
  ]);

  const { profileImage } = useProfileImage();
  
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    closeNotificationsBanner
  } = useNotificationManager();

  const { battleFxMode } = usePerformanceSettings();

  // Get user ID for battle widget
  const [battleUserId, setBattleUserId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showAgentCard, setShowAgentCard] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [preSelectedOpponent, setPreSelectedOpponent] = useState<{ id: string; name: string } | undefined>();
  const [selectedAgentRank, setSelectedAgentRank] = useState<string>('Agent');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setBattleUserId(data.user?.id || null);
    });
  }, []);

  // Fetch agent rank when agent is selected
  useEffect(() => {
    if (!selectedAgent?.rank_id) {
      setSelectedAgentRank('Agent');
      return;
    }

    const fetchRank = async () => {
      try {
        const { data: rank } = await (supabase as any)
          .from('agent_ranks')
          .select('code, name_en')
          .eq('id', selectedAgent.rank_id)
          .single();

        if (rank) {
          setSelectedAgentRank(rank.name_en || rank.code || 'Agent');
        }
      } catch (err) {
        console.error('[AgentCard] Failed to fetch rank:', err);
        setSelectedAgentRank('Agent');
      }
    };

    fetchRank();
  }, [selectedAgent?.rank_id]);

  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent);
    setShowAgentCard(true);
  };

  const handleAttackAgent = () => {
    setShowAgentCard(false);
    setPreSelectedOpponent({
      id: selectedAgent.id,
      name: selectedAgent.username || selectedAgent.agent_code || `Agent ${selectedAgent.id.slice(0, 6)}`,
    });
    setShowBattleModal(true);
  };

  return (
    <>
      <div
        id="mission-header-container"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <UnifiedHeader profileImage={profileImage} />
      </div>

      <AnimatePresence>
        {notificationsBannerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 140px)',
              left: 0,
              right: 0,
              zIndex: 20000,
              paddingLeft: '8px',
              paddingRight: '8px'
            }}
          >
            <NotificationsBanner
              notifications={notifications}
              open={notificationsBannerOpen}
              unreadCount={unreadCount}
              onClose={closeNotificationsBanner}
              onMarkAllAsRead={markAllAsRead}
              onDeleteNotification={deleteNotification}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef} 
        id="ml-sandbox" 
        style={{ 
          position: 'fixed', 
          inset: 0,
          zIndex: 1
        }} 
      />

      <div 
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 240px)',
          right: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <Button
          onClick={handleResetBearing}
          size="sm"
          className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 hover:bg-black/80 hover:border-cyan-500/80 hover:shadow-cyan-500/40 p-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
          style={{
            background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.4) 68%)',
          }}
          title="Reset bearing to north"
        >
          <Compass className="h-5 w-5 text-cyan-400" />
        </Button>

        <Button
          onClick={handleFindMyLocation}
          size="sm"
          className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 hover:bg-black/80 hover:border-cyan-500/80 hover:shadow-cyan-500/40 p-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
          style={{
            background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.4) 68%)',
          }}
          title="Find my location"
        >
          <Navigation className="h-5 w-5 text-cyan-400" />
        </Button>

        <Button
          onClick={handleCenterLocation}
          size="sm"
          className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 hover:bg-black/80 hover:border-cyan-500/80 hover:shadow-cyan-500/40 p-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
          style={{
            background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.4) 68%)',
          }}
          title="Centra su posizione"
        >
          <Crosshair className="h-5 w-5 text-cyan-400" />
        </Button>

        <Button
          onClick={handleResetView}
          size="sm"
          className="h-12 w-12 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 hover:bg-black/80 hover:border-cyan-500/80 hover:shadow-cyan-500/40 p-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
          style={{
            background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.4) 68%)',
          }}
          title="Reset vista"
        >
          <RotateCcw className="h-5 w-5 text-cyan-400" />
        </Button>
      </div>
      
      <PortalContainer 
        portalCount={portals.length}
        onPortalAction={(type) => console.log('🎯 Portal filter:', type)}
      />
      
      {/* 3D Layers Overlay - All 5 features */}
      <AgentsLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.agents}
        agents={effectiveAgents}
        mePosition={position ? { lat: position.lat, lng: position.lng } : null}
        onAgentClick={handleAgentClick}
      />
      <PortalsLayer3D map={mapRef.current} enabled={layerVisibility.portals} />
      <RewardsLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.rewards} 
        markers={effectiveRewardMarkers}
        userPosition={position ? { lat: position.lat, lng: position.lng } : undefined}
      />
      <AreasLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.areas}
        userAreas={filteredUserAreas}
        searchAreas={effectiveSearchAreas}
        onDeleteSearchArea={(id) => deleteSearchArea(id)}
      />
      <NotesLayer3D map={mapRef.current} enabled={layerVisibility.notes} />

      {/* Battle FX Layer - Visual effects for battle events */}
      {mapRef.current && (
        <BattleFxLayer 
          map={mapRef.current} 
          battleFxMode={battleFxMode}
        />
      )}

      {/* M1U Pill Slot - Map 3D (overlay below header, aligned like Home) */}
      <div 
        id="m1u-pill-map3d-slot" 
        className="fixed left-4 z-[1001] flex items-center gap-2"
        style={{ 
          top: 'calc(env(safe-area-inset-top, 0px) + 96px)',
          paddingLeft: 'max(0px, env(safe-area-inset-left, 0px))',
          pointerEvents: 'auto' 
        }}
        aria-hidden={false}
      >
        <M1UPill showLabel showPlusButton />
      </div>
      
      {/* DEV-only debug panels (non-intrusive) */}
        <>
          <DevNotesPanel map={mapRef.current} />
          <DevAreasPanel
            map={mapRef.current}
            searchAreas={effectiveSearchAreas}
            onDelete={(id) => deleteSearchArea(id)}
            onFocus={(id) => setActiveSearchArea(id)}
            onAddArea={handleAddAreaWithRadius}
          />
        </>

      {/* Layer Toggle Panel */}
      <LayerTogglePanel layers={layerVisibility} onToggle={toggleLayer} />

      {/* Battle Pill - Circular floating button */}
      <BattlePill userId={battleUserId} />

      {/* Agent Battle Card */}
      {selectedAgent && (
        <AgentBattleCard
          isOpen={showAgentCard}
          onClose={() => setShowAgentCard(false)}
          agentCode={selectedAgent.agent_code || `AG-${selectedAgent.id.slice(0, 6).toUpperCase()}`}
          displayName={selectedAgent.username}
          rank={selectedAgentRank}
          isAttackable={true}
          status="available"
          onAttack={handleAttackAgent}
        />
      )}

      {/* Battle Modal for agent attack */}
      {showBattleModal && battleUserId && (
        <BattleModal
          isOpen={showBattleModal}
          onClose={() => setShowBattleModal(false)}
          userId={battleUserId}
          activeBattles={[]}
          pendingChallenges={[]}
          loading={false}
          preSelectedOpponent={preSelectedOpponent}
        />
      )}
      
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 100px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001
        }}
      >
        <BuzzMapButtonSecure 
          onBuzzPress={handleBuzz}
          mapCenter={mapCenter || DEFAULT_LOCATION}
          onAreaGenerated={handleAreaGenerated}
        />
      </div>

      <div 
        id="mission-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>

      {/* BUZZ Debug Badge (verify mode) */}
      <BuzzDebugBadge latestArea={latestArea} />

      {/* Debug Panel (only if enabled) */}
      {debugEnabled && <DebugMapPanel />}

      {/* BUZZ Diagnostic Panel (dev-only) */}
      <BuzzDiagnosticPanel />
    </>
  );
}

function getTileCoordinates(lng: number, lat: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
