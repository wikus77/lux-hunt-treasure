import React from 'react';
import { useLocation } from 'wouter';
import { Box } from 'lucide-react';
import '@/styles/map3d-nav-extension.css';

/**
 * Map 3D Navigation Extension
 * Non-intrusive floating button for accessing 3D Map Tiler
 * Positioned above bottom navigation bar with iOS safe area support
 */
export const Map3DNavExtension: React.FC = () => {
  const [location, navigate] = useLocation();
  const isActive = location === '/map-3d-tiler' || location === '/living-map-3d';

  const handleClick = () => {
    navigate('/map-3d-tiler');
  };

  return (
    <button
      onClick={handleClick}
      className={`map3d-nav-button ${isActive ? 'map3d-nav-button--active' : ''}`}
      aria-label="Open Map 3D"
      role="button"
      type="button"
    >
      <Box className="map3d-nav-icon" aria-hidden="true" />
    </button>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
