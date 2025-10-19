import React, { useState, useEffect, useCallback } from 'react';
import OverlayButton from './OverlayButton';

interface Toggle3DProps {
  mapContainerRef?: React.RefObject<HTMLDivElement>;
}

const Toggle3D: React.FC<Toggle3DProps> = ({ mapContainerRef }) => {
  const [is3DActive, setIs3DActive] = useState(() => {
    return sessionStorage.getItem('M1_3D_ON') === 'true';
  });

  const toggle3D = useCallback(() => {
    const newState = !is3DActive;
    setIs3DActive(newState);
    sessionStorage.setItem('M1_3D_ON', String(newState));

    // Try to detect map library and apply tilt
    const mapContainer = mapContainerRef?.current;
    if (!mapContainer) return;

    // Check for Mapbox GL
    const mapboxMap = (window as any).mapboxMap || (mapContainer as any)._map;
    if (mapboxMap && typeof mapboxMap.easeTo === 'function') {
      // Mapbox GL JS
      if (newState) {
        mapboxMap.easeTo({
          pitch: 55,
          bearing: 25,
          duration: 600
        });
      } else {
        mapboxMap.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 600
        });
      }
      return;
    }

    // Fallback: CSS tilt on Leaflet or other
    const leafletContainer = mapContainer.querySelector('.leaflet-container') as HTMLElement;
    const targetEl = leafletContainer || mapContainer;

    if (newState) {
      targetEl.style.transform = 'perspective(1200px) rotateX(55deg) rotateZ(0deg)';
      targetEl.style.transformOrigin = '50% 70%';
      targetEl.style.transition = 'transform 0.6s ease';
    } else {
      targetEl.style.transform = '';
      targetEl.style.transformOrigin = '';
      targetEl.style.transition = 'transform 0.6s ease';
    }
  }, [is3DActive, mapContainerRef]);

  // Apply initial state on mount
  useEffect(() => {
    if (is3DActive) {
      // Delay to ensure map is loaded
      const timer = setTimeout(() => toggle3D(), 100);
      return () => clearTimeout(timer);
    }
  }, []);

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
    <OverlayButton
      label="3D"
      icon={<TiltIcon />}
      active={is3DActive}
      onClick={toggle3D}
      variant="round"
    />
  );
};

export default Toggle3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
