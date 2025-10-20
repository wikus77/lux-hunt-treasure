import React from 'react';
import OverlayButton from './OverlayButton';
import type { ZoneDTO } from '../adapters/readOnlyData';

interface SectorBadgesColumnProps {
  zones: ZoneDTO[];
  side?: 'left' | 'right';
}

const SectorBadgesColumn: React.FC<SectorBadgesColumnProps> = ({ zones, side = 'left' }) => {
  if (!zones?.length) return null;

  return (
    <div
      className="absolute"
      style={{
        top: 88,
        [side]: 12,
        zIndex: 1001,
        pointerEvents: 'none' as const
      }}
    >
      <div className="flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
        {zones.map((z) => (
          <div key={z.id} className="flex items-center gap-2">
            <OverlayButton
              label={z.label}
              className="px-3 py-1.5"
            />
            {/* Type chip */}
            <span
              className="living-hud-glass px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                borderColor: z.color,
                color: 'var(--living-map-text-primary)'
              }}
            >
              Alert Zone
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorBadgesColumn;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
