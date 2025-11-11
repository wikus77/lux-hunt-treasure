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

  // Update center when available
  useEffect(() => {
    if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
      setMapCenter([center.lat, center.lng]);
      
      if (map.current && mapReady) {
        map.current.setCenter([center.lng, center.lat]);
      }
    }
  }, [center, mapReady]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!center) return;

    console.log('[MapLibre] Initializing with MapTiler...');
    
    const styleUrl = mapTilerConfig.getStyleUrl();
    console.log('[MapLibre] Style URL:', styleUrl);

    const initialMap = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [center.lng, center.lat],
      zoom: 13,
      pitch: is3D ? 55 : 0,
      bearing: 0,
      fadeDuration: 0,
      attributionControl: {
        compact: true,
        customAttribution: '© MapTiler © OpenStreetMap'
      }
    });

    map.current = initialMap;

    // Handle style load
    initialMap.on('load', () => {
      console.log('[MapLibre] Map loaded successfully');
      setMapReady(true);

      // Add terrain if available
      const terrainSource = mapTilerConfig.getTerrainSource();
      if (terrainSource && !initialMap.getSource('terrain-rgb')) {
        initialMap.addSource('terrain-rgb', terrainSource as any);
        console.log('[MapLibre] Terrain source added');
        
        if (is3D) {
          initialMap.setTerrain({
            source: 'terrain-rgb',
            exaggeration: 1.2
          });
          console.log('[MapLibre] 3D terrain enabled');
        }
      }

      // Add 3D buildings if not in style
      if (!initialMap.getLayer('building-3d')) {
        // Check if we have a building source
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
            paint: {
              'fill-extrusion-color': '#0AEFFF',
              'fill-extrusion-opacity': 0.35,
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 18],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0]
            }
          });
          console.log('[MapLibre] 3D buildings layer added');
        }
      }

      // Add atmospheric background layer (MapLibre alternative to sky)
      if (!initialMap.getLayer('atmosphere-bg')) {
        initialMap.addLayer({
          id: 'atmosphere-bg',
          type: 'background',
          paint: {
            'background-color': '#050E16'
          }
        }, 'building-3d'); // Place below buildings
        console.log('[MapLibre] Atmosphere background added');
      }

      // Note: MapLibre doesn't support setFog() or sky layers natively
      // Tron aesthetic achieved through paint properties and background

      // Apply Tron theme overrides
      applyTronTheme(initialMap);
    });

    // Handle errors
    initialMap.on('error', (e) => {
      console.error('[MapLibre] Map error:', e);
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

  // Apply Tron theme paint properties
  const applyTronTheme = (mapInstance: maplibregl.Map) => {
    // Override key layers for Tron aesthetic
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
        
        // Water - dark blue
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

    console.log('[MapLibre] Tron theme applied');
  };

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
      console.log('[MapLibre] 3D mode enabled');
    } else {
      // Disable 3D
      map.current.setTerrain(null);
      map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
      console.log('[MapLibre] 2D mode enabled');
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
    console.log('[MapLibre] Focused on user location');
  }, [mapReady, center]);

  // Reset view handler
  const handleResetView = useCallback(() => {
    if (!map.current || !mapReady) return;
    
    map.current.easeTo({
      pitch: is3D ? 55 : 0,
      bearing: 0,
      duration: 1000
    });
    console.log('[MapLibre] View reset');
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
