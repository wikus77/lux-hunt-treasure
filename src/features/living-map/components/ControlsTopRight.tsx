import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const maplibreMapRef = useRef<any>(null);

  // Listen for MapLibre ready event
  useEffect(() => {
    const handleMapLibreReady = (event: CustomEvent) => {
      console.log('✅ ControlsTopRight - MapLibre ready, map instance:', event.detail);
      maplibreMapRef.current = event.detail;
      setTerrainReady(true);

      // Apply initial 3D state if active
      if (is3DActive && maplibreMapRef.current) {
        try {
          maplibreMapRef.current.easeTo({ pitch: 60, bearing: 25, duration: 0 });
          console.log('✅ ControlsTopRight - Applied initial 3D state (pitch: 60, bearing: 25)');
        } catch (e) {
          console.warn('⚠️ Initial 3D state failed:', e);
        }
      }
    };

    // Timeout fallback if MAPLIBRE_READY doesn't arrive
    const timeout = setTimeout(() => {
      if (!terrainReady) {
        console.warn('⚠️ MAPLIBRE_READY timeout - 3D controls will be disabled');
        toast.error('3D non disponibile (MapLibre non pronto)', { duration: 2000 });
      }
    }, 5000);

    window.addEventListener('MAPLIBRE_READY', handleMapLibreReady as EventListener);
    return () => {
      window.removeEventListener('MAPLIBRE_READY', handleMapLibreReady as EventListener);
      clearTimeout(timeout);
    };
  }, [is3DActive, terrainReady]);

  // Toggle 3D with pitch/bearing changes using MapLibre
  const toggle3D = useCallback(() => {
    if (!maplibreMapRef.current) {
      console.warn('⚠️ 3D toggle attempted but MapLibre not ready');
      toast.error('3D non disponibile (MapLibre non pronto)', { duration: 2000 });
      return;
    }

    try {
      const newState = !is3DActive;

      if (newState) {
        // Activate 3D view with tilt and rotation
        maplibreMapRef.current.easeTo({ 
          pitch: 60, 
          bearing: 25, 
          duration: 800 
        });
        console.log('✅ 3D view activated - pitch: 60, bearing: 25');
      } else {
        // Deactivate 3D view - return to flat
        maplibreMapRef.current.easeTo({ 
          pitch: 0, 
          bearing: 0, 
          duration: 800 
        });
        console.log('✅ 3D view deactivated - pitch: 0, bearing: 0');
      }

      setIs3DActive(newState);
      sessionStorage.setItem('M1_3D_ON', String(newState));
      
      toast.success(newState ? 'Vista 3D attivata' : 'Vista 2D attivata', { duration: 1500 });
    } catch (error) {
      console.error('❌ 3D toggle failed:', error);
      toast.error('Errore toggle 3D');
    }
  }, [is3DActive]);

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
