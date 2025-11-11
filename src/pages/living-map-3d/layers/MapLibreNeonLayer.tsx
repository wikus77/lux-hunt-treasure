/**
 * MapLibre GL Neon Layer - 3D Terrain + Buildings + Tron Theme
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'sonner';
import '@/styles/maplibre-tron.css';
import { mapTilerConfig } from '@/config/maptiler';
import { useMapState } from '../../map/MapStateProvider';
import { PORTALS_SEED } from '@/data/portals.seed';
import { MOCK_EVENTS, MOCK_AGENTS, MOCK_ZONES } from '@/data/mockLayers';
import neonStyle from '@/pages/map/styles/m1_neon_style_FULL_3D.json';

// Default location (Rome)
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

interface MapLibreNeonLayerProps {
  onRegisterToggle3D?: (handler: (enabled: boolean) => void) => void;
  onRegisterFocusLocation?: (handler: () => void) => void;
  onRegisterResetView?: (handler: () => void) => void;
  onRegisterResetBearing?: (handler: () => void) => void;
  onRegisterRefresh?: (handler: () => void) => void;
}

const MapLibreNeonLayer: React.FC<MapLibreNeonLayerProps> = ({
  onRegisterToggle3D,
  onRegisterFocusLocation,
  onRegisterResetView,
  onRegisterResetBearing,
  onRegisterRefresh
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(() => {
    return localStorage.getItem('m1_living_map_3d') === 'true';
  });
  const readyRef = useRef(false);

  // LIVING3D debug flag and logger
  const LIVING3D_DEBUG = (() => {
    try {
      const w = (window as any);
      if (typeof w.LIVING3D_DEBUG_LOGS === 'boolean') return w.LIVING3D_DEBUG_LOGS;
      const ls = localStorage.getItem('LIVING3D_DEBUG_LOGS');
      if (ls !== null) return ls === 'true';
    } catch {}
    return import.meta.env.DEV; // default on in dev, off in prod
  })();
  const L3D = (...args: any[]) => { if (LIVING3D_DEBUG) console.log('LIVING3D:', ...args); };

  const { center } = useMapState();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    L3D('mount');
    console.log('[Living Map 3D] Initializing MapLibre GL with Neon 3D style...');
    
    // Process neon style with MapTiler API key
    const processedStyle = JSON.parse(JSON.stringify(neonStyle));
    const apiKey = mapTilerConfig.getKey();
    
    if (apiKey && processedStyle.sources?.openmaptiles?.tiles) {
      processedStyle.sources.openmaptiles.tiles = processedStyle.sources.openmaptiles.tiles.map(
        (url: string) => url.replace('{key}', apiKey)
      );
    }
    
    if (apiKey && processedStyle.glyphs) {
      processedStyle.glyphs = processedStyle.glyphs.replace('{key}', apiKey);
    }
    
    console.log('[LIVING3D] style: m1_neon_style_FULL_3D.json (local)');
    L3D('style: m1_neon_style_FULL_3D.json');

    // Container size diagnostics
    const cw = mapContainer.current?.clientWidth || 0;
    const ch = mapContainer.current?.clientHeight || 0;
    L3D('container ready', { w: cw, h: ch });
    if (cw === 0 || ch === 0) {
      L3D('container zero size → scheduling resize');
      setTimeout(() => { if (map.current) map.current.resize(); }, 100);
    }
    
    // Always use default location initially, then flyTo when center arrives
    const initialCenter = [DEFAULT_LOCATION[1], DEFAULT_LOCATION[0]] as [number, number];

    const initialMap = new maplibregl.Map({
      container: mapContainer.current,
      style: processedStyle as any,
      center: initialCenter,
      zoom: 12,
      pitch: is3D ? 55 : 0,
      bearing: 0,
      maxPitch: 85,
      fadeDuration: 0,
      crossSourceCollisions: false,
      interactive: true,
      attributionControl: {
        compact: true,
        customAttribution: '© M1SSION™ © MapTiler © OpenStreetMap'
      }
    });

    map.current = initialMap;

    // Fail-safe: unlock UI after 5s regardless of style load status
    const failSafeTimer = window.setTimeout(() => {
      if (!readyRef.current) {
        console.warn('[LIVING3D] fail-safe unlock → setMapReady(true) after 5000ms');
        L3D('fail-safe unlock after 5s');
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (fail-safe)');
      }
    }, 5000);

    // Consider styledata as ready to avoid indefinite loaders when tiles 403
    initialMap.once('styledata', () => {
      if (!readyRef.current) {
        L3D('styledata received → map ready');
        console.info('[LIVING3D] styledata received → ready');
        console.log('[Living Map 3D] styledata received → marking ready');
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (styledata)');
        clearTimeout(failSafeTimer);
      }
    });

    // Handle style.load - CRITICAL: Add terrain/sky/buildings AFTER style is loaded
    initialMap.once('style.load', () => {
      console.log('[LIVING3D] style.load → applying terrain+sky+buildings');
      L3D('style.load → setup 3D');
      
      // Add terrain DEM source + sky ONLY after style load to avoid "Style is not done loading" error
      const terrainSource = mapTilerConfig.getTerrainSource();
      if (terrainSource && !initialMap.getSource('terrain-rgb')) {
        initialMap.addSource('terrain-rgb', terrainSource as any);
        console.log('[LIVING3D] Terrain source added');
        
        if (is3D) {
          initialMap.setTerrain({
            source: 'terrain-rgb',
            exaggeration: 1.3
          });
          console.log('[LIVING3D] 3D terrain enabled');
        }
      }

      // Add sky layer (cast to any for MapLibre GL sky support)
      if (!initialMap.getLayer('sky')) {
        initialMap.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun-intensity': 10
          }
        } as any);
        console.log('[LIVING3D] Sky layer added');
      }

      // Buildings are already in native style (buildings-extrusion layer)
      console.log('[LIVING3D] Native Neon 3D style with buildings-extrusion loaded');
      console.info('[Living3D] style.load → terrain+sky+buildings applied → UI ready');
      
      // Mark as ready after style setup
      if (!readyRef.current) {
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (style.load)');
        clearTimeout(failSafeTimer);
      }
    });

    // Handle full map load - add living layers
    initialMap.on('load', () => {
      console.log('[Living Map 3D] Map fully loaded');
      L3D('map load complete');

      // Add living layers (portals, events, agents, zones)
      addLivingLayers(initialMap);
      L3D('living layers added');
    });

    // Handle errors
    initialMap.on('error', (e) => {
      console.error('[Living Map 3D] Map error:', e);
      L3D('style error', e);
      // If style fails, switch to fallback after a short delay
      if (!readyRef.current && map.current) {
        console.warn('[Living Map 3D] Switching to fallback style due to error');
        L3D('fallback → demotiles (error)');
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (error fallback)');
        clearTimeout(failSafeTimer);
        toast.warning('Layer in ritardo – fallback stile base', { duration: 2500 });
        map.current.setStyle('https://demotiles.maplibre.org/style.json');
      }
    });

    // Style fallback: switch to OSM if map style not ready within 5s
    const styleFallbackTimer = window.setTimeout(() => {
      if (!readyRef.current && map.current) {
        console.warn('[Living Map 3D] Style load timeout (5s). Applying fallback style.');
        L3D('fallback → demotiles (timeout 5s)');
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (timeout fallback)');
        toast.warning('Layer in ritardo – caricamento base', { duration: 2500 });
        map.current.setStyle('https://demotiles.maplibre.org/style.json');
      }
    }, 5000);

    // Handle resize
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    const handleOrientation = () => {
      L3D('orientationchange → resize');
      setTimeout(handleResize, 150);
    };
    window.addEventListener('orientationchange', handleOrientation);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        L3D('visibilitychange visible → resize');
        setTimeout(handleResize, 150);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(failSafeTimer);
      clearTimeout(styleFallbackTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // FlyTo center when geolocation arrives
  useEffect(() => {
    if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng) && map.current && mapReady) {
      L3D('flyTo center', center);
      console.log('[LIVING3D] flyTo user location');
      console.log('[Living Map 3D] Flying to user location:', center);
      map.current.flyTo({
        center: [center.lng, center.lat],
        zoom: Math.max(map.current.getZoom(), 15),
        pitch: 55,
        bearing: 0,
        essential: true,
        duration: 1200
      });
    }
  }, [center, mapReady]);

  // Refresh map handler
  const handleRefresh = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    console.log('[LIVING3D] refresh started');
    map.current.resize();
    map.current.triggerRepaint();
    
    // Reload style with current neon style
    const processedStyle = JSON.parse(JSON.stringify(neonStyle));
    const apiKey = mapTilerConfig.getKey();
    
    if (apiKey && processedStyle.sources?.openmaptiles?.tiles) {
      processedStyle.sources.openmaptiles.tiles = processedStyle.sources.openmaptiles.tiles.map(
        (url: string) => url.replace('{key}', apiKey)
      );
    }
    
    if (apiKey && processedStyle.glyphs) {
      processedStyle.glyphs = processedStyle.glyphs.replace('{key}', apiKey);
    }
    
    map.current.setStyle(processedStyle as any, { diff: false });
    
    // Re-apply terrain/sky/buildings after style reload
    map.current.once('style.load', () => {
      console.log('[LIVING3D] refresh → style reloaded, re-applying 3D setup');
      
      // Add terrain DEM source + sky
      const terrainSource = mapTilerConfig.getTerrainSource();
      if (terrainSource && map.current && !map.current.getSource('terrain-rgb')) {
        map.current.addSource('terrain-rgb', terrainSource as any);
        
        if (is3D) {
          map.current.setTerrain({
            source: 'terrain-rgb',
            exaggeration: 1.3
          });
        }
      }

      // Add sky layer
      if (map.current && !map.current.getLayer('sky')) {
        map.current.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun-intensity': 10
          }
        } as any);
      }
      
      console.log('[LIVING3D] refresh done');
    });
    
    toast.success('Mappa aggiornata', { duration: 2000 });
  }, [mapReady, is3D]);

  // Add living layers (portals, events, agents, zones)
  const addLivingLayers = (mapInstance: maplibregl.Map) => {
    // Add portals as markers
    PORTALS_SEED.forEach((portal) => {
      const el = document.createElement('div');
      el.className = 'living-map-portal-marker';
      el.innerHTML = `
        <div class="portal-icon">🌐</div>
        <div class="portal-label">${portal.name}</div>
      `;

      new maplibregl.Marker({ element: el })
        .setLngLat([portal.lng, portal.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${portal.name}</strong>`))
        .addTo(mapInstance);
    });

    // Add events as markers
    MOCK_EVENTS.forEach((event) => {
      const el = document.createElement('div');
      el.className = 'living-map-event-marker';
      el.innerHTML = `
        <div class="event-icon">📍</div>
        <div class="event-label">${event.name}</div>
      `;

      new maplibregl.Marker({ element: el })
        .setLngLat([event.lng, event.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${event.name}</strong>`))
        .addTo(mapInstance);
    });

    // Add agents as markers
    MOCK_AGENTS.forEach((agent) => {
      const el = document.createElement('div');
      el.className = 'living-map-agent-marker';
      el.innerHTML = `
        <div class="agent-icon">👤</div>
        <div class="agent-label">${agent.name}</div>
      `;

      new maplibregl.Marker({ element: el })
        .setLngLat([agent.lng, agent.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${agent.name}</strong>`))
        .addTo(mapInstance);
    });

    console.log('[Living Map 3D] Living layers added');
  };

  // Toggle 3D handler
  const handleToggle3DMode = useCallback((enabled: boolean) => {
    if (!map.current || !mapReady) return;
    
    setIs3D(enabled);
    
    if (enabled) {
      // Enable 3D
      const terrainSource = mapTilerConfig.getTerrainSource();
      if (terrainSource) {
        // Ensure terrain source exists
        if (!map.current.getSource('terrain-rgb')) {
          map.current.addSource('terrain-rgb', terrainSource as any);
        }
        
        // Apply terrain
        map.current.setTerrain({
          source: 'terrain-rgb',
          exaggeration: 1.3
        });
      }
      map.current.easeTo({ pitch: 55, duration: 1000 });
      console.log('[Living Map 3D] 3D mode enabled');
    } else {
      // Disable 3D
      map.current.setTerrain(null);
      map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
      console.log('[Living Map 3D] 2D mode enabled');
    }
  }, [mapReady]);

  // Focus location handler (Go to Me)
  const handleFocusLocation = useCallback(() => {
    if (!map.current || !mapReady || !center) return;
    
    console.log('[LIVING3D] flyTo user location');
    map.current.flyTo({
      center: [center.lng, center.lat],
      zoom: Math.max(map.current.getZoom(), 15),
      pitch: 55,
      bearing: 0,
      essential: true,
      duration: 1200
    });
    console.log('[Living Map 3D] Focused on user location');
  }, [mapReady, center]);

  // Reset view handler
  const handleResetView = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    map.current.easeTo({
      pitch: is3D ? 55 : 0,
      bearing: 0,
      duration: 1000
    });
    console.log('[Living Map 3D] View reset');
  }, [mapReady, is3D]);

  // Reset bearing handler
  const handleResetBearing = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    map.current.easeTo({
      bearing: 0,
      duration: 800
    });
    console.log('[Living Map 3D] Bearing reset');
  }, [mapReady]);

  // Register handlers with parent
  useEffect(() => {
    if (!mapReady) return;
    
    if (onRegisterToggle3D) onRegisterToggle3D(handleToggle3DMode);
    if (onRegisterFocusLocation) onRegisterFocusLocation(handleFocusLocation);
    if (onRegisterResetView) onRegisterResetView(handleResetView);
    if (onRegisterResetBearing) onRegisterResetBearing(handleResetBearing);
    if (onRegisterRefresh) onRegisterRefresh(handleRefresh);
  }, [mapReady, onRegisterToggle3D, onRegisterFocusLocation, onRegisterResetView, onRegisterResetBearing, onRegisterRefresh, handleToggle3DMode, handleFocusLocation, handleResetView, handleResetBearing, handleRefresh]);

  return (
    <>
      {/* Loading overlay (only while map is initializing) */}
      {!mapReady && (
        <div className="living-map-loading">
          <div className="loading-spinner" />
          <p className="loading-text">Inizializzazione M1SSION™...</p>
          {!mapTilerConfig.isAvailable() && (
            <p className="loading-warning">⚠️ MapTiler key missing - using fallback style</p>
          )}
        </div>
      )}
      
      {/* Map container (always rendered) */}
      <div 
        ref={mapContainer} 
        className="living-map-container"
        style={{ opacity: mapReady ? 1 : 0, transition: 'opacity 0.5s ease' }}
      />
    </>
  );
};

export default MapLibreNeonLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
