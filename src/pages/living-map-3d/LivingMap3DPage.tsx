/**
 * Living Map 3D - MapLibre GL + MapTiler Cloud Integration
 * Full 3D Terrain + Buildings + Neon Tron Theme
 */
import React, { useState, useCallback } from 'react';
import { MapStateProvider } from '../map/MapStateProvider';
import MapLibreNeonLayer from './layers/MapLibreNeonLayer';
import Map3DControls from './components/Map3DControls';
import BuzzMapButtonDock from './components/BuzzMapButtonDock';
import './styles/living-map-3d.css';

const LivingMap3DPage: React.FC = () => {
  const [is3D, setIs3D] = useState(() => {
    return localStorage.getItem('m1_living_map_3d') === 'true';
  });

  // Control handlers (passed to children)
  const [toggle3DHandler, setToggle3DHandler] = useState<((enabled: boolean) => void) | null>(null);
  const [focusLocationHandler, setFocusLocationHandler] = useState<(() => void) | null>(null);
  const [resetViewHandler, setResetViewHandler] = useState<(() => void) | null>(null);
  const [resetBearingHandler, setResetBearingHandler] = useState<(() => void) | null>(null);

  const handleToggle3D = useCallback(() => {
    const newValue = !is3D;
    setIs3D(newValue);
    localStorage.setItem('m1_living_map_3d', newValue.toString());
    toggle3DHandler?.(newValue);
  }, [is3D, toggle3DHandler]);

  const handleFocusLocation = useCallback(() => {
    focusLocationHandler?.();
  }, [focusLocationHandler]);

  const handleResetView = useCallback(() => {
    resetViewHandler?.();
  }, [resetViewHandler]);

  const handleResetBearing = useCallback(() => {
    resetBearingHandler?.();
  }, [resetBearingHandler]);

  return (
    <MapStateProvider>
      <div className="living-map-3d-container">
        {/* Map Layer */}
        <MapLibreNeonLayer
          onRegisterToggle3D={setToggle3DHandler}
          onRegisterFocusLocation={setFocusLocationHandler}
          onRegisterResetView={setResetViewHandler}
          onRegisterResetBearing={setResetBearingHandler}
        />

        {/* 3D Controls */}
        <Map3DControls
          is3D={is3D}
          onToggle3D={handleToggle3D}
          onFocusLocation={handleFocusLocation}
          onResetView={handleResetView}
          onResetBearing={handleResetBearing}
        />

        {/* Buzz Map Button */}
        <BuzzMapButtonDock />
      </div>
    </MapStateProvider>
  );
};

export default LivingMap3DPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
