
import React, { useState, useRef, lazy, Suspense, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// No default location fallback - GPS only
import MapController from './MapController';
import MapPopupManager from './MapPopupManager';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import MapEventHandler from './MapEventHandler';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
import LocationButton from './LocationButton';
import MapInstructionsOverlay from './MapInstructionsOverlay';
import SearchAreaButton from './SearchAreaButton';
import HelpDialog from '../HelpDialog';
import BuzzMapAreas from './BuzzMapAreas';
import MapInitializer from './MapInitializer';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useMapStore } from '@/stores/mapStore';
import { QRMapDisplay } from '@/components/map/QRMapDisplay';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { useIPGeolocation } from '@/hooks/useIPGeolocation';
import { TerrainLayer } from '@/lib/terrain/TerrainLayer';
import '@/styles/terrain.css';
import '@/styles/portals.css';
import '@/styles/map-layers.css';
import '@/styles/agents.css';
import { PortalLayer } from '@/lib/portals/PortalLayer';
import { EventsLayer } from '@/lib/layers/EventsLayer';
import { AgentsLayer } from '@/lib/layers/AgentsLayer';
import { ZonesLayer } from '@/lib/layers/ZonesLayer';
import { PORTALS_SEED } from '@/data/portals.seed';
import { MOCK_EVENTS, MOCK_ZONES } from '@/data/mockLayers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { 
  initAgentsPresence, 
  subscribeAgents, 
  teardownAgentsPresence,
  type AgentPresence 
} from '@/features/agents/agentsPresence';
import { supabase } from '@/integrations/supabase/client';

const LivingMap = lazy(() => import('@/features/living-map'));

import L from 'leaflet';
import { toast } from 'sonner';
import { GeoDebugOverlay } from '@/components/map/GeoDebugOverlay';
import { 
  handleMapMove, 
  handleMapReady, 
  handleAddNewPoint, 
  handleAreaGenerated 
} from '@/components/map/utils/mapContainerUtils';

interface MapContainerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  isAddingSearchArea?: boolean;
  handleMapClickArea?: (e: any) => void;
  searchAreas?: any[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
  setPendingRadius?: (value: number) => void;
  requestLocationPermission?: () => void;
  toggleAddingSearchArea?: () => void;
  showHelpDialog?: boolean;
  setShowHelpDialog?: (show: boolean) => void;
  onToggle3D?: (handler: (is3D: boolean) => void) => void;
  onFocusLocation?: (handler: () => void) => void;
  onResetView?: (handler: () => void) => void;
}

const MapContainerComponent: React.FC<MapContainerProps> = ({
  isAddingPoint,
  setIsAddingPoint,
  addNewPoint,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  handleBuzz,
  isAddingSearchArea = false,
  handleMapClickArea = () => {},
  searchAreas = [],
  setActiveSearchArea = () => {},
  deleteSearchArea = async () => false,
  setPendingRadius = () => {},
  requestLocationPermission = () => {},
  toggleAddingSearchArea = () => {},
  showHelpDialog = false,
  setShowHelpDialog = () => {},
  onToggle3D,
  onFocusLocation,
  onResetView
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.0, 8.0]); // European view
  const geo = useSimpleGeolocation();
  const ipGeo = useIPGeolocation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerDivRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<TerrainLayer | null>(null);
  const portalsLayerRef = useRef<PortalLayer | null>(null);
  const eventsLayerRef = useRef<EventsLayer | null>(null);
  const agentsLayerRef = useRef<AgentsLayer | null>(null);
  const zonesLayerRef = useRef<ZonesLayer | null>(null);
  const [layerCounts, setLayerCounts] = useState({ portals: 0, events: 0, agents: 0, zones: 0 });
  const [currentAgentCode, setCurrentAgentCode] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Geolocation for current user agent
  const { position: geoPosition, status: geoStatus } = useGeolocation();
  const [is3DActive, setIs3DActive] = useState(false);
  
  // CRITICAL: Use the hook to get BUZZ areas with real-time updates
  const { currentWeekAreas, loading: areasLoading, reloadAreas } = useBuzzMapLogic();
  
  // TRUE 3D: Check if DEM URL is configured
  const terrain3DAvailable = !!import.meta.env.VITE_TERRAIN_URL;
  
  // Use Zustand store for consistent state management
  const { isAddingMapPoint, mapStatus } = useMapStore();

  // Get user location for QR proximity
  // CRITICAL: Debug logging for BUZZ areas
  React.useEffect(() => {
    if (import.meta.env.DEV) console.debug("🗺️ MapContainer - BUZZ areas updated:", {
      areasCount: currentWeekAreas.length,
      loading: areasLoading,
      areas: currentWeekAreas.map(area => ({
        id: area.id,
        center: [area.lat, area.lng],
        radius: area.radius_km
      }))
    });
  }, [currentWeekAreas, areasLoading]);

  // Debug logging for point addition state
  React.useEffect(() => {
    if (import.meta.env.DEV) console.debug("🔄 MapContainer - State from Zustand:", { 
      isAddingPoint, 
      isAddingMapPoint, 
      mapStatus 
    });
  }, [isAddingPoint, isAddingMapPoint, mapStatus]);

  // AUTO-START IP GEOLOCATION immediatamente
  React.useEffect(() => {
    console.log('🌍 AUTO-START: Avviando geolocalizzazione IP automaticamente...');
    ipGeo.getLocationByIP();
  }, []);

  // ZOOM AUTOMATICO SULLA POSIZIONE (GPS o IP)
  React.useEffect(() => {
    const coords = geo.coords || ipGeo.coords;
    if (coords && mapRef.current) {
      console.log('🎯 AUTO-ZOOM: Centrando mappa su:', coords);
      
      mapRef.current.setView([coords.lat, coords.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [geo.coords, ipGeo.coords]);

  // Listen for BUZZ area creation events and auto-center map
  React.useEffect(() => {
    const handleBuzzAreaCreated = (event: CustomEvent) => {
      if (import.meta.env.DEV) console.debug('📍 MapContainer - Received BUZZ area creation event:', event.detail);
      if (event.detail && mapRef.current) {
        const { lat, lng, radius_km } = event.detail;
        handleAreaGeneratedCallback(lat, lng, radius_km);
      }
    };

    window.addEventListener('buzzAreaCreated', handleBuzzAreaCreated as EventListener);
    return () => {
      window.removeEventListener('buzzAreaCreated', handleBuzzAreaCreated as EventListener);
    };
  }, []);

  // Create utility functions using the extracted helpers
  const handleMapMoveCallback = handleMapMove(mapRef, setMapCenter);
  const handleMapReadyCallback = handleMapReady(mapRef, handleMapMoveCallback);
  const handleAddNewPointCallback = handleAddNewPoint(isAddingPoint, addNewPoint, setIsAddingPoint);
  
  // CRITICAL: Enhanced area generation callback with auto-zoom
  const handleAreaGeneratedCallback = (lat: number, lng: number, radiusKm: number) => {
    if (import.meta.env.DEV) console.debug('🎯 MapContainer - Area generated, auto-centering map:', { lat, lng, radiusKm });
    
    // FORCE reload areas first
    reloadAreas();
    
    // Auto-center and zoom map to show the new area after a short delay
    setTimeout(() => {
      if (import.meta.env.DEV) console.debug('📍 MapContainer - Auto-centering map on new area');
      const zoom = radiusKm <= 5 ? 12 : radiusKm <= 10 ? 11 : 10;
      
      // Set view to area center with appropriate zoom
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom);
        
        // Also create bounds to ensure the entire area is visible
        const radiusMeters = radiusKm * 1000;
        const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2);
        
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });
          }
        }, 200);
      }
    }, 1000);
  };

  // Living Map center/zoom - riusa variabili esistenti
  const lmCenter = useMemo(() => {
    if (!mapCenter) return { lat: 41.9028, lng: 12.4964 };
    return { lat: mapCenter[0], lng: mapCenter[1] };
  }, [mapCenter]);
  const lmZoom = mapRef?.current?.getZoom?.() ?? 12;

  // M1_FOCUS event listener for Living Map badge focus
  useEffect(() => {
    const handleFocus = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && mapRef.current) {
        mapRef.current.flyTo([detail.lat, detail.lng], detail.zoom || 15, { duration: 0.6 });
      }
    };
    window.addEventListener('M1_FOCUS', handleFocus);
    return () => window.removeEventListener('M1_FOCUS', handleFocus);
  }, []);

  // P0 FIX: 3D Terrain - enable/disable handlers
  const enable3D = () => {
    const demUrl = import.meta.env.VITE_TERRAIN_URL as string | undefined;
    const contoursUrl = import.meta.env.VITE_CONTOUR_URL as string | undefined;
    
    if (!demUrl || !mapRef.current || terrainRef.current) {
      if (import.meta.env.DEV && !demUrl) {
        console.warn('⚠️ VITE_TERRAIN_URL not configured - 3D terrain unavailable');
      }
      return;
    }
    
    if (import.meta.env.DEV) {
      console.log('🔧 Enabling 3D terrain with URL:', demUrl);
    }
    
    const layer = new TerrainLayer({ 
      demUrl, 
      contoursUrl, 
      exaggeration: 1.5, 
      hillshade: true 
    });
    layer.addTo(mapRef.current);
    terrainRef.current = layer;
    
    // CRITICAL: Make terrain visible by reducing Leaflet tile opacity
    const tilePane = mapRef.current.getPanes().tilePane;
    if (tilePane) {
      tilePane.style.opacity = '0.35';
    }
    
    // Apply subtle tilt effect to container
    if (mapContainerDivRef.current) {
      const mapPane = mapContainerDivRef.current.querySelector('.leaflet-container');
      if (mapPane) {
        (mapPane as HTMLElement).style.transform = 'perspective(1200px) rotateX(5deg)';
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('✅ 3D Terrain activated - hillshade should be visible');
      console.log('  - DEM URL:', demUrl);
      console.log('  - Tile opacity:', '0.35');
      console.log('  - Pitch:', '55°');
    }
  };

  const disable3D = () => {
    if (!terrainRef.current || !mapRef.current) return;
    
    mapRef.current.removeLayer(terrainRef.current);
    terrainRef.current = null;
    
    // CRITICAL: Restore full tile opacity
    const tilePane = mapRef.current.getPanes().tilePane;
    if (tilePane) {
      tilePane.style.opacity = '1';
    }
    
    // Remove tilt
    if (mapContainerDivRef.current) {
      const mapPane = mapContainerDivRef.current.querySelector('.leaflet-container');
      if (mapPane) {
        (mapPane as HTMLElement).style.transform = '';
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('✅ 3D Terrain deactivated - flat map restored');
    }
  };

  // P0 FIX: Handle 3D toggle from parent (via M1_TOGGLE_3D event)
  useEffect(() => {
    if (!mapRef.current || !onToggle3D) return;

    const handle3DToggle = (is3D: boolean) => {
      setIs3DActive(is3D);
      is3D ? enable3D() : disable3D();
    };

    // Pass the handler to parent
    onToggle3D(handle3DToggle as any);
  }, [onToggle3D]);

  // Handle focus location from dock
  const handleFocusLocation = () => {
    const coords = geo.coords || ipGeo.coords;
    if (coords && mapRef.current) {
      mapRef.current.flyTo([coords.lat, coords.lng], 15, { duration: 1 });
    } else {
      requestLocationPermission();
    }
  };

  // Handle reset view from dock - fitBounds to initial European view
  const handleResetView = () => {
    if (mapRef.current) {
      const europeBounds = L.latLngBounds(
        L.latLng(35.0, -10.0),  // SW corner
        L.latLng(71.0, 40.0)    // NE corner
      );
      mapRef.current.fitBounds(europeBounds, { padding: [50, 50], animate: true });
    }
  };

  // P0 FIX: Register handlers to parent (only once)
  useEffect(() => {
    if (onFocusLocation) {
      onFocusLocation(handleFocusLocation);
    }
    if (onResetView) {
      onResetView(handleResetView);
    }
  }, [onFocusLocation, onResetView]);

  // P1 FIX: Listen for M1_PORTAL_FILTER events (UI-only)
  useEffect(() => {
    const handlePortalFilter = (e: Event) => {
      const { type, enabled } = (e as CustomEvent).detail;
      const targets = document.querySelectorAll(`[data-portal-type="${type}"]`);
      console.log(`🎯 Portal filter: ${type} → ${enabled ? 'ON' : 'OFF'} (${targets.length} elementi)`);
      targets.forEach((el) => {
        el.classList.toggle('is-hidden', !enabled);
      });
    };
    window.addEventListener('M1_PORTAL_FILTER', handlePortalFilter);
    return () => window.removeEventListener('M1_PORTAL_FILTER', handlePortalFilter);
  }, []);

  // Initialize all Living Layers on map ready
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Helper to update layer counts
    const updateCounts = () => {
      setLayerCounts({
        portals: portalsLayerRef.current?.getCount() || 0,
        events: eventsLayerRef.current?.getCount() || 0,
        agents: agentsLayerRef.current?.getCount() || 0,
        zones: zonesLayerRef.current?.getCount() || 0,
      });
    };
    
    // Initialize Portals
    if (!portalsLayerRef.current) {
      console.log('🎯 Initializing Portals Layer');
      portalsLayerRef.current = new PortalLayer();
      portalsLayerRef.current.mount(mapRef.current);
      portalsLayerRef.current.setData(PORTALS_SEED);
    }
    
    // Initialize Events
    if (!eventsLayerRef.current) {
      console.log('📅 Initializing Events Layer');
      eventsLayerRef.current = new EventsLayer();
      eventsLayerRef.current.mount(mapRef.current);
      eventsLayerRef.current.setData(MOCK_EVENTS);
    }
    
    // Initialize Agents Layer (real-time presence)
    if (!agentsLayerRef.current) {
      console.log('👥 Initializing Agents Layer');
      agentsLayerRef.current = new AgentsLayer();
      agentsLayerRef.current.mount(mapRef.current);
      // Initially empty - will be populated by presence subscription
      agentsLayerRef.current.setData([], undefined);
    }
    
    // Initialize Zones
    if (!zonesLayerRef.current) {
      console.log('🗺️ Initializing Zones Layer');
      zonesLayerRef.current = new ZonesLayer();
      zonesLayerRef.current.mount(mapRef.current);
      zonesLayerRef.current.setData(MOCK_ZONES);
    }
    
    updateCounts();
    
    return () => {
      portalsLayerRef.current?.destroy();
      eventsLayerRef.current?.destroy();
      agentsLayerRef.current?.destroy();
      zonesLayerRef.current?.destroy();
    };
  }, [mapRef.current]);

  // Listen for M1_LAYER_TOGGLE events
  useEffect(() => {
    const handleLayerToggle = (e: Event) => {
      const { layer, enabled } = (e as CustomEvent).detail;
      console.log(`🎚️ Layer toggle: ${layer} → ${enabled ? 'ON' : 'OFF'}`);
      
      if (layer === 'portals' && portalsLayerRef.current) {
        enabled ? portalsLayerRef.current.show() : portalsLayerRef.current.hide();
      } else if (layer === 'events' && eventsLayerRef.current) {
        enabled ? eventsLayerRef.current.show() : eventsLayerRef.current.hide();
      } else if (layer === 'agents' && agentsLayerRef.current) {
        enabled ? agentsLayerRef.current.show() : agentsLayerRef.current.hide();
      } else if (layer === 'zones' && zonesLayerRef.current) {
        enabled ? zonesLayerRef.current.show() : zonesLayerRef.current.hide();
      }
    };
    window.addEventListener('M1_LAYER_TOGGLE', handleLayerToggle);
    return () => window.removeEventListener('M1_LAYER_TOGGLE', handleLayerToggle);
  }, []);

  // Fetch current user's agent code and initialize presence
  useEffect(() => {
    let mounted = true;

    const fetchAgentCode = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !mounted) return;

      const userId = session.user.id;
      setCurrentUserId(userId);

      // Fetch agent code
      const { data, error } = await supabase
        .rpc('get_my_agent_code')
        .single<{ agent_code?: string }>();

      if (error) {
        console.error('❌ Error fetching agent code:', error);
        return;
      }

      if (data?.agent_code && mounted) {
        setCurrentAgentCode(data.agent_code);
        console.log('✅ Agent code fetched:', data.agent_code);
      }
    };

    fetchAgentCode();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize agents presence and subscribe to updates
  useEffect(() => {
    if (!currentAgentCode || !agentsLayerRef.current) return;

    console.log('🟢 Initializing agents presence tracking...');

    // Initialize presence with agent code and coordinates getter
    initAgentsPresence(currentAgentCode, () => {
      if (geoPosition) {
        return { lat: geoPosition.lat, lng: geoPosition.lng };
      }
      return null;
    });

    // Subscribe to agents updates
    const unsubscribe = subscribeAgents((agents: AgentPresence[]) => {
      console.log('👥 Agents update:', agents.length, 'online');
      
      // Convert AgentPresence[] to Agent[] format for the layer
      const agentData = agents.map(a => ({
        id: a.id,
        agent_code: a.agent_code,
        lat: a.lat,
        lng: a.lng,
      }));

      // Update layer with current user ID for highlighting "You"
      if (agentsLayerRef.current) {
        agentsLayerRef.current.setData(agentData, currentUserId);
        
        // Update count
        setLayerCounts(prev => ({
          ...prev,
          agents: agentData.length,
        }));
      }
    });

    return () => {
      console.log('🔴 Cleaning up agents presence...');
      unsubscribe();
      teardownAgentsPresence();
    };
  }, [currentAgentCode, currentUserId, geoPosition]);

  // Listen for M1_PORTAL_CLICK events
  useEffect(() => {
    const handlePortalClick = (e: Event) => {
      const { id, name, lat, lng } = (e as CustomEvent).detail;
      console.log('🎯 Portal clicked:', name, id, `[${lat}, ${lng}]`);
      toast.success(`Portal — ${name}`, {
        description: 'Portal interaction — WIP',
        duration: 3000,
      });
    };
    window.addEventListener('M1_PORTAL_CLICK', handlePortalClick);
    return () => window.removeEventListener('M1_PORTAL_CLICK', handlePortalClick);
  }, []);

  // Listen for M1_PORTAL_FOCUS events (pan/zoom to portal)
  useEffect(() => {
    if (!mapRef.current) return;
    
    const handlePortalFocus = (e: Event) => {
      const { id, name, lat, lng } = (e as CustomEvent).detail;
      console.log('🔍 Portal focus:', name, id, `[${lat}, ${lng}]`);
      
      if (mapRef.current) {
        try {
          mapRef.current.flyTo([lat, lng], 14, {
            duration: 1.2,
            easeLinearity: 0.25
          });
        } catch (err) {
          console.error('[M1] Portal focus error:', err);
        }
      }
    };
    
    window.addEventListener('M1_PORTAL_FOCUS', handlePortalFocus);
    return () => window.removeEventListener('M1_PORTAL_FOCUS', handlePortalFocus);
  }, [mapRef.current]);

  return (
    <div 
      ref={mapContainerDivRef}
      className="rounded-[24px] overflow-hidden relative w-full" 
      style={{ 
        height: '70vh', 
        minHeight: '500px',
        width: '100%',
        display: 'block',
        position: 'relative'
      }}
    >
      <MapContainer 
        center={[54.5260, 15.2551]} 
        zoom={4}
        style={{ 
          height: '100%', 
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        className="z-10"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
      >
        <MapInitializer onMapReady={handleMapReadyCallback} />
        
        <MapController 
          isAddingPoint={isAddingPoint}
          setIsAddingPoint={setIsAddingPoint}
          addNewPoint={handleAddNewPointCallback}
        />
        
        {/* Balanced tone TileLayer - not too dark, not too light */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {/* Add labels layer separately for better visibility and control */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
        />
        
        {/* P1 FIX: PORTALS - Wrapped with data-layer */}
        <div data-layer="portals">
          {/* CRITICAL: Display BUZZ MAPPA areas with real-time updates */}
          <div data-portal-type="ALL">
            <BuzzMapAreas areas={currentWeekAreas} />
          </div>
          
          {/* QR Map Display - Show QR codes on map */}
          <div data-portal-type="ALL">
            <QRMapDisplay userLocation={geo.coords || ipGeo.coords} />
          </div>
        </div>
        
        {/* P1 FIX: ZONES - Wrapped with data-layer */}
        <div data-layer="zones">
          <SearchAreaMapLayer 
            searchAreas={searchAreas} 
            setActiveSearchArea={setActiveSearchArea}
            deleteSearchArea={deleteSearchArea}
          />
        </div>
        
        {/* Use the MapPopupManager component */}
        <MapPopupManager 
          mapPoints={mapPoints}
          activeMapPoint={activeMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          handleUpdatePoint={handleUpdatePoint}
          deleteMapPoint={deleteMapPoint}
          newPoint={newPoint}
          handleSaveNewPoint={handleSaveNewPoint}
          handleCancelNewPoint={handleCancelNewPoint}
        />
        
        {/* Use the MapEventHandler component with enhanced point click handling */}
        <MapEventHandler 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingPoint} 
          onMapPointClick={handleAddNewPointCallback}
        />
      </MapContainer>

      {/* DISABILITO GeoDebugOverlay per evitare conflitti */}
      {/* {import.meta.env.DEV && <GeoDebugOverlay />} */}


      {/* P2 FIX: Legacy controls wrapped for hiding when Dock active */}
      <div className="legacy-map-controls">
        <LocationButton requestLocationPermission={async () => {
          console.log('🎯 LOCATION BUTTON: Pressed!');
          
          // Attiva immediatamente IP geolocation
          const ipLocationPromise = ipGeo.getLocationByIP();
          
          // Prova GPS in parallelo con timeout molto breve
          const gpsPromise = new Promise((resolve) => {
            setTimeout(() => {
              console.log('🎯 GPS timeout reached, IP geolocation should be active');
              resolve(null);
            }, 1000); // 1 secondo timeout per GPS
            
            geo.requestLocation().then(resolve).catch(() => resolve(null));
          });
          
          // Usa la prima che risponde
          await Promise.race([ipLocationPromise, gpsPromise]);
        }} />

        <SearchAreaButton 
          toggleAddingSearchArea={toggleAddingSearchArea} 
          isAddingSearchArea={isAddingSearchArea} 
        />
      </div>

      {/* P0 FIX: Keep ONLY the central BUZZ button - removed duplicate from Dock */}
      <BuzzMapButtonSecure 
        onBuzzPress={handleBuzz} 
        mapCenter={mapCenter}
        onAreaGenerated={handleAreaGeneratedCallback}
      />

      {/* Use the MapInstructionsOverlay component */}
      <MapInstructionsOverlay 
        isAddingSearchArea={isAddingSearchArea} 
        isAddingMapPoint={isAddingPoint}
      />
      
      {/* Help Dialog */}
      {setShowHelpDialog && 
        <HelpDialog open={showHelpDialog || false} setOpen={setShowHelpDialog} />
      }

      {/* === Living Map™ Overlay (non-distruttivo) === */}
      {import.meta.env.VITE_ENABLE_LIVING_MAP === 'true' && (
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1001 }}
        >
          <Suspense fallback={null}>
            <LivingMap center={lmCenter} zoom={lmZoom} mapContainerRef={mapContainerDivRef} hidePortalBadges={true} />
          </Suspense>
        </div>
      )}
      {/* === /Living Map™ Overlay === */}
    </div>
  );
};

export default MapContainerComponent;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
