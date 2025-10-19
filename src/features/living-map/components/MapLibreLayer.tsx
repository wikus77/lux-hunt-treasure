import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// FIX: Ensure maplibregl is globally available BEFORE loading the plugin
if (!(window as any).maplibregl) {
  (window as any).maplibregl = maplibregl;
  console.log('✅ maplibregl assigned to window');
}

// Dynamic import of the Leaflet plugin to ensure proper initialization
let pluginLoaded = false;
const loadMapLibrePlugin = async () => {
  if (pluginLoaded) return;
  try {
    await import('@maplibre/maplibre-gl-leaflet');
    pluginLoaded = true;
    console.log('✅ MapLibreLeaflet plugin loaded');
  } catch (e) {
    console.error('❌ Failed to load MapLibreLeaflet plugin:', e);
  }
};

interface MapLibreLayerProps {
  onMapLibreReady?: (map: any) => void;
}

const MapLibreLayer: React.FC<MapLibreLayerProps> = ({ onMapLibreReady }) => {
  const leafletMap = useMap();

  useEffect(() => {
    if (!leafletMap) return;

    console.log('🌍 MapLibreLayer boot...');
    
    let glLayer: any = null;
    let cancelled = false;

    const initMapLibre = async () => {
      try {
        console.log('🌍 MapLibre - Initializing 3D layer...');
        
        // Load the plugin dynamically
        await loadMapLibrePlugin();

        if (cancelled) return;

        // Check if plugin is available
        if (typeof (L as any).maplibreGL !== 'function') {
          console.error('❌ L.maplibreGL not available - plugin not loaded');
          return;
        }
        console.log('✅ L.maplibreGL plugin available');

      // Create dedicated pane for MapLibre layer (above tiles, below markers)
      const glPane = leafletMap.createPane('glPane');
      if (glPane) {
        glPane.style.zIndex = '350';
        console.log('✅ MapLibre - Created glPane with zIndex 350');
      }

      // Create MapLibre GL layer
      glLayer = (L as any).maplibreGL({
        style: import.meta.env.VITE_MAPLIBRE_STYLE || 'https://demotiles.maplibre.org/style.json',
        interactive: false,
        pane: 'glPane'
      }).addTo(leafletMap);

      // Get MapLibre map instance
      const ml = glLayer.getMaplibreMap();

      ml.on('load', () => {
        console.log('✅ MapLibre - Style loaded');

        try {
          // Add DEM source
          const terrainSource = import.meta.env.VITE_TERRAIN_SOURCE || 'terrain';
          const terrainUrl = import.meta.env.VITE_TERRAIN_URL || 'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png';

          ml.addSource(terrainSource, {
            type: 'raster-dem',
            tiles: [terrainUrl],
            tileSize: 512,
            maxzoom: 14,
          });

          ml.setTerrain({ source: terrainSource, exaggeration: 1.4 });
          console.log('✅ MapLibre - Terrain enabled');

          // Add sky
          ml.addLayer({
            id: 'sky',
            type: 'sky' as any,
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun-intensity': 10,
            },
          });
          console.log('✅ MapLibre - Sky added');

          // Try 3D buildings
          try {
            const style = ml.getStyle();
            const sources = style?.sources || {};
            const buildingSrc = sources['openmaptiles'] || sources['openstreetmap'];

            if (buildingSrc) {
              ml.addLayer({
                id: '3d-buildings',
                source: Object.keys(sources).find(k => k.includes('maptiles') || k.includes('openstreet')) || 'openmaptiles',
                'source-layer': 'building',
                type: 'fill-extrusion',
                minzoom: 14,
                paint: {
                  'fill-extrusion-color': '#0E1726',
                  'fill-extrusion-height': ['get', 'height'],
                  'fill-extrusion-base': ['get', 'min_height'],
                  'fill-extrusion-opacity': 0.85,
                },
              });
              console.log('✅ MapLibre - 3D buildings added');
            }
          } catch (e) {
            console.warn('⚠️ MapLibre - No buildings layer:', e);
          }

          // Force canvas z-index above base tiles, below markers
          setTimeout(() => {
            const canvas = document.querySelector('.maplibregl-canvas')?.parentElement as HTMLElement;
            if (canvas) {
              canvas.style.zIndex = '350';
              console.log('✅ MapLibre - Canvas z-index = 350');
            }

            // Dispatch ready event
            console.log('✅ MAPLIBRE_READY dispatch');
            window.dispatchEvent(new CustomEvent('MAPLIBRE_READY', { detail: ml }));
            onMapLibreReady?.(ml);
            console.log('✅ MapLibre - MAPLIBRE_READY event dispatched');
          }, 0);

        } catch (err) {
          console.error('❌ MapLibre - Terrain setup error:', err);
        }
      });

      ml.on('error', (e: any) => console.error('❌ MapLibre error:', e));

      } catch (err) {
        console.error('❌ MapLibre - Init error:', err);
      }
    };

    initMapLibre();

    // Cleanup
    return () => {
      cancelled = true;
      if (glLayer && leafletMap) {
        try {
          leafletMap.removeLayer(glLayer);
          console.log('🧹 MapLibre - Cleaned up');
        } catch (e) {
          console.warn('⚠️ MapLibre - Cleanup warning:', e);
        }
      }
    };
  }, [leafletMap, onMapLibreReady]);

  return null;
};

export default MapLibreLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
