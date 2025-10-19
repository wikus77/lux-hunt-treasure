import React from 'react';
import { useRadarSweep } from '../hooks/useRadarSweep';

interface RadarOverlayProps {
  center: { lat: number; lng: number };
  mapBounds?: { width: number; height: number };
}

const RadarOverlay: React.FC<RadarOverlayProps> = ({ center, mapBounds }) => {
  const { angle, opacity, pulse } = useRadarSweep(true);

  return (
    <div className="living-radar-container">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: opacity * pulse }}
      >
        {/* Concentric circles */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={`circle-${i}`}
            cx="50%"
            cy="50%"
            r={`${scale * 40}%`}
            fill="none"
            stroke="url(#radarGradient)"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        {/* Central crosshair */}
        <line
          x1="50%"
          y1="calc(50% - 20px)"
          x2="50%"
          y2="calc(50% + 20px)"
          stroke="#00E5FF"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="calc(50% - 20px)"
          y1="50%"
          x2="calc(50% + 20px)"
          y2="50%"
          stroke="#00E5FF"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Rotating sweep */}
        <g
          className="living-radar-sweep"
          style={{
            transformOrigin: '50% 50%',
            transform: `rotate(${angle}deg)`
          }}
        >
          <path
            d="M 50% 50% L 50% 10% A 40% 40% 0 0 1 90% 50% Z"
            fill="url(#sweepGradient)"
            opacity="0.35"
          />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.6" />
          </linearGradient>
          
          <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#8A2BE2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default RadarOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
