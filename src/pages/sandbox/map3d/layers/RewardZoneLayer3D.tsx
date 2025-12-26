// © 2025 M1SSION™ – Reward Zone Layer
// Mostra l'area di ricerca per un marker reward con possibilità di eliminazione

import React, { useEffect, useState, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';

interface RewardZoneLayer3DProps {
  map: MLMap | null;
  rewardZone: {
    lat: number;
    lng: number;
    radius: number; // meters
    markerId: string;
  } | null;
  onDelete: () => void;
}

const RewardZoneLayer3D: React.FC<RewardZoneLayer3DProps> = ({ map, rewardZone, onDelete }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const sourceAdded = useRef(false);

  useEffect(() => {
    if (!map || !rewardZone) {
      // Cleanup if zone removed
      if (map && sourceAdded.current) {
        try {
          if (map.getLayer('reward-zone-fill')) map.removeLayer('reward-zone-fill');
          if (map.getLayer('reward-zone-outline')) map.removeLayer('reward-zone-outline');
          if (map.getLayer('reward-zone-pulse')) map.removeLayer('reward-zone-pulse');
          if (map.getSource('reward-zone-source')) map.removeSource('reward-zone-source');
          sourceAdded.current = false;
        } catch (e) {
          console.debug('[RewardZoneLayer3D] Cleanup error:', e);
        }
      }
      return;
    }

    const { lat, lng, radius } = rewardZone;

    // Generate circle coordinates
    const generateCircle = (centerLng: number, centerLat: number, radiusMeters: number, points = 64) => {
      const coords: [number, number][] = [];
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const dx = radiusMeters * Math.cos(angle);
        const dy = radiusMeters * Math.sin(angle);
        const newLat = centerLat + (dy / 111320);
        const newLng = centerLng + (dx / (111320 * Math.cos(centerLat * Math.PI / 180)));
        coords.push([newLng, newLat]);
      }
      return coords;
    };

    const circleCoords = generateCircle(lng, lat, radius);

    const addLayers = () => {
      try {
        // Remove existing if any
        if (map.getLayer('reward-zone-fill')) map.removeLayer('reward-zone-fill');
        if (map.getLayer('reward-zone-outline')) map.removeLayer('reward-zone-outline');
        if (map.getLayer('reward-zone-pulse')) map.removeLayer('reward-zone-pulse');
        if (map.getSource('reward-zone-source')) map.removeSource('reward-zone-source');

        // Add source
        map.addSource('reward-zone-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [circleCoords]
            }
          }
        });

        // Fill layer - green transparent
        map.addLayer({
          id: 'reward-zone-fill',
          type: 'fill',
          source: 'reward-zone-source',
          paint: {
            'fill-color': '#10b981',
            'fill-opacity': 0.15
          }
        });

        // Outline layer - green dashed
        map.addLayer({
          id: 'reward-zone-outline',
          type: 'line',
          source: 'reward-zone-source',
          paint: {
            'line-color': '#10b981',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [3, 2]
          }
        });

        sourceAdded.current = true;
        console.log('🎯 [RewardZoneLayer3D] Zone added:', lat, lng, radius);
      } catch (e) {
        console.error('[RewardZoneLayer3D] Error adding layers:', e);
      }
    };

    // Wait for map style to load
    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.once('styledata', addLayers);
    }

    // Update position on map move
    const updatePosition = () => {
      const point = map.project([lng, lat]);
      setPosition({ x: point.x, y: point.y });
    };

    updatePosition();
    map.on('move', updatePosition);
    map.on('zoom', updatePosition);

    return () => {
      map.off('move', updatePosition);
      map.off('zoom', updatePosition);
    };
  }, [map, rewardZone]);

  if (!rewardZone || !position) return null;

  return (
    <AnimatePresence>
      {/* Delete button floating near the zone center */}
      <motion.div
        className="absolute z-[700] pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y - 60}px`,
          transform: 'translateX(-50%)'
        }}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{
            background: 'rgba(16, 185, 129, 0.9)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.5)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Target className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-bold">REWARD ZONE</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-1 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Rimuovi zona"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </motion.div>

      {/* Info badge at bottom */}
      <motion.div
        className="fixed bottom-32 left-4 right-4 z-[700] pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 1 }}
      >
        <div 
          className="max-w-sm mx-auto p-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
          >
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">
              Il marker si trova in questa zona!
            </p>
            <p className="text-white/60 text-xs">
              Zoom a 17+ per vederlo • Area {rewardZone.radius * 2}m
            </p>
          </div>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardZoneLayer3D;


