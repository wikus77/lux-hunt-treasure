import React from 'react';
import type { ZoneDTO } from '../adapters/readOnlyData';

interface ControlZonesLayerProps {
  zones: ZoneDTO[];
  showLabels?: boolean;
  labelOffsetPercent?: number; // push label down to stack under event chip
}

const ControlZonesLayer: React.FC<ControlZonesLayerProps> = ({ zones, showLabels = true, labelOffsetPercent = 1.4 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {zones.map((zone) => (
            <linearGradient key={`gradient-${zone.id}`} id={`zone-gradient-${zone.id}`}>
              <stop offset="0%" stopColor={zone.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={zone.color} stopOpacity="0.05" />
            </linearGradient>
          ))}
        </defs>

        {zones.map((zone) => {
          // Convert lat/lng to SVG coordinates (simplified)
          const points = zone.polygon
            .map(([lat, lng]) => {
              const x = ((lng % 360 + 360) % 360 / 360) * 100;
              const y = ((90 - lat) / 180) * 100;
              return `${x}%,${y}%`;
            })
            .join(' ');

          return (
            <g key={zone.id}>
              {/* Fill */}
              <polygon
                points={points}
                fill={`url(#zone-gradient-${zone.id})`}
              />

              {/* Animated border */}
              <polygon
                points={points}
                fill="none"
                stroke={zone.color}
                strokeWidth="2"
                className="living-zone-border"
                opacity="0.7"
              />

              {/* Label */}
              {showLabels && (
                <text
                  x={`${zone.polygon.reduce((sum, [, lng]) => sum + lng, 0) / zone.polygon.length}%`}
                  y={`${zone.polygon.reduce((sum, [lat]) => sum + (90 - lat) / 180 * 100, 0) / zone.polygon.length + labelOffsetPercent}%`}
                  fill="var(--living-map-text-primary)"
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                  className="pointer-events-auto cursor-pointer"
                  style={{ 
                    filter: `drop-shadow(0 0 4px ${zone.color})`,
                    letterSpacing: '0.5px'
                  }}
                >
                  {zone.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ControlZonesLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
