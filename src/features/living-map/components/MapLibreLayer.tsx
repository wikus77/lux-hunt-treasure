import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore - maplibre-gl-leaflet may not have types
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreLayerProps {
  onMapLibreReady?: (map: any) => void;
}

const MapLibreLayer: React.FC<MapLibreLayerProps> = ({ onMapLibreReady }) => {
  const leafletMap = useMap();
  const glLayerRef = useRef<any>(null);
  const maplibreMapRef = useRef<any>(null);

  useEffect(() => {
    if (!leafletMap || glLayerRef.current) return;

    try {
      console.log('🗺️ MapLibre Layer - Initializing...');

      const styleUrl = import.meta.env.VITE_MAPLIBRE_STYLE || 'https://demotiles.maplibre.org/style.json';
      
      // @ts-ignore - L.maplibreGL from plugin
      const glLayer = L.maplibreGL({
        style: styleUrl
      });

      glLayerRef.current = glLayer;
      
      // Add layer below markers (low pane index)
      glLayer.addTo(leafletMap);
      
      // Get the MapLibre map instance once loaded
      // @ts-ignore - getMaplibreMap from plugin
      const maplibreMap = glLayer.getMaplibreMap();
      
      maplibreMap.once('load', () => {
        maplibreMapRef.current = maplibreMap;
        console.log('✅ MapLibre Layer - Loaded successfully');

        // Add terrain and 3D features
        try {
          const terrainSource = import.meta.env.VITE_TERRAIN_SOURCE || 'terrain';
          const terrainUrl = import.meta.env.VITE_TERRAIN_URL || 'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png';

          // Add DEM source
          if (!maplibreMap.getSource(terrainSource)) {
            maplibreMap.addSource(terrainSource, {
              type: 'raster-dem',
              tiles: [terrainUrl],
              tileSize: 512,
              maxzoom: 14
            });
            console.log('✅ MapLibre - DEM source added');
          }

          // Set terrain
          maplibreMap.setTerrain({ 
            source: terrainSource, 
            exaggeration: 1.4 
          });
          console.log('✅ MapLibre - Terrain enabled');

          // Add sky layer (with type workaround for TypeScript)
          if (!maplibreMap.getLayer('sky')) {
            maplibreMap.addLayer({
              id: 'sky',
              type: 'sky' as any,
              paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun-intensity': 10
              } as any
            });
            console.log('✅ MapLibre - Sky layer added');
          }

          // Try to add 3D buildings if the style supports it
          const layers = maplibreMap.getStyle()?.layers || [];
          const labelLayerId = layers.find((l: any) => 
            l.type === 'symbol' && l.layout && l.layout['text-field']
          )?.id;

          if (maplibreMap.getSource('openmaptiles') && !maplibreMap.getLayer('3d-buildings')) {
            maplibreMap.addLayer({
              id: '3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#0E1726',
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-base': ['get', 'render_min_height'],
                'fill-extrusion-opacity': 0.85
              }
            }, labelLayerId);
            console.log('✅ MapLibre - 3D buildings added');
          }
        } catch (terrainError) {
          console.warn('⚠️ MapLibre - Terrain setup failed (non-critical):', terrainError);
        }

        // Notify parent
        onMapLibreReady?.(maplibreMap);

        // Dispatch global event
        window.dispatchEvent(new CustomEvent('MAPLIBRE_READY', { detail: maplibreMap }));
      });

      maplibreMap.on('error', (e: any) => {
        console.warn('⚠️ MapLibre error (non-critical):', e);
      });

    } catch (error) {
      console.error('❌ MapLibre Layer - Initialization failed:', error);
    }

    return () => {
      if (glLayerRef.current && leafletMap) {
        try {
          leafletMap.removeLayer(glLayerRef.current);
          glLayerRef.current = null;
          maplibreMapRef.current = null;
          console.log('🗑️ MapLibre Layer - Cleaned up');
        } catch (e) {
          console.warn('⚠️ MapLibre cleanup warning:', e);
        }
      }
    };
  }, [leafletMap, onMapLibreReady]);

  return null;
};

export default MapLibreLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
