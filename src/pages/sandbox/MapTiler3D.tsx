import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import neonStyleTemplate from '../map/styles/m1_neon_style_FULL_3D.json';
import BuzzMapButtonSecure from '@/pages/map/components/BuzzButtonSecure';
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
import '@/styles/map-dock.css';
import '@/styles/portal-container.css';
import '@/styles/portals.css';

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
  
  useEffect(() => {
    console.log('[MapTiler3D] 📊 Live layers loaded:', {
      events: events.length,
      zones: zones.length,
      portals: portals.length,
      agents: agents.length,
      loading: liveLoading
    });
  }, [events.length, zones.length, portals.length, agents.length, liveLoading]);
  
  const mapCenter: [number, number] | undefined = position 
    ? [position.lat, position.lng]
    : undefined;
  
  const handleBuzz = () => {
    console.log('🎯 BUZZ pressed in MapTiler3D');
  };
  
  const handleAreaGenerated = (lat: number, lng: number, radius: number) => {
    console.log('🎯 Area generated:', { lat, lng, radius });
    reloadAreas();
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
          onBuzzPress={handleBuzzPress}
          canUseBuzz={true}
          currentCount={currentWeekAreas.length}
          maxCount={3}
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
