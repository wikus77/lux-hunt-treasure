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

// Default location (Rome)
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

interface MapLibreNeonLayerProps {
  onRegisterToggle3D?: (handler: (enabled: boolean) => void) => void;
  onRegisterFocusLocation?: (handler: () => void) => void;
  onRegisterResetView?: (handler: () => void) => void;
  onRegisterResetBearing?: (handler: () => void) => void;
}

const MapLibreNeonLayer: React.FC<MapLibreNeonLayerProps> = ({
  onRegisterToggle3D,
  onRegisterFocusLocation,
  onRegisterResetView,
  onRegisterResetBearing
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
    console.log('[Living Map 3D] Initializing MapLibre GL with MapTiler...');
    console.log('[Living Map 3D] MapTiler config:', {
      isDev: mapTilerConfig.isDev,
      isProd: mapTilerConfig.isProd,
      hasKey: mapTilerConfig.isAvailable(),
      styleId: mapTilerConfig.styleId
    });

    const hasDev = !!import.meta.env.VITE_MAPTILER_KEY_DEV;
    const hasProd = !!import.meta.env.VITE_MAPTILER_KEY_PROD;
    L3D('keys', { env: mapTilerConfig.isProd ? 'prod' : 'dev', hasDev, hasProd });
    
    const styleUrl = mapTilerConfig.getStyleUrl();
    console.log('[Living Map 3D] Style URL:', styleUrl);
    L3D('style loaded/url', styleUrl);

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
      style: styleUrl,
      center: initialCenter,
      zoom: 12,
      pitch: is3D ? 55 : 0,
      bearing: 0,
      fadeDuration: 0,
      crossSourceCollisions: false,
      interactive: true,
      attributionControl: {
        compact: true,
        customAttribution: '© MapTiler © OpenStreetMap'
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
        console.log('[Living Map 3D] styledata received → marking ready');
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (styledata)');
        clearTimeout(failSafeTimer);
      }
    });

    // Mark style load stages
    initialMap.on('style.load', () => {
      console.log('[Living Map 3D] style.load fired');
      L3D('style loaded');
    });

    // Handle style load
    initialMap.on('load', () => {
      console.log('[Living Map 3D] Map loaded successfully');
      if (!readyRef.current) {
        readyRef.current = true;
        setMapReady(true);
        L3D('UI unblocked (load)');
        clearTimeout(failSafeTimer);
      }
      L3D('map ready');

      // Add terrain if available
      const terrainSource = mapTilerConfig.getTerrainSource();
      if (terrainSource && !initialMap.getSource('terrain-rgb')) {
        initialMap.addSource('terrain-rgb', terrainSource as any);
        console.log('[Living Map 3D] Terrain source added');
        
        if (is3D) {
          initialMap.setTerrain({
            source: 'terrain-rgb',
            exaggeration: 1.2
          });
          console.log('[Living Map 3D] 3D terrain enabled');
        }
      }

      // Add 3D buildings if not in style
      if (!initialMap.getLayer('building-3d')) {
        const layers = initialMap.getStyle().layers || [];
        const buildingLayer = layers.find((l: any) => 
          l['source-layer'] === 'building' || l.id?.includes('building')
        );
        
        if (buildingLayer) {
          const sourceId = (buildingLayer as any).source;
          
          initialMap.addLayer({
            id: 'building-3d',
            type: 'fill-extrusion',
            source: sourceId,
            'source-layer': 'building',
            minzoom: 12,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#1E88E5',
                50, '#0AEFFF',
                100, '#00D1FF'
              ],
              'fill-extrusion-opacity': 0.85,
              'fill-extrusion-height': [
                '*',
                ['coalesce', ['get', 'height'], 15],
                1.2
              ],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0]
            }
          });
          console.log('[Living Map 3D] 3D buildings layer added');
        }
      }

      // Apply Tron theme overrides
      applyTronTheme(initialMap);

      // Add living layers (portals, events, agents, zones)
      addLivingLayers(initialMap);
      L3D('layers loaded');
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
      console.log('[Living Map 3D] Flying to user location:', center);
      map.current.flyTo({
        center: [center.lng, center.lat],
        zoom: 15,
        duration: 2000
      });
    }
  }, [center, mapReady]);

  // Apply Tron theme paint properties
  const applyTronTheme = (mapInstance: maplibregl.Map) => {
    const style = mapInstance.getStyle();
    if (!style || !style.layers) return;

    style.layers.forEach((layer: any) => {
      try {
        // Roads - cyan glow
        if (layer.id?.includes('road') || layer.id?.includes('highway')) {
          if (layer.type === 'line') {
            mapInstance.setPaintProperty(layer.id, 'line-color', '#0AEFFF');
            mapInstance.setPaintProperty(layer.id, 'line-opacity', 0.8);
          }
        }
        
        // Water - dark blue with glow
        if (layer.id?.includes('water')) {
          if (layer.type === 'fill') {
            mapInstance.setPaintProperty(layer.id, 'fill-color', '#0a0a18');
          }
          if (layer.type === 'line') {
            mapInstance.setPaintProperty(layer.id, 'line-color', '#00D1FF');
            mapInstance.setPaintProperty(layer.id, 'line-opacity', 0.4);
          }
        }

        // Landscape - dark background
        if (layer.id?.includes('background') || layer.id?.includes('land')) {
          if (layer.type === 'background' || layer.type === 'fill') {
            mapInstance.setPaintProperty(layer.id, layer.type === 'background' ? 'background-color' : 'fill-color', '#050E16');
          }
        }
      } catch (e) {
        // Layer might not support property
      }
    });

    console.log('[Living Map 3D] Tron theme applied');
  };

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
      if (terrainSource && map.current.getSource('terrain-rgb')) {
        map.current.setTerrain({
          source: 'terrain-rgb',
          exaggeration: 1.2
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

  // Focus location handler
  const handleFocusLocation = useCallback(() => {
    if (!map.current || !mapReady || !center) return;
    
    map.current.flyTo({
      center: [center.lng, center.lat],
      zoom: 15,
      duration: 1500
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
  }, [mapReady, onRegisterToggle3D, onRegisterFocusLocation, onRegisterResetView, onRegisterResetBearing, handleToggle3DMode, handleFocusLocation, handleResetView, handleResetBearing]);

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
