// @ts-nocheck
// Rewards Layer for MapLibre 3D - Reward markers using NATIVE MapLibre markers
// 🔥 FIX: Converted from HTML overlay to native markers for perfect map sync (no floating!)
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';
import ClaimRewardModal from '@/components/marker-rewards/ClaimRewardModal';

interface RewardMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  claimed?: boolean; // Se true, marker diventa VIOLA
  min_zoom?: number; // Zoom minimo per vedere il marker (default 17)
}

interface RewardsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  markers?: RewardMarker[];
  userPosition?: { lat: number; lng: number };
  isAdmin?: boolean;
}

// 🎯 ZOOM DEFAULT per marker senza min_zoom configurato
const DEFAULT_MIN_ZOOM = 17;

const RewardsLayer3D: React.FC<RewardsLayer3DProps> = ({ map, enabled, markers = [], userPosition, isAdmin = false }) => {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(0);
  const { rewards } = useMarkerRewards(selectedMarker);
  
  // 🔥 Native MapLibre markers ref for cleanup
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  // 🔥 ZOOM CONTROL: Update zoom state for visibility logic
  useEffect(() => {
    if (!map) return;

    const updateZoom = () => {
      setCurrentZoom(map.getZoom());
    };

    // Initial check
    updateZoom();

    // Listen to zoom changes
    map.on('zoom', updateZoom);

    return () => {
      try {
        map.off('zoom', updateZoom);
      } catch (e) {
        // Map may be destroyed
      }
    };
  }, [map]);

  // 🔥 FIX: Use native MapLibre markers for perfect map sync (no floating!)
  useEffect(() => {
    if (!map || !enabled) return;

    const currentMarkerIds = new Set(markers.map(m => m.id));
    
    // Remove markers that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach(rewardMarker => {
      const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
      const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
      
      const existingMarker = markersRef.current.get(rewardMarker.id);
      
      // Colors: 🟢 GREEN = non claimed, 🟣 PURPLE = claimed
      const markerColor = rewardMarker.claimed ? '#8B5CF6' : '#10b981';
      const markerSize = rewardMarker.claimed ? 18 : 22;
      
      if (existingMarker) {
        // 🔧 FIX: Update visibility, position AND COLOR when marker state changes
        existingMarker.setLngLat([rewardMarker.lng, rewardMarker.lat]);
        
        // Get the inner marker element (inside the wrapper)
        const wrapper = existingMarker.getElement();
        const el = wrapper.querySelector('.maplibre-reward-marker') as HTMLElement;
        
        if (el) {
          // Update color and style based on claimed status
          el.style.width = `${markerSize}px`;
          el.style.height = `${markerSize}px`;
          el.style.background = markerColor;
          el.style.boxShadow = `0 0 12px 4px ${markerColor}ee, 0 0 24px 8px ${markerColor}88`;
          el.style.animation = rewardMarker.claimed ? 'none' : 'rewardPulse 1.5s ease-in-out infinite';
          el.title = rewardMarker.claimed ? `${rewardMarker.title || 'Reward'} (Riscattato)` : rewardMarker.title || 'Reward';
        }
        
        wrapper.style.display = isVisible ? 'flex' : 'none';
      } else {
        // Create new marker element
        const el = document.createElement('div');
        el.className = 'maplibre-reward-marker';
        el.style.cssText = `
          cursor: pointer;
          width: ${markerSize}px;
          height: ${markerSize}px;
          border-radius: 50%;
          background: ${markerColor};
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 12px 4px ${markerColor}ee, 0 0 24px 8px ${markerColor}88;
          display: ${isVisible ? 'block' : 'none'};
          ${!rewardMarker.claimed ? 'animation: rewardPulse 1.5s ease-in-out infinite;' : ''}
        `;
        el.title = rewardMarker.claimed ? `${rewardMarker.title || 'Reward'} (Riscattato)` : rewardMarker.title || 'Reward';
        
        // 🎯 Click handler - must be on touch-friendly wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
        `;
        wrapper.appendChild(el);
        
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedMarker(rewardMarker.id);
        });
        
        wrapper.addEventListener('touchend', (e) => {
          e.stopPropagation();
          setSelectedMarker(rewardMarker.id);
        });
        
        // Create native MapLibre marker
        const marker = new maplibregl.Marker({ 
          element: wrapper,
          anchor: 'center'
        })
          .setLngLat([rewardMarker.lng, rewardMarker.lat])
          .addTo(map);
        
        markersRef.current.set(rewardMarker.id, marker);
      }
    });

    // Update visibility on zoom change for existing markers
    markersRef.current.forEach((marker, id) => {
      const rewardMarker = markers.find(m => m.id === id);
      if (rewardMarker) {
        const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
        const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
        marker.getElement().style.display = isVisible ? 'block' : 'none';
      }
    });

  }, [map, markers, enabled, currentZoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            // Marker already removed
          }
        });
        markersRef.current.clear();
      } catch (e) {
        // Silent cleanup
      }
    };
  }, []);

  // 🎯 Non mostrare nulla se layer disabilitato
  if (!enabled) return null;

  return (
    <>
      {/* CSS Animation for pulsing effect */}
      <style>{`
        @keyframes rewardPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>

      {/* 🎯 Modal SEMPRE visibile quando marker selezionato */}
      {selectedMarker && (
        <ClaimRewardModal
          isOpen={true}
          onClose={() => setSelectedMarker(null)}
          markerId={selectedMarker}
          rewards={rewards || []}
        />
      )}
    </>
  );
};

export default RewardsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
