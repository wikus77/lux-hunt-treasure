import React from 'react';

interface MapHUDHeaderProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapHUDHeader: React.FC<MapHUDHeaderProps> = ({ center, zoom }) => {
  return (
    <div
      className="living-hud-glass px-4 py-2"
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        maxWidth: 280
      }}
    >
      <div className="flex items-baseline gap-3">
        <h2
          className="text-lg font-bold tracking-wider"
          style={{
            color: 'var(--living-map-neon-primary)',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 12px rgba(0, 229, 255, 0.6)'
          }}
        >
          Living Map™
        </h2>
        
        {center && (
          <div
            className="text-xs"
            style={{
              color: 'var(--living-map-text-secondary)',
              fontFamily: 'monospace',
              opacity: 0.7
            }}
          >
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            {zoom && ` · Z${zoom}`}
          </div>
        )}
      </div>

      <div
        className="mt-1 text-xs"
        style={{
          color: 'var(--living-map-text-secondary)',
          fontSize: '10px',
          letterSpacing: '0.5px'
        }}
      >
        Real-time tactical overlay
      </div>
    </div>
  );
};

export default MapHUDHeader;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
