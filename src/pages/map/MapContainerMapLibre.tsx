/**
 * MapLibre GL JS Container with MapTiler Cloud Integration
 * 3D Terrain + Buildings + Tron Theme + Full compatibility with existing features
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapTilerConfig } from '@/config/maptiler';
import { useMapState } from './MapStateProvider';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import MapControls from './components/MapControls';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
import HelpDialog from './components/HelpDialog';
import FinalShotButton from '@/components/map/FinalShotButton';
import neonStyle from './styles/m1_neon_style_FULL_3D.json';

// Default location (Rome)
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

interface MapContainerMapLibreProps {
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

const MapContainerMapLibre: React.FC<MapContainerMapLibreProps> = ({
  isAddingPoint,
  setIsAddingPoint,
  addNewPoint,
  handleBuzz,
  isAddingSearchArea = false,
  requestLocationPermission = () => {},
  toggleAddingSearchArea = () => {},
  showHelpDialog = false,
  setShowHelpDialog = () => {},
  onToggle3D,
  onFocusLocation,
  onResetView
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(() => {
    return localStorage.getItem('m1_map_3d') === 'true';
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  const { status, center } = useMapState();

  // Update center when available + fly-to with smooth animation
  useEffect(() => {
    if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
      setMapCenter([center.lat, center.lng]);
      
      if (map.current && mapReady) {
        // Use flyTo for smooth animated transition to user location
        map.current.flyTo({
          center: [center.lng, center.lat],
          zoom: Math.max(map.current.getZoom(), 15),
          pitch: 55,
          bearing: 0,
          duration: 1200,
          essential: true
        });
        console.log('[BUZZ MAP 3D] flyTo user location');
      }
    }
  }, [center, mapReady]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!center) return;

    console.log('[BUZZ MAP 3D] Initializing with Neon 3D style...');
    
    // Process the Neon 3D style to inject MapTiler API key
    const processedStyle = JSON.parse(JSON.stringify(neonStyle));
    const apiKey = mapTilerConfig.getKey();
    
    if (apiKey && processedStyle.sources) {
      Object.keys(processedStyle.sources).forEach((sourceKey) => {
        const source = processedStyle.sources[sourceKey];
        if (source.url && source.url.includes('{key}')) {
          source.url = source.url.replace('{key}', apiKey);
        }
        if (source.tiles) {
          source.tiles = source.tiles.map((tile: string) => 
            tile.replace('{key}', apiKey)
          );
        }
      });
      
      if (processedStyle.glyphs) {
        processedStyle.glyphs = processedStyle.glyphs.replace('{key}', apiKey);
      }
    }

    console.log('[BUZZ MAP 3D] style: m1_neon_style_FULL_3D.json (local)');

    const initialMap = new maplibregl.Map({
      container: mapContainer.current,
      style: processedStyle as any,
      center: [center.lng, center.lat],
      zoom: 13,
      pitch: is3D ? 55 : 0,
      bearing: 0,
      fadeDuration: 0,
      crossSourceCollisions: false,
      attributionControl: {
        compact: true,
        customAttribution: '© MapTiler © OpenStreetMap'
      }
    });

    map.current = initialMap;

    // Fail-safe: force UI ready after 5s regardless
    const failSafe = setTimeout(() => {
      if (!mapReady) {
        console.warn('[BUZZ MAP 3D] fail-safe unlock → setMapReady(true) after 5000ms');
        setMapReady(true);
      }
    }, 5000);

    // Handle style load
    initialMap.on('load', () => {
      clearTimeout(failSafe);
      console.log('[BUZZ MAP 3D] Map loaded successfully with native Neon 3D style');
      setMapReady(true);

      // Add terrain if available
      const terrainSource = mapTilerConfig.getTerrainSource();
      if (terrainSource && !initialMap.getSource('terrain-rgb')) {
        initialMap.addSource('terrain-rgb', terrainSource as any);
        console.log('[BUZZ MAP 3D] Terrain source added');
        
        if (is3D) {
          initialMap.setTerrain({
            source: 'terrain-rgb',
            exaggeration: 1.2
          });
          console.log('[BUZZ MAP 3D] 3D terrain enabled');
        }
      }

      // Native Neon 3D style already has building extrusions, no need for runtime additions
      console.log('[BUZZ MAP 3D] Native Neon 3D layers loaded (buildings, roads glow, water dark)');
    });

    // Log style data events
    initialMap.on('styledata', () => {
      console.info('[BUZZ MAP 3D] styledata received → ready');
    });

    // Handle errors - detect 403 from MapTiler
    initialMap.on('error', (e) => {
      console.error('[BUZZ MAP 3D] Map error:', e);
      
      // Check if error is related to tiles (403 forbidden)
      const errorStr = JSON.stringify(e);
      if (errorStr.includes('403') || errorStr.includes('maptiler')) {
        console.warn('[BUZZ MAP 3D] MapTiler 403 detected → consider using fallback demotiles in style');
        // Note: Fallback should be handled by pre-configuring demotiles style or using basic OSM
      }
    });

    // Handle click for adding points/areas
    initialMap.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      if (isAddingPoint) {
        addNewPoint(lat, lng);
      }
      // Add other interaction handlers here
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center]); // Only re-init if center changes initially

  // Refresh handler - reload Neon 3D style
  const handleRefresh = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    // Process the Neon 3D style to inject MapTiler API key
    const processedStyle = JSON.parse(JSON.stringify(neonStyle));
    const apiKey = mapTilerConfig.getKey();
    
    if (apiKey && processedStyle.sources) {
      Object.keys(processedStyle.sources).forEach((sourceKey) => {
        const source = processedStyle.sources[sourceKey];
        if (source.url && source.url.includes('{key}')) {
          source.url = source.url.replace('{key}', apiKey);
        }
        if (source.tiles) {
          source.tiles = source.tiles.map((tile: string) => 
            tile.replace('{key}', apiKey)
          );
        }
      });
      
      if (processedStyle.glyphs) {
        processedStyle.glyphs = processedStyle.glyphs.replace('{key}', apiKey);
      }
    }

    map.current.resize();
    map.current.triggerRepaint();
    map.current.setStyle(processedStyle as any, { diff: false });
    console.info('[BUZZ MAP 3D] refresh done');
  }, [mapReady]);

  // Toggle 3D handler
  const handleToggle3DMode = useCallback((enabled: boolean) => {
    if (!map.current || !mapReady) return;
    
    setIs3D(enabled);
    localStorage.setItem('m1_map_3d', enabled.toString());
    
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
      console.log('[BUZZ MAP 3D] 3D mode enabled');
    } else {
      // Disable 3D
      map.current.setTerrain(null);
      map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
      console.log('[BUZZ MAP 3D] 2D mode enabled');
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
    console.log('[BUZZ MAP 3D] Focused on user location');
  }, [mapReady, center]);

  // Reset view handler
  const handleResetView = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    map.current.easeTo({
      pitch: is3D ? 55 : 0,
      bearing: 0,
      duration: 1000
    });
    console.log('[BUZZ MAP 3D] View reset');
  }, [mapReady, is3D]);

  // Register handlers with parent
  useEffect(() => {
    if (!mapReady) return;
    
    if (onToggle3D) onToggle3D(handleToggle3DMode);
    if (onFocusLocation) onFocusLocation(handleFocusLocation);
    if (onResetView) onResetView(handleResetView);
  }, [mapReady, onToggle3D, onFocusLocation, onResetView, handleToggle3DMode, handleFocusLocation, handleResetView]);

  // Show loading state
  if (!center) {
    return (
      <div 
        className="map-container-wrapper flex items-center justify-center"
        style={{ height: '100%', width: '100%', position: 'relative', minHeight: '400px' }}
      >
        <div className="flex flex-col items-center justify-center gap-3 z-10">
          <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Mappa in caricamento…</p>
          {!mapTilerConfig.isAvailable() && (
            <p className="text-xs text-destructive">MapTiler key missing - using fallback</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="map-container-wrapper"
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        minHeight: '400px'
      }}
    >
      <div 
        ref={mapContainer} 
        className="map-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {/* Map Controls */}
      {mapReady && (
        <MapControls
          requestLocationPermission={requestLocationPermission}
          toggleAddingSearchArea={toggleAddingSearchArea}
          isAddingSearchArea={isAddingSearchArea}
          isAddingMapPoint={isAddingPoint}
          setShowHelpDialog={setShowHelpDialog}
          handleBuzz={handleBuzz}
          showHelpDialog={showHelpDialog}
          mapCenter={mapCenter}
          onRefresh={handleRefresh}
          onAreaGenerated={(lat, lng, radius) => {
            console.log('🎯 Area generated:', { lat, lng, radius });
            reloadAreas();
          }}
        />
      )}

      {/* BUZZ Button */}
      <BuzzMapButtonSecure 
        onBuzzPress={handleBuzz}
        mapCenter={mapCenter}
        onAreaGenerated={(lat, lng, radius) => {
          console.log('🎯 Area generated:', { lat, lng, radius });
          reloadAreas();
        }}
      />

      {/* Help Dialog */}
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />

      {/* Final Shot Button */}
      <FinalShotButton mapCenter={mapCenter} />
    </div>
  );
};

export default MapContainerMapLibre;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
