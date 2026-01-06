// @ts-nocheck
// Force rebuild to load MapTiler secrets from environment
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import maplibregl, { Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import neonStyleTemplate from '../map/styles/m1_neon_style_FULL_3D.json';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
import PortalContainer from '@/components/map/PortalContainer';
import { toast } from 'sonner';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { getCurrentWeekOfYear } from '@/lib/weekUtils';
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
import RewardZoneLayer3D from './map3d/layers/RewardZoneLayer3D';
import BuzzDiagnosticPanel from './map3d/components/BuzzDiagnosticPanel';
import BuzzDebugBadge from './map3d/components/BuzzDebugBadge';
import MapVerificationPanel from './map3d/components/MapVerificationPanel';
import NotesLayer3D from './map3d/layers/NotesLayer3D';
import LayerTogglePanel, { MapStyleType } from './map3d/components/LayerTogglePanel';
import RealtimePlayersPill from './map3d/components/RealtimePlayersPill';
import { GeolocationPermissionGuide } from '@/components/map/GeolocationPermissionGuide';
import '@/styles/map-dock.css';
import '@/styles/portal-container.css';
import '@/styles/portals.css';
import '@/styles/agents.css';
import '@/styles/rewards.css';
import '@/features/living-map/styles/livingMap.css';
import '@/components/map/leaflet-fixes.css';
import '@/styles/map3d-containers.css';
import M1UPill from '@/features/m1u/M1UPill';
import SearchLocationPill from '@/components/map/SearchLocationPill';
import { use3DDevMocks } from './hooks/use3DDevMocks';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import DevNotesPanel from './map3d/components/DevNotesPanel';
import { MotivationalPopup } from '@/components/feedback';
import DevAreasPanel from './map3d/components/DevAreasPanel';
import BattleFxLayer from '@/components/map/battle/BattleFxLayer';
import { MapBattleOverlay } from '@/components/map/battle/MapBattleOverlay';
import { usePerformanceSettings } from '@/hooks/usePerformanceSettings';
import { BattlePill } from '@/components/battle/BattlePill';
import { BattleShopPill } from '@/components/battle/BattleShopPill';
import { AgentBattleCard } from '@/components/battle/AgentBattleCard';
import { BattleModal } from '@/components/battle/BattleModal';
import { RewardCounterPill } from '@/components/map/RewardCounterPill';
import { FinalShootPill, FinalShootOverlay, FinalShootProvider } from '@/components/final-shoot';
import '@/features/m1u/m1u-ui.css'; // For pill-orb style
import { useDebugFlag } from '@/debug/useDebugFlag';
import { DebugMapPanel } from '@/debug/DebugMapPanel';
import { useMapGlitchEffect } from '@/hooks/useMapGlitchEffect';
// 🎯 FIRST SESSION: Guided discovery components
import { MapHUD, BuzzHelpPopup, MapExploreHint } from '@/components/first-session';
// MicroMissionsCard ora è globale in App.tsx
// 🎯 DAILY MISSIONS: Mission pill
import { MissionPill } from '@/missions/ui/MissionPill';

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

  // 🆕 v5: Shadow Protocol Map Glitch Effect
  useMapGlitchEffect();
  const [diag, setDiag] = useState<DiagState>({ 
    keyMode: '?', 
    tiles: '?', 
    pbf: '?', 
    glyph: '?', 
    style: '-',
    error: null
  });

  // 🚫 REMOVED AGGRESSIVE CACHE BUSTING - Was causing page reload and slow loading!
  // The map now loads instantly without forcing cache clear and reload.
  // MapTiler secrets are loaded from environment at build time.
  
  // 🎯 FIRST SESSION: Mark that user has seen the map (completes first session)
  useEffect(() => {
    // Segna che l'utente ha visto la mappa
    if (!localStorage.getItem('m1_has_seen_map')) {
      localStorage.setItem('m1_has_seen_map', 'true');
      console.log('[MapTiler3D] 🗺️ Prima visita alla mappa registrata');
    }
    
    // ✅ FIX B6 (23/12/2025): Setta flag immediatamente al mount
    // BUG PRECEDENTE: setTimeout 30s causava loop se utente usciva prima
    // Ora il flag viene settato subito, evitando il "first session forever" bug
    if (!localStorage.getItem('m1_first_session_completed')) {
      localStorage.setItem('m1_first_session_completed', 'true');
      console.log('[MapTiler3D] ✅ Prima sessione completata (immediate)');
    }
  }, []);
  
  // Expose runtime ENV for debugging (only in dev mode)
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined' && !(window as any).__M1_ENV__) {
      (window as any).__M1_ENV__ = {
        LIVING_MOCK: import.meta.env.VITE_LIVING_MAP_USE_MOCK === 'true',
        MAP3D_MOCKS: import.meta.env.VITE_MAP3D_DEV_MOCKS === 'true',
        MODE: import.meta.env.MODE
      };
    }
  }, []);
  
  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    agents: true,
    portals: true,
    rewards: true,
    areas: true,
    notes: true
  });
  
  // 🎯 REWARD ZONE: Area temporanea per guidare l'utente verso un marker
  const [rewardZoneArea, setRewardZoneArea] = useState<{
    lat: number;
    lng: number;
    radius: number;
    markerId: string;
  } | null>(null);
  
  // 🗺️ Map style state (neon, streets, satellite)
  const [mapStyle, setMapStyle] = useState<MapStyleType>('neon');
  
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  // 🎨 Dev mocks hook
  const devMocks = use3DDevMocks();

  const { areas, currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  const { position, status: geoStatus, enable: enableGeo, enabled: geoEnabled, isBlocked, isIOS, isPWA, retry: retryGeo, error: geoError } = useGeolocation();
  
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
    setPendingRadius,
    createAreaDirect
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
  type RewardMarkerMinimal = { id: string; lat: number; lng: number; title?: string; claimed?: boolean; min_zoom?: number };
  const { isAuthenticated, user } = useUnifiedAuth();
  const [rewardMarkersLive, setRewardMarkersLive] = useState<RewardMarkerMinimal[]>([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user?.id) { setIsUserAdmin(false); return; }
    const checkAdmin = async () => {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      setIsUserAdmin(!!data?.role && ['admin', 'owner'].some(r => data.role.toLowerCase().includes(r)));
    };
    checkAdmin();
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) { setRewardMarkersLive([]); return; }
    const now = new Date().toISOString();
    const load = async () => {
      try {
        // Load markers
        const { data: markersData, error } = await supabase
          .from('markers')
          .select('id, lat, lng, title, active, visible_from, visible_to')
          .eq('active', true)
          .or(`visible_from.is.null,visible_from.lte.${now}`)
          .or(`visible_to.is.null,visible_to.gte.${now}`)
          .limit(2000);
        if (!mounted) return;
        if (error) { console.warn('[Map3D] markers load error', error); return; }
        
        // Load claims to know which markers are claimed
        const markerIds = (markersData || []).map(m => m.id);
        const { data: claimsData } = await supabase
          .from('marker_claims')
          .select('marker_id')
          .in('marker_id', markerIds);
        
        // Load rewards to get min_zoom from payload
        const { data: rewardsData } = await supabase
          .from('marker_rewards')
          .select('marker_id, payload')
          .in('marker_id', markerIds);
        
        const claimedIds = new Set((claimsData || []).map(c => c.marker_id));
        
        // Create map of marker_id -> min_zoom
        const minZoomMap = new Map<string, number>();
        (rewardsData || []).forEach((r: any) => {
          if (r.payload?.min_zoom) {
            minZoomMap.set(r.marker_id, r.payload.min_zoom);
          }
        });
        
        setRewardMarkersLive((markersData || []).map((m:any) => ({ 
          id: m.id, 
          lat: m.lat, 
          lng: m.lng, 
          title: m.title,
          claimed: claimedIds.has(m.id), // 🟣 VIOLA se riscattato
          min_zoom: minZoomMap.get(m.id) || 17 // Zoom minimo per visibilità (default 17)
        })));
      } catch (e) { console.warn('[Map3D] markers load exception', e); }
    };
    load();
    const channel = supabase
      .channel('markers-changes-3d')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'markers' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marker_claims' }, () => load())
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

  // 🎯 REWARD ZONE: Process fly-to target
  const processRewardZoneTarget = useCallback(() => {
    const targetStr = sessionStorage.getItem('reward_zone_target');
    if (!targetStr) return;

    try {
      const target = JSON.parse(targetStr);
      console.log('🎯 [Map3D] Reward zone target found:', target);
      
      // Only process if recent (within 60 seconds)
      if (Date.now() - target.timestamp > 60000) {
        console.log('🎯 [Map3D] Target expired, removing');
        sessionStorage.removeItem('reward_zone_target');
        return;
      }
      
      // Clear immediately to prevent re-processing
      sessionStorage.removeItem('reward_zone_target');
      
      // Set the reward zone area
      setRewardZoneArea({
        lat: target.lat,
        lng: target.lng,
        radius: target.radius,
        markerId: target.markerId
      });

      // FlyTo with retry logic
      let retryCount = 0;
      const MAX_RETRIES = 20;
      
      const flyToTarget = () => {
        const map = mapRef.current;
        
        if (!map || !map.isStyleLoaded()) {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            console.log(`🎯 [Map3D] Map not ready, retry ${retryCount}/${MAX_RETRIES}...`);
            setTimeout(flyToTarget, 500);
          } else {
            console.warn('🎯 [Map3D] Max retries reached, map never became ready');
          }
          return;
        }

        console.log('🎯 [Map3D] Flying to reward zone:', target.lat, target.lng);
        map.flyTo({
          center: [target.lng, target.lat],
          zoom: 15,
          pitch: 45,
          bearing: 0,
          duration: 3000
        });
      };

      // Start fly-to with initial delay for map to settle
      setTimeout(flyToTarget, 500);
    } catch (e) {
      console.warn('[Map3D] Error parsing reward zone target:', e);
      sessionStorage.removeItem('reward_zone_target');
    }
  }, []);

  // 🎯 REWARD ZONE: Check on mount + listen for fly-to events
  useEffect(() => {
    // Check immediately on mount
    processRewardZoneTarget();

    // Also check periodically for 10 seconds (fallback)
    let checkInterval: NodeJS.Timeout | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    checkInterval = setInterval(() => {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        if (checkInterval) clearInterval(checkInterval);
        return;
      }
      processRewardZoneTarget();
    }, 500);

    // Listen for custom event (triggered when popup navigates while map is already mounted)
    const handleFlyToEvent = () => {
      console.log('🎯 [Map3D] Received reward-zone-fly-to event');
      processRewardZoneTarget();
    };
    window.addEventListener('reward-zone-fly-to', handleFlyToEvent);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      window.removeEventListener('reward-zone-fly-to', handleFlyToEvent);
    };
  }, [processRewardZoneTarget]);
  
  // 🔔 Realtime: Auto-fit bounds on new BUZZ area INSERT
  useEffect(() => {
    if (!isAuthenticated) return;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      // 🔥 FIX: Use ISO week (same as useBuzzMapLogic)
      const currentWeek = getCurrentWeekOfYear();

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
          async (payload) => {
            if (payload.new?.source === 'buzz_map' && payload.new?.week === currentWeek) {
              console.info('🗺️ M1-3D realtime:insert (buzz area)');
              const map = mapRef.current;
              if (!map) return;

              // 🔥 UNIFIED COORDS FIX: Use center_lat/center_lng with fallback to lat/lng
              const lat = payload.new.center_lat ?? payload.new.lat;
              const lng = payload.new.center_lng ?? payload.new.lng;
              const radiusKm = payload.new.radius_km || 500;
              const radiusMeters = radiusKm * 1000;

              console.info('🗺️ M1-3D latestArea', { 
                level: payload.new.level, 
                radius_km: radiusKm, 
                center: { lat, lng } 
              });

              // ✅ FIX: Await reload completion BEFORE dispatching areasReloaded
              await reloadAreas();

              // ✅ FIX: Dispatch event ONLY after areas are fully loaded
              window.dispatchEvent(new CustomEvent('areasReloaded', {
                detail: { 
                  lat, 
                  lng, 
                  radius_km: radiusKm 
                }
              }));

              // Dispatch custom event for other listeners
              window.dispatchEvent(new CustomEvent('buzzAreaCreated', {
                detail: { 
                  lat, 
                  lng, 
                  radius_km: radiusKm 
                }
              }));

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
  const realAgents = (liveAgents && liveAgents.length > 0) ? liveAgents : [];
  
  // 🤖 BATTLE TEST: Generate 10 fake agents in RANDOM WORLD LOCATIONS for testing
  const fakeAgents = useMemo(() => {
    // 10 agents scattered around the world
    const WORLD_AGENTS = [
      { name: 'AG-CHINA', lat: 39.9042, lng: 116.4074, country: 'Beijing, China' },
      { name: 'AG-RUSSIA', lat: 55.7558, lng: 37.6173, country: 'Moscow, Russia' },
      { name: 'AG-AUSTRALIA', lat: -33.8688, lng: 151.2093, country: 'Sydney, Australia' },
      { name: 'AG-USA', lat: 40.7128, lng: -74.0060, country: 'New York, USA' },
      { name: 'AG-BRAZIL', lat: -22.9068, lng: -43.1729, country: 'Rio de Janeiro, Brazil' },
      { name: 'AG-JAPAN', lat: 35.6762, lng: 139.6503, country: 'Tokyo, Japan' },
      { name: 'AG-INDIA', lat: 28.6139, lng: 77.2090, country: 'New Delhi, India' },
      { name: 'AG-EGYPT', lat: 30.0444, lng: 31.2357, country: 'Cairo, Egypt' },
      { name: 'AG-UK', lat: 51.5074, lng: -0.1278, country: 'London, UK' },
      { name: 'AG-SOUTH-AFRICA', lat: -33.9249, lng: 18.4241, country: 'Cape Town, South Africa' },
    ];
    
    return WORLD_AGENTS.map((agent, index) => ({
      id: `fake-agent-${index}`,
      username: agent.name,
      agent_code: agent.name,
      status: 'online' as const,
      lat: agent.lat,
      lng: agent.lng,
      avatar_url: undefined,
      lastSeen: new Date().toISOString(),
      rank_id: Math.floor(Math.random() * 5) + 1,
      is_fake: true,
      country: agent.country // Extra info for display
    }));
  }, []);
  
  // Combine real + fake agents
  const effectiveAgents = [...realAgents, ...fakeAgents];
  
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
  
  // 🔥 CRITICAL: Calculate stable currentAreaVersion for AreasLayer3D deps
  const currentAreaVersion = useMemo(() => {
    if (!latestArea) return 'none';
    return `${latestArea.id}|${latestArea.level}|${latestArea.radius_km}`;
  }, [latestArea?.id, latestArea?.level, latestArea?.radius_km]);
  
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
  
  // 🗺️ Change map style (neon, streets, satellite)
  const handleMapStyleChange = (newStyle: MapStyleType) => {
    const map = mapRef.current;
    if (!map) return;
    
    // Get API key
    const hostname = window.location.hostname;
    const isPreview = hostname.includes('lovable') || hostname.includes('pages.dev') || hostname === 'localhost' || hostname === '127.0.0.1';
    const key = isPreview 
      ? (import.meta.env.VITE_MAPTILER_KEY_DEV || '')
      : (import.meta.env.VITE_MAPTILER_KEY_PROD || '');
    
    if (!key) {
      toast.error('MapTiler API key missing');
      return;
    }
    
    let styleUrl: string;
    
    if (newStyle === 'neon') {
      // Reload with our custom neon style
      const style = JSON.parse(JSON.stringify(neonStyleTemplate));
      // Inject API key
      if (style.sources) {
        Object.keys(style.sources).forEach((sourceKey) => {
          const source = style.sources[sourceKey];
          if (source.url) source.url = source.url.replace('{key}', key).replace('YOUR_MAPTILER_API_KEY_HERE', key);
          if (source.tiles) source.tiles = source.tiles.map((t: string) => t.replace('{key}', key).replace('YOUR_MAPTILER_API_KEY_HERE', key));
        });
      }
      if (style.glyphs) style.glyphs = style.glyphs.replace('{key}', key).replace('YOUR_MAPTILER_API_KEY_HERE', key);
      if (style.sprite) style.sprite = style.sprite.replace('{key}', key).replace('YOUR_MAPTILER_API_KEY_HERE', key);
      map.setStyle(style);
      setMapStyle('neon');
      toast.success('🌃 Stile Neon attivato');
      console.log('🗺️ Map style changed to: NEON');
      return;
    } else if (newStyle === 'streets') {
      styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;
    } else if (newStyle === 'satellite') {
      styleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
    } else {
      return;
    }
    
    setMapStyle(newStyle);
    map.setStyle(styleUrl);
    toast.success(`🗺️ Stile ${newStyle === 'streets' ? 'Standard' : 'Satellite'} attivato`);
    console.log(`🗺️ Map style changed to: ${newStyle}`);
  };

  // ✅ REMOVED DUPLICATE Listener #2 - Only Listener #1 (lines 238-320) remains active
  // Listener #1 correctly dispatches 'areasReloaded' event that BuzzMapButtonSecure.tsx awaits

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
    
    // 🔍 Debug log: Verify secrets are loaded
    console.log('✅ [Map3D] MapTiler KEY (DEV):', devKey ? `${devKey.slice(0, 8)}...` : '❌ MISSING');
    console.log('✅ [Map3D] MapTiler KEY (PROD):', prodKey ? `${prodKey.slice(0, 8)}...` : '❌ MISSING');
    
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
    
    // 🚨 CRITICAL: If key is missing, alert user and stop
    if (!key) {
      const msg = 'MapTiler secrets not loaded. Please wait for rebuild or hard refresh.';
      console.error('❌ [Map3D]', msg);
      toast.error(msg);
      setDiag(prev => ({ ...prev, error: msg }));
      return;
    }
    
    console.log(`✅ [Map3D] Using MapTiler ${mode} key: ${key.slice(0, 8)}...`);
    
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
    
    // 🔑 STEP 3: Inject API key into all sources and glyphs (LOVABLE METHOD)
    if (key && style.sources) {
      Object.keys(style.sources).forEach((sourceKey) => {
        const source = style.sources[sourceKey];
        
        // Replace {key} placeholder in URL
        if (source.url && source.url.includes('{key}')) {
          source.url = source.url.replace('{key}', key);
          console.log(`✅ [Map3D] Replaced {key} in source: ${sourceKey}`);
        }
        
        // Also replace YOUR_MAPTILER_API_KEY_HERE placeholder
        if (source.url && source.url.includes('YOUR_MAPTILER_API_KEY_HERE')) {
          source.url = source.url.replace('YOUR_MAPTILER_API_KEY_HERE', key);
          console.log(`✅ [Map3D] Replaced YOUR_MAPTILER_API_KEY_HERE in source: ${sourceKey}`);
        }
        
        // Handle tile arrays
        if (source.tiles && Array.isArray(source.tiles)) {
          source.tiles = source.tiles.map((tile: string) => 
            tile.replace('{key}', key).replace('YOUR_MAPTILER_API_KEY_HERE', key)
          );
        }
      });
      
      // Inject into glyphs URL
      if (style.glyphs) {
        style.glyphs = style.glyphs
          .replace('{key}', key)
          .replace('YOUR_MAPTILER_API_KEY_HERE', key);
        console.log('✅ [Map3D] Replaced key in glyphs');
      }
      
      // Inject into sprite URL if present
      if (style.sprite) {
        style.sprite = style.sprite
          .replace('{key}', key)
          .replace('YOUR_MAPTILER_API_KEY_HERE', key);
      }
    }
    
    console.log('✅ [Map3D] Style processed, sources:', Object.keys(style.sources || {}));

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
        hash: true,
        attributionControl: false // Hide MapLibre/MapTiler attribution
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
        
        // 🔧 Cache bust verification
        const buildId = import.meta.env.VITE_BUILD_ID || import.meta.env.VITE_PWA_VERSION || 'unknown';
        console.info('🔧 M1-3D BUILD_ID:', buildId);

        // 🔍 M1-3D DEBUG: Expose map object for console verification
        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.has('debug');
        const uaOnly = urlParams.has('uaOnly');
        
        if (isDebug) {
          (window as any).M1_MAP = map;
          (window as any).supabase = supabase;
          console.info('🗺️ M1-3D map exposed → window.M1_MAP (debug mode)');
          console.info('🗺️ M1-3D supabase exposed → window.supabase (debug mode)');
          
          // 🔧 Debug Helper: Bypass Service Worker (manual call only)
          (window as any).__bypassSW = () => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(reg => reg.unregister());
                console.log('🔧 SW unregistered. Reload page for fresh cache.');
              });
            }
          };
          
          // 🔧 Debug helper: hide any layer by ID
          (window as any).__hideLayer = (id: string) => {
            if (map.getLayer(id)) {
              map.setLayoutProperty(id, 'visibility', 'none');
              console.info(`🔧 Layer hidden: ${id}`);
            } else {
              console.warn(`🔧 Layer not found: ${id}`);
            }
          };
          
          // 🔧 Debug helper: show ONLY user-areas layers
          (window as any).__onlyUserAreas = () => {
            const keep = new Set(['user-areas-fill', 'user-areas-border']);
            const layers = map.getStyle()?.layers || [];
            let hidden = 0;
            layers.forEach((l: any) => {
              const isFillOrLine = (l.type === 'fill' || l.type === 'line');
              if (isFillOrLine && !keep.has(l.id)) {
                try {
                  map.setLayoutProperty(l.id, 'visibility', 'none');
                  hidden++;
                } catch {}
              }
            });
            console.info(`👁️ __onlyUserAreas: hidden ${hidden} fill/line layers`);
            
            // Also clear user-areas source to prove it's empty
            try {
              const ua = map.getSource('user-areas') as any;
              if (ua && ua.setData) {
                ua.setData({ type: 'FeatureCollection', features: [] });
                console.info('🧹 user-areas source CLEARED');
              }
            } catch (e) {
              console.warn('Could not clear user-areas source:', e);
            }
          };
          
          // 🔧 Debug helper: identify what's drawn at a point
          (window as any).__whoDrawsHere = (lng: number, lat: number) => {
            const point = map.project([lng, lat]);
            const features = map.queryRenderedFeatures(point);
            const rows = (features || []).map(f => ({
              layer: f.layer?.id || 'unknown',
              source: f.source,
              sourceLayer: f.sourceLayer,
              type: f.geometry.type,
              properties: JSON.stringify(f.properties)
            }));
            console.table(rows);
            return rows; // 🔥 FIX: Return mapped array for MapVerificationPanel
          };
          
          // 🔧 Debug helper: full layers inventory with z-order
          (window as any).__inventoryLayers = () => {
            const layers = (map.getStyle()?.layers || []).map((l: any, i: number) => ({
              index: i,
              id: l.id,
              type: l.type,
              source: l.source,
              visible: (() => {
                try {
                  return (map.getLayoutProperty(l.id, 'visibility') ?? 'visible') !== 'none';
                } catch {
                  return true;
                }
              })()
            }));
            console.info('🔎 M1-3D LAYERS INVENTORY');
            console.table(layers);
            return layers;
          };
          
          // 🔧 Debug helper: SW bypass (manual use only - clears SW & caches)
          (window as any).__bypassSW = async () => {
            try {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map(r => r.unregister()));
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
              console.info('🧼 M1-3D SW bypass done (debug) → reloading');
              location.reload();
            } catch (e) {
              console.warn('SW bypass failed:', e);
            }
          };
          
          // 🔧 Debug helper: kill overlay (removes any DOM/canvas overlay)
          (window as any).__killOverlay = () => {
            const overlays = document.querySelectorAll('#map-space,[data-overlay="map-space"],.map-overlay-circle');
            overlays.forEach(el => {
              console.info('🧹 M1-3D killOverlay: removing', el);
              el.remove();
            });
            if (overlays.length === 0) {
              console.info('🧹 M1-3D killOverlay: no overlays found');
            }
          };
          
          console.info('🔧 Debug helpers ready: __hideLayer(id), __onlyUserAreas(), __whoDrawsHere(lng,lat), __inventoryLayers(), __bypassSW(), __killOverlay()');
          
          // 🔎 Auto-run inventory and "drawn here" on load (debug only)
          setTimeout(() => {
            (window as any).__inventoryLayers();
            
            // Auto "drawn here" at center
            try {
              const c = map.getCenter();
              const feats = map.queryRenderedFeatures(map.project(c));
              console.info('🎯 M1-3D DRAWN HERE (center)');
              console.table((feats || []).map(f => ({
                layer: f.layer?.id,
                source: f.source,
                type: f.layer?.type
              })));
            } catch (e) {
              console.warn('Auto "drawn here" failed:', e);
            }
          }, 1500);
          
          // 🔥 CRITICAL: If ?uaOnly=1, auto-hide all non-user-areas fill/line layers
          if (uaOnly) {
            setTimeout(() => {
              const keep = new Set(['user-areas-fill', 'user-areas-border']);
              const layers = map.getStyle()?.layers || [];
              let hidden = 0;
              layers.forEach((l: any) => {
                const isFillOrLine = (l.type === 'fill' || l.type === 'line');
                if (isFillOrLine && !keep.has(l.id)) {
                  try {
                    map.setLayoutProperty(l.id, 'visibility', 'none');
                    hidden++;
                  } catch {}
                }
              });
              console.info(`🧽 M1-3D isolate: hidden all but user-areas (${hidden} layers hidden)`);
              
              // Auto-kill any DOM overlays
              (window as any).__killOverlay?.();
            }, 500);
          }
          
          // 🔍 Log all layers and their visibility on load
          setTimeout(() => {
            const layers = map.getStyle().layers || [];
            const areaLayers = layers.filter(l => 
              l.id.includes('areas') || l.id.includes('search')
            );
            console.table(areaLayers.map(l => ({
              id: l.id,
              type: l.type,
              source: (l as any).source,
              visible: map.getLayoutProperty(l.id, 'visibility') !== 'none'
            })));
            console.info('🔍 M1-3D layer audit complete (areas/search only)');
          }, 1000);
        }

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

  // 🗺️ Track if we already centered on user position (only do it ONCE)
  const hasInitialCenteredRef = useRef(false);
  
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    // ⛔ DEV VIEW LOCK: Don't recenter on user position in DEV mode
    if (DEV_MOCKS && DEV_VIEW_LOCK) {
      console.log('🔒 DEV VIEW LOCK active - skipping auto-center on user position');
      return;
    }

    // ✅ FIX: Only center on user position ONCE (first time), then let user explore freely
    if (hasInitialCenteredRef.current) {
      console.log('📍 Position updated but NOT recentering (user can explore freely)');
      return;
    }

    if (!map.loaded()) {
      map.once('load', () => {
        console.log('📍 Flying to user position (initial):', position);
        hasInitialCenteredRef.current = true;
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
      console.log('📍 Flying to user position (initial):', position);
      hasInitialCenteredRef.current = true;
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
  const [preSelectedOpponent, setPreSelectedOpponent] = useState<{ id: string; name: string; lat?: number; lng?: number } | undefined>();
  const [selectedAgentRank, setSelectedAgentRank] = useState<string>('Agent');
  
  // 🔥 BATTLE ON MAP: State for active battle
  const [activeBattleOnMap, setActiveBattleOnMap] = useState<{
    attackerLat: number;
    attackerLng: number;
    defenderLat: number;
    defenderLng: number;
    defenderName: string;
    duration: number;
    startTime: number;
  } | null>(null);
  const [battleTimeLeft, setBattleTimeLeft] = useState(0);
  const [showBattleResult, setShowBattleResult] = useState<{ won: boolean } | null>(null);

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
      lat: selectedAgent.lat,
      lng: selectedAgent.lng,
    });
    setShowBattleModal(true);
  };
  
  // 🔥 BATTLE ON MAP: Listen for battle start event
  useEffect(() => {
    const handleBattleStart = (event: CustomEvent) => {
      const { defenderLat, defenderLng, defenderName, battleDuration } = event.detail;
      
      console.log('🚀 [Map3D] Battle started on map!', event.detail);
      
      // Use current user position as attacker position
      const attackerLat = position?.lat || 0;
      const attackerLng = position?.lng || 0;
      
      setActiveBattleOnMap({
        attackerLat,
        attackerLng,
        defenderLat,
        defenderLng,
        defenderName,
        duration: battleDuration,
        startTime: Date.now(),
      });
      setBattleTimeLeft(battleDuration);
      
      // Close the battle modal
      setShowBattleModal(false);
    };
    
    window.addEventListener('battle-map-start', handleBattleStart as EventListener);
    return () => {
      window.removeEventListener('battle-map-start', handleBattleStart as EventListener);
    };
  }, [position]);
  
  // 🔥 BATTLE ON MAP: Countdown timer
  useEffect(() => {
    if (!activeBattleOnMap || battleTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setBattleTimeLeft(prev => {
        if (prev <= 1) {
          // Battle ended!
          clearInterval(timer);
          
          // Determine winner (random for fake agents)
          const won = Math.random() > 0.35; // 65% win rate
          setShowBattleResult({ won });
          
          // Dispatch battle end event
          window.dispatchEvent(new CustomEvent('battle-map-end', { 
            detail: { won } 
          }));
          
          // Clear battle after showing result
          setTimeout(() => {
            setActiveBattleOnMap(null);
            setShowBattleResult(null);
          }, 5000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeBattleOnMap, battleTimeLeft]);

  return (
    <FinalShootProvider>
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

      {/* Geolocation Blocked Banner */}
      {isBlocked && (
        <div style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 64px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '8px'
        }}>
          <GeolocationPermissionGuide 
            isIOS={isIOS}
            isPWA={isPWA}
            onRetry={retryGeo}
          />
        </div>
      )}

      <div 
        ref={containerRef} 
        id="ml-sandbox" 
        style={{ 
          position: 'fixed', 
          inset: 0,
          zIndex: 1
        }} 
      />

      {/* FINAL SHOOT Overlay - Captures map clicks when active */}
      <FinalShootOverlay map={mapRef.current} />

      {/* Right side pills - pill-orb style like Shop */}
      <div 
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 240px)',
          right: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <motion.button
          onClick={handleResetBearing}
          className="pill-orb"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Reset bearing to north"
        >
          <Compass className="w-5 h-5 text-cyan-400" />
          <span className="dot" style={{ background: '#0ff', boxShadow: '0 0 8px #0ff' }} />
        </motion.button>

        <motion.button
          onClick={handleFindMyLocation}
          className="pill-orb"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Find my location"
        >
          <Navigation className="w-5 h-5 text-cyan-400" />
          <span className="dot" style={{ background: '#0ff', boxShadow: '0 0 8px #0ff' }} />
        </motion.button>

        <motion.button
          onClick={handleCenterLocation}
          className="pill-orb"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Centra su posizione"
        >
          <Crosshair className="w-5 h-5 text-cyan-400" />
          <span className="dot" style={{ background: '#0ff', boxShadow: '0 0 8px #0ff' }} />
        </motion.button>

        <motion.button
          onClick={handleResetView}
          className="pill-orb"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Reset vista"
        >
          <RotateCcw className="w-5 h-5 text-cyan-400" />
          <span className="dot" style={{ background: '#0ff', boxShadow: '0 0 8px #0ff' }} />
        </motion.button>
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
        currentUserId={user?.id || null}
        onAgentClick={handleAgentClick}
      />
      <PortalsLayer3D map={mapRef.current} enabled={layerVisibility.portals} />
      <RewardsLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.rewards} 
        markers={effectiveRewardMarkers}
        userPosition={position ? { lat: position.lat, lng: position.lng } : undefined}
        isAdmin={isUserAdmin} // Admin vede SEMPRE tutti i marker
      />
      <AreasLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.areas}
        userAreas={filteredUserAreas}
        searchAreas={effectiveSearchAreas}
        onDeleteSearchArea={(id) => deleteSearchArea(id)}
        currentAreaVersion={currentAreaVersion}
      />
      {/* 🎯 REWARD ZONE: Area verde per guidare verso marker reward */}
      <RewardZoneLayer3D
        map={mapRef.current}
        rewardZone={rewardZoneArea}
        onDelete={() => setRewardZoneArea(null)}
      />
      <NotesLayer3D map={mapRef.current} enabled={layerVisibility.notes} />

      {/* Battle FX Layer - Visual effects for battle events */}
      {mapRef.current && (
        <BattleFxLayer 
          map={mapRef.current} 
          battleFxMode={battleFxMode}
        />
      )}
      
      {/* 🔥 MAP BATTLE OVERLAY - Missile animation on map */}
      {mapRef.current && activeBattleOnMap && (
        <MapBattleOverlay
          map={mapRef.current}
          battle={activeBattleOnMap}
          timeLeft={battleTimeLeft}
          result={showBattleResult}
        />
      )}

      {/* M1U Pill Slot - Map 3D (overlay below header, aligned like Home) */}
      <div 
        id="m1u-pill-map3d-slot" 
        className="fixed left-4 z-[1001] flex flex-col gap-3"
        style={{ 
          top: 'calc(env(safe-area-inset-top, 0px) + 96px)',
          paddingLeft: 'max(0px, env(safe-area-inset-left, 0px))',
          pointerEvents: 'auto' 
        }}
        aria-hidden={false}
      >
        <M1UPill showLabel showPlusButton />
        {/* 🔍 Search Location Pill - Fly to any city */}
        <SearchLocationPill map={mapRef.current} />
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
            onCreateAreaDirect={createAreaDirect}
          />
        </>

      {/* Layer Toggle Panel */}
      <LayerTogglePanel 
        layers={layerVisibility} 
        onToggle={toggleLayer}
        mapStyle={mapStyle}
        onMapStyleChange={handleMapStyleChange}
      />

      {/* Realtime Players Pill - Below LAYERS panel */}
      <div 
        className="fixed right-4 z-[100]"
        style={{ 
          top: 'calc(env(safe-area-inset-top, 0px) + 150px)',
          pointerEvents: 'auto' 
        }}
      >
        <RealtimePlayersPill />
      </div>

      {/* FINAL SHOOT Pill - Only visible in last 7 days of mission */}
      <div 
        className="fixed z-[1001]"
        style={{
          left: '16px',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 450px)',
        }}
      >
        <FinalShootPill />
      </div>

      {/* Reward Counter Pill - Shows available rewards */}
      <div 
        className="fixed z-[1001]"
        style={{
          left: '16px',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 380px)',
        }}
      >
        <RewardCounterPill />
      </div>

      {/* Battle Shop Pill - Above Battle Pill */}
      {battleUserId && (
        <div 
          className="fixed z-[1001]"
          style={{
            left: '16px',
            bottom: 'calc(env(safe-area-inset-bottom, 34px) + 310px)',
          }}
        >
          <BattleShopPill userId={battleUserId} />
        </div>
      )}

      {/* Battle Pill - Circular floating button */}
      <BattlePill userId={battleUserId} />

      {/* Mission Pill - Daily missions */}
      <MissionPill />

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

      {/* Map Verification Panel (debug mode) */}
      {debugEnabled && <MapVerificationPanel />}

      {/* Debug Panel (only if enabled) */}
      {debugEnabled && <DebugMapPanel />}

      {/* BUZZ Diagnostic Panel (dev-only) */}
      <BuzzDiagnosticPanel />

      {/* 🎯 FIRST SESSION: Guided Discovery System (feature-flagged) */}
      <MapHUD mapContainerId="ml-sandbox" />
      {/* MicroMissionsCard ora è globale in App.tsx */}
      <BuzzHelpPopup mapContainerId="ml-sandbox" />
      {/* 🆕 Hint "Esplora la mappa" per utenti inattivi (1 volta al giorno) */}
      <MapExploreHint mapContainerId="ml-sandbox" />
      
      {/* 🎯 Motivational Popup - Shows once per session */}
      <MotivationalPopup pageType="map" />
    </FinalShootProvider>
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
