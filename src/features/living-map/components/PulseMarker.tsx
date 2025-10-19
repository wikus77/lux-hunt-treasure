import React from 'react';

interface PulseMarkerProps {
  color: string;
  size?: number;
  duration?: number;
  className?: string;
}

const PulseMarker: React.FC<PulseMarkerProps> = ({
  color,
  size = 24,
  duration = 2,
  className = ''
}) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Core dot */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 12px ${color}`
        }}
      />
      
      {/* Pulse wave */}
      <div
        className="absolute inset-0 rounded-full living-event-pulse"
        style={{
          border: `2px solid ${color}`,
          animation: `pulseWave ${duration}s ease-out infinite`
        }}
      />
    </div>
  );
};

export default PulseMarker;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
