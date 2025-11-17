// Areas Layer for MapLibre 3D - User map areas and search areas as native GeoJSON layers
import React, { useEffect, useState, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { makeCircle, getCircleBounds } from '../geo/circleGeoJSON';

interface Area {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label?: string;
  color?: string;
}

interface AreasLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  userAreas?: Area[];
  searchAreas?: Area[];
  onDeleteSearchArea?: (id: string) => void;
}

const AreasLayer3D: React.FC<AreasLayer3DProps> = ({ 
  map, 
  enabled, 
  userAreas = [], 
  searchAreas = [],
  onDeleteSearchArea
}) => {
  const [tooltip, setTooltip] = useState<null | { id: string; type: 'user'|'search'; label?: string; radius: number; screenX: number; screenY: number; lat: number; lng: number }>(null);
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // Reset tooltip when userAreas changes or buzzAreaCreated event fires
  useEffect(() => {
    console.info('🗺️ M1-3D tooltip:reset (userAreas changed)');
    setTooltip(null);
  }, [userAreas]);

  useEffect(() => {
    const handleBuzzCreated = () => {
      console.info('🗺️ M1-3D tooltip:reset (buzzAreaCreated event)');
      setTooltip(null);
    };
    window.addEventListener('buzzAreaCreated', handleBuzzCreated);
    return () => window.removeEventListener('buzzAreaCreated', handleBuzzCreated);
  }, []);

  // Update tooltip position using map.project when tooltip is open (RAF throttling)
  useEffect(() => {
    if (!map || !tooltip) return;

    const updateTooltipPosition = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const point = map.project([tooltip.lng, tooltip.lat]);
        setTooltip(prev => prev ? { ...prev, screenX: point.x, screenY: point.y } : null);
      });
    };

    updateTooltipPosition();
    map.on('move', updateTooltipPosition);
    map.on('zoom', updateTooltipPosition);
    map.on('rotate', updateTooltipPosition);
    map.on('pitch', updateTooltipPosition);
    map.on('render', updateTooltipPosition);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off('move', updateTooltipPosition);
      map.off('zoom', updateTooltipPosition);
      map.off('rotate', updateTooltipPosition);
      map.off('pitch', updateTooltipPosition);
      map.off('render', updateTooltipPosition);
    };
  }, [map, tooltip?.lat, tooltip?.lng]);

  // Initialize GeoJSON sources and layers
  useEffect(() => {
    if (!map || !enabled || initializedRef.current) return;

    const initLayers = () => {
      // Add user areas source + layers
      if (!map.getSource('user-areas')) {
        map.addSource('user-areas', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        console.info('🗺️ M1-3D source:add (user-areas)');
      }

      if (!map.getLayer('user-areas-fill')) {
        map.addLayer({
          id: 'user-areas-fill',
          type: 'fill',
          source: 'user-areas',
          paint: {
            'fill-color': 'rgba(0,209,255,0.15)',
            'fill-opacity': 0.8
          }
        });
        console.info('🗺️ M1-3D layer:add (user-areas-fill)');
      }

      if (!map.getLayer('user-areas-border')) {
        map.addLayer({
          id: 'user-areas-border',
          type: 'line',
          source: 'user-areas',
          paint: {
            'line-color': '#00D1FF',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
        console.info('🗺️ M1-3D layer:add (user-areas-border)');
      }

      // Add search areas source + layers
      if (!map.getSource('search-areas')) {
        map.addSource('search-areas', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        console.info('🗺️ M1-3D source:add (search-areas)');
      }

      if (!map.getLayer('search-areas-fill')) {
        map.addLayer({
          id: 'search-areas-fill',
          type: 'fill',
          source: 'search-areas',
          paint: {
            'fill-color': 'rgba(255,0,255,0.1)',
            'fill-opacity': 0.6
          }
        });
        console.info('🗺️ M1-3D layer:add (search-areas-fill)');
      }

      if (!map.getLayer('search-areas-border')) {
        map.addLayer({
          id: 'search-areas-border',
          type: 'line',
          source: 'search-areas',
          paint: {
            'line-color': '#ff00ff',
            'line-width': 2,
            'line-opacity': 0.6
          }
        });
        console.info('🗺️ M1-3D layer:add (search-areas-border)');
      }

      // Click handlers
      const handleUserAreaClick = (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;
        const coords = feature.geometry.coordinates[0][0]; // First point of polygon
        const point = map.project(coords);
        
        setTooltip({
          id: props.id,
          type: 'user',
          label: props.label || 'Buzz Area',
          radius: props.radiusKm * 1000,
          screenX: point.x,
          screenY: point.y,
          lat: coords[1],
          lng: coords[0]
        });
      };

      const handleSearchAreaClick = (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;
        const coords = feature.geometry.coordinates[0][0];
        const point = map.project(coords);
        
        setTooltip({
          id: props.id,
          type: 'search',
          label: props.label || 'Search Area',
          radius: props.radiusKm * 1000,
          screenX: point.x,
          screenY: point.y,
          lat: coords[1],
          lng: coords[0]
        });
      };

      map.on('click', 'user-areas-fill', handleUserAreaClick);
      map.on('click', 'search-areas-fill', handleSearchAreaClick);

      // Cursor styling
      map.on('mouseenter', 'user-areas-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'user-areas-fill', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'search-areas-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'search-areas-fill', () => { map.getCanvas().style.cursor = ''; });

      initializedRef.current = true;
    };

    if (map.loaded()) {
      initLayers();
    } else {
      map.once('load', initLayers);
    }

    return () => {
      initializedRef.current = false;
    };
  }, [map, enabled]);

  // Update user areas GeoJSON data
  useEffect(() => {
    if (!map || !initializedRef.current) {
      console.info('🗺️ M1-3D source:update (user-areas) SKIPPED', { 
        mapReady: !!map, 
        initialized: initializedRef.current 
      });
      return;
    }

    const source = map.getSource('user-areas') as any;
    if (!source) {
      console.warn('🗺️ M1-3D source:update (user-areas) FAILED - source not found');
      return;
    }

    const features = userAreas.map(area => {
      const radiusKm = area.radius / 1000;
      console.info('🗺️ M1-3D source:update (user-areas) processing area', {
        id: area.id,
        radiusKm,
        radius_m: area.radius,
        center: [area.lat, area.lng]
      });
      const circle = makeCircle(area.lng, area.lat, radiusKm);
      return {
        ...circle,
        properties: {
          ...circle.properties,
          id: area.id,
          label: area.label || 'Buzz Area',
          radiusKm
        }
      };
    });

    console.info('🗺️ M1-3D setData called (user-areas)', { featureCount: features.length });
    source.setData({ type: 'FeatureCollection', features });
  }, [map, userAreas]);

  // Update search areas GeoJSON data
  useEffect(() => {
    if (!map || !initializedRef.current) return;

    const source = map.getSource('search-areas') as any;
    if (!source) return;

    const features = searchAreas.map(area => {
      const radiusKm = area.radius / 1000;
      const circle = makeCircle(area.lng, area.lat, radiusKm);
      return {
        ...circle,
        properties: {
          ...circle.properties,
          id: area.id,
          label: area.label || 'Search Area',
          radiusKm,
          color: area.color || '#ff00ff'
        }
      };
    });

    source.setData({ type: 'FeatureCollection', features });
    console.info('🗺️ M1-3D source:update (search-areas)', { count: features.length });
  }, [map, searchAreas]);

  if (!enabled) return null;

  return (
    <>
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.screenX,
            top: tooltip.screenY,
            transform: 'translate(-50%, -120%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.label}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>
            Radius: {Math.round(tooltip.radius / 1000)}km
          </div>
          {tooltip.type === 'search' && onDeleteSearchArea && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSearchArea(tooltip.id);
                setTooltip(null);
              }}
              style={{
                marginTop: '6px',
                padding: '4px 8px',
                background: 'rgba(255, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '10px',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default AreasLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
