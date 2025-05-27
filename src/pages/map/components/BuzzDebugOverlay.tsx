
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';

interface BuzzDebugOverlayProps {
  areas: BuzzMapArea[];
  buzzCounter: number;
  currentColor: string;
  currentColorName: string;
}

const BuzzDebugOverlay: React.FC<BuzzDebugOverlayProps> = ({
  areas,
  buzzCounter,
  currentColor,
  currentColorName
}) => {
  if (areas.length === 0) {
    return null;
  }

  const area = areas[0];

  return (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        border: `2px solid ${currentColor}`,
        boxShadow: `0 0 10px ${currentColor}50`
      }}
    >
      <div>🎯 BUZZ AREA DEBUG</div>
      <div>AREA: {area.radius_km.toFixed(1)} km</div>
      <div>COLORE: {currentColorName}</div>
      <div>GENERAZIONE: {buzzCounter + 1}</div>
      <div>COORDINATE: {area.lat.toFixed(4)}, {area.lng.toFixed(4)}</div>
      <div style={{ color: currentColor }}>████ {currentColor}</div>
    </div>
  );
};

export default BuzzDebugOverlay;
