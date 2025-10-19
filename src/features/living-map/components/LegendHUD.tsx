import React from 'react';

interface LegendHUDProps {
  portalsCount: number;
  eventsCount: number;
  agentsCount: number;
  zonesCount: number;
}

const LegendHUD: React.FC<LegendHUDProps> = ({
  portalsCount,
  eventsCount,
  agentsCount,
  zonesCount
}) => {
  return (
    <div
      className="living-hud-glass p-3 space-y-2"
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        minWidth: 180,
        maxWidth: 220,
        zIndex: 1000
      }}
    >
      <div
        className="text-xs font-bold tracking-wide mb-3"
        style={{
          color: 'var(--living-map-text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        Living Layers
      </div>

      {/* Portals */}
      <div className="flex items-center justify-between">
        <div className="living-legend-chip" style={{ borderColor: '#00E5FF' }}>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }}
          />
          <span>Portals</span>
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--living-map-text-primary)' }}
        >
          {portalsCount}
        </span>
      </div>

      {/* Events */}
      <div className="flex items-center justify-between">
        <div className="living-legend-chip" style={{ borderColor: '#24E39E' }}>
          <div
            className="w-2 h-2 rounded-full living-event-pulse"
            style={{ background: '#24E39E' }}
          />
          <span>Events</span>
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--living-map-text-primary)' }}
        >
          {eventsCount}
        </span>
      </div>

      {/* Agents */}
      <div className="flex items-center justify-between">
        <div className="living-legend-chip" style={{ borderColor: '#8A2BE2' }}>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#8A2BE2', boxShadow: '0 0 6px #8A2BE2' }}
          />
          <span>Agents</span>
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--living-map-text-primary)' }}
        >
          {agentsCount}
        </span>
      </div>

      {/* Zones */}
      <div className="flex items-center justify-between">
        <div className="living-legend-chip" style={{ borderColor: '#FFB347' }}>
          <div
            className="w-2 h-2"
            style={{
              background: 'rgba(255, 179, 71, 0.3)',
              border: '1px solid #FFB347'
            }}
          />
          <span>Zones</span>
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--living-map-text-primary)' }}
        >
          {zonesCount}
        </span>
      </div>
    </div>
  );
};

export default LegendHUD;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
