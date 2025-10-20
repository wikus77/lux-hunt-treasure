import React from 'react';
import type { PortalDTO } from '../adapters/readOnlyData';

interface PortalsLayerProps {
  portals: PortalDTO[];
  mapRef?: any;
  showLabels?: boolean;
  onPortalClick?: (portal: PortalDTO) => void;
}

const PortalsLayer: React.FC<PortalsLayerProps> = ({ portals, showLabels = true, onPortalClick }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {portals.map((portal) => (
        <div
          key={portal.id}
          className="absolute"
          style={{
            left: `${(portal.lng % 360 + 360) % 360}%`, // Simplified positioning for demo
            top: `${(90 - portal.lat) / 180 * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Portal marker */}
          <div
            className={`living-portal-marker ${portal.status === 'active' ? 'active' : ''} cursor-pointer hover:scale-110 transition-transform`}
            style={{
              width: 32,
              height: 32,
              position: 'relative',
              pointerEvents: 'auto'
            }}
            onClick={() => onPortalClick?.(portal)}
            title={`${portal.name} - Click per dettagli`}
          >
            {/* Inner ring */}
            <div
              className="absolute inset-1 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${portal.status === 'active' ? '#00E5FF' : '#8A2BE2'}40, transparent)`,
                border: `2px solid ${portal.status === 'active' ? '#00E5FF' : '#8A2BE2'}`,
                boxShadow: `0 0 20px ${portal.status === 'active' ? '#00E5FF' : '#8A2BE2'}80`
              }}
            />
          </div>

          {showLabels && (
            /* Label pill */
            <div
              className="living-hud-glass mt-2 px-2 py-1 text-xs whitespace-nowrap pointer-events-auto cursor-pointer"
              style={{
                color: 'var(--living-map-text-primary)',
                fontSize: '10px',
                fontWeight: 600
              }}
              title={`${portal.name} - ${portal.intensity}% intensity`}
            >
              {portal.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PortalsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
