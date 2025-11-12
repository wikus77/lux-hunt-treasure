import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import neonStyleTemplate from '../map/styles/m1_neon_style_FULL_3D.json';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
import PortalContainer from '@/components/map/PortalContainer';
import MapLayerToggle from '@/components/map/MapLayerToggle';
import { toast } from 'sonner';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';
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
import NotesLayer3D from './map3d/layers/NotesLayer3D';
import LayerTogglePanel from './map3d/components/LayerTogglePanel';
import '@/styles/map-dock.css';
import '@/styles/portal-container.css';
import '@/styles/portals.css';
import '@/features/living-map/styles/livingMap.css';
import M1UPill from '@/features/m1u/M1UPill';

// 🔧 DEV-ONLY MOCKS (Page-local, governed by ENV)
const DEV_MOCKS = import.meta.env.VITE_MAP3D_DEV_MOCKS === 'true';

const MOCK_REWARD_MARKERS = DEV_MOCKS ? [
  { id: 'rw-1', lat: 43.8105, lng: 7.6805, type: 'M1U', title: 'Bonus +10 M1U' },
  { id: 'rw-2', lat: 45.4705, lng: 9.1905, type: 'PULSE', title: 'Pulse Energy +5' },
  { id: 'rw-3', lat: 41.9050, lng: 12.4970, type: 'M1U', title: 'Demo Reward' }
] : [];

const MOCK_USER_AREAS = DEV_MOCKS ? [
  { id: 'ua-1', lat: 43.8100, lng: 7.6800, radius: 500 },
  { id: 'ua-2', lat: 45.4700, lng: 9.1900, radius: 600 },
  { id: 'ua-3', lat: 41.9028, lng: 12.4964, radius: 400 }
] : [];

const MOCK_SEARCH_AREAS = DEV_MOCKS ? [
  { id: 'sa-1', lat: 43.8110, lng: 7.6810, radius: 300 },
  { id: 'sa-2', lat: 45.4710, lng: 9.1910, radius: 350 }
] : [];

// Seed localStorage for Notes if empty (dev only)
if (DEV_MOCKS) {
  const NOTES_KEY = 'map3d-notes';
  if (!localStorage.getItem(NOTES_KEY)) {
    localStorage.setItem(NOTES_KEY, JSON.stringify([
      { id: 'n-1', lat: 43.8101, lng: 7.6799, title: 'Checkpoint Alpha', note: 'Verifica POI iniziale' },
      { id: 'n-2', lat: 45.4701, lng: 9.1899, title: 'Target Beta', note: 'Area di interesse secondaria' }
    ]));
    console.debug('[Map3D] 📝 Seeded localStorage notes for dev');
  }
}

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
  const [diag, setDiag] = useState<DiagState>({ 
    keyMode: '?', 
    tiles: '?', 
    pbf: '?', 
    glyph: '?', 
    style: '-',
    error: null
  });
  
  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    agents: true,
    portals: true,
    rewards: true,
    areas: true,
    notes: true
  });
  
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  const { areas, currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  const { position, status: geoStatus, enable: enableGeo } = useGeolocation();
  const { portals, agents, events, zones, loading: liveLoading } = useLiveLayers(true);
  
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
  
  useEffect(() => {
    if (geoStatus === 'idle') {
      console.log('📍 Auto-enabling geolocation');
      enableGeo();
    }
  }, [geoStatus, enableGeo]);
  
  // Prepare effective data with dev fallbacks
  const effectiveRewardMarkers = MOCK_REWARD_MARKERS;
  const effectiveUserAreas = currentWeekAreas?.length 
    ? currentWeekAreas.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, radius: a.radius_km * 1000 }))
    : MOCK_USER_AREAS;
  const effectiveSearchAreas = searchAreas?.length
    ? searchAreas.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, radius: a.radius }))
    : MOCK_SEARCH_AREAS;

  useEffect(() => {
    console.debug('[Map3D] 📊 Live layers loaded:', {
      events: events.length,
      zones: zones.length,
      portals: portals.length,
      agents: agents.length,
      loading: liveLoading
    });
  }, [events.length, zones.length, portals.length, agents.length, liveLoading]);

  useEffect(() => {
    console.debug('[Map3D] 🎨 Layer data counts:', {
      rewards: effectiveRewardMarkers.length,
      userAreas: effectiveUserAreas.length,
      searchAreas: effectiveSearchAreas.length,
      devMocksEnabled: DEV_MOCKS
    });
  }, [effectiveRewardMarkers.length, effectiveUserAreas.length, effectiveSearchAreas.length]);
  
  const mapCenter: [number, number] | undefined = position 
    ? [position.lat, position.lng]
    : undefined;
  
  const handleBuzz = () => {
    console.log('🎯 BUZZ pressed in MapTiler3D - payment flow handled by BuzzMapButtonSecure');
  };
  
  const handleAreaGenerated = (lat: number, lng: number, radius: number) => {
    console.log('🎯 BUZZ MAP Area generated:', { lat, lng, radius });
    reloadAreas();
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

  const { profileImage } = useProfileImage();
  
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    closeNotificationsBanner
  } = useNotificationManager();

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
          className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
          title="Reset bearing to north"
        >
          <Compass className="h-4 w-4 text-cyan-400" />
        </Button>

        <Button
          onClick={handleFindMyLocation}
          size="sm"
          className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
          title="Find my location"
        >
          <Navigation className="h-4 w-4 text-cyan-400" />
        </Button>

        <Button
          onClick={handleCenterLocation}
          size="sm"
          className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
          title="Centra su posizione"
        >
          <Crosshair className="h-4 w-4 text-cyan-400" />
        </Button>

        <Button
          onClick={handleResetView}
          size="sm"
          className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
          title="Reset vista"
        >
          <RotateCcw className="h-4 w-4 text-cyan-400" />
        </Button>
      </div>
      
      <PortalContainer 
        portalCount={portals.length}
        onPortalAction={(type) => console.log('🎯 Portal filter:', type)}
      />
      
      {/* 3D Layers Overlay - All 5 features */}
      <AgentsLayer3D map={mapRef.current} enabled={layerVisibility.agents} />
      <PortalsLayer3D map={mapRef.current} enabled={layerVisibility.portals} />
      <RewardsLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.rewards} 
        markers={effectiveRewardMarkers} 
      />
      <AreasLayer3D 
        map={mapRef.current} 
        enabled={layerVisibility.areas}
        userAreas={effectiveUserAreas}
        searchAreas={effectiveSearchAreas}
      />
      <NotesLayer3D map={mapRef.current} enabled={layerVisibility.notes} />

      {/* M1U Pill Slot - Map 3D (overlay fixed top-right) */}
      <div 
        id="m1u-pill-map3d-slot" 
        className="fixed top-4 right-4 z-[1001] flex items-center gap-2"
        style={{ 
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          pointerEvents: 'auto' 
        }}
        aria-hidden={false}
      >
        <M1UPill showLabel showPlusButton />
      </div>

      {/* Layer Toggle Panel */}
      <LayerTogglePanel layers={layerVisibility} onToggle={toggleLayer} />
      
      <div
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 96px)',
          right: 0,
          zIndex: 20001
        }}
      >
        <MapLayerToggle 
          layerCounts={{
            portals: portals.length,
            events: events.length,
            agents: agents.length,
            zones: zones.length
          }}
        />
      </div>
      
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
