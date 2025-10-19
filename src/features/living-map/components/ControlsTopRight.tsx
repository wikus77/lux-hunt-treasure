import React, { useState, useCallback, useEffect } from 'react';
import OverlayButton from './OverlayButton';
import { toast } from 'sonner';

interface ControlsTopRightProps {
  mapContainerRef?: React.RefObject<HTMLDivElement>;
}

const ControlsTopRight: React.FC<ControlsTopRightProps> = ({ mapContainerRef }) => {
  const [is3DActive, setIs3DActive] = useState(() => {
    return sessionStorage.getItem('M1_3D_ON') === 'true';
  });
  const [terrainReady, setTerrainReady] = useState(false);

  // Detect map engine and initialize terrain
  useEffect(() => {
    const initTerrain = async () => {
      const mapContainer = mapContainerRef?.current;
      if (!mapContainer) return;

      // Try to get map instance
      const mapboxMap = (window as any).mapboxMap || (mapContainer as any)._map;
      const maplibreMap = (window as any).maplibreMap;
      const map = mapboxMap || maplibreMap;

      if (!map || typeof map.easeTo !== 'function') {
        console.log('3D: GL map engine not found');
        return;
      }

      // Wait for map to be loaded
      if (!map.loaded()) {
        map.on('load', () => initTerrain());
        return;
      }

      try {
        const demSource = import.meta.env.VITE_DEM_SOURCE || 'mapbox-dem';
        
        // Add DEM source if not exists
        if (!map.getSource(demSource)) {
          map.addSource(demSource, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
            maxzoom: 14
          });
        }

        // Set terrain
        map.setTerrain({ 
          source: demSource, 
          exaggeration: 1.4 
        });

        // Add sky layer
        if (!map.getLayer('sky')) {
          map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun-intensity': 10
            }
          });
        }

        // Add 3D buildings
        const layers = map.getStyle()?.layers || [];
        const labelLayerId = layers.find((l: any) => l.type === 'symbol' && l.layout?.['text-field'])?.id;
        
        if (!map.getLayer('3d-buildings')) {
          map.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#0E1726',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.85
            }
          }, labelLayerId);
        }

        setTerrainReady(true);
        console.log('3D terrain initialized successfully');
      } catch (error) {
        console.error('3D terrain initialization failed:', error);
        toast.error('3D terrain unavailable');
      }
    };

    initTerrain();
  }, [mapContainerRef]);

  const toggle3D = useCallback(() => {
    const mapContainer = mapContainerRef?.current;
    if (!mapContainer) return;

    const mapboxMap = (window as any).mapboxMap || (mapContainer as any)._map;
    const maplibreMap = (window as any).maplibreMap;
    const map = mapboxMap || maplibreMap;

    if (!map || typeof map.easeTo !== 'function') {
      toast.error('3D requires Mapbox/MapLibre GL');
      return;
    }

    if (!terrainReady) {
      toast.error('Terrain not ready');
      return;
    }

    const newState = !is3DActive;
    setIs3DActive(newState);
    sessionStorage.setItem('M1_3D_ON', String(newState));

    // Animate camera
    if (newState) {
      map.easeTo({
        pitch: 60,
        bearing: 25,
        duration: 700
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 700
      });
    }
  }, [is3DActive, terrainReady, mapContainerRef]);

  const TiltIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'rotate(-10deg)' }}
    >
      <path
        d="M3 3L21 3L18 21L6 21L3 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7L17 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="flex items-start gap-3">
      <OverlayButton
        label="3D"
        icon={<TiltIcon />}
        active={is3DActive}
        disabled={!terrainReady}
        onClick={toggle3D}
        variant="round"
      />
    </div>
  );
};

export default ControlsTopRight;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
