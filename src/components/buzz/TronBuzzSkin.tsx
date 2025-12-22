// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// TRON BUZZ Disc Skin Component - Dark metallic disc with cyan LED ring

import React from 'react';
import '@/styles/buzz/BuzzTronDisc.css';

interface TronBuzzSkinProps {
  priceDisplay: string;
  isLoading?: boolean;
  isBlocked?: boolean;
}

export const TronBuzzSkin: React.FC<TronBuzzSkinProps> = ({
  priceDisplay,
  isLoading = false,
  isBlocked = false
}) => {
  return (
    <div className="tron-disc">
      {/* Rotating elements wrapper - spins continuously */}
      <div className="tron-disc-rotating">
        {/* Internal LED Ring - shows loading animation when active */}
        <div className={`tron-led-ring ${isLoading ? 'loading' : ''}`} />
        
        {/* Decorative dots at cardinal points */}
        <div className="tron-disc-dots" />
        <div className="tron-disc-dots-sides" />
      </div>
      
      {/* Central content - STABLE, does not rotate */}
      <div className="tron-disc-content">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="tron-loading-spinner" />
            <span className="text-sm font-semibold text-white/80" style={{ 
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.1em'
            }}>
              PROCESSING
            </span>
          </div>
        ) : isBlocked ? (
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-12 h-12 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-6a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            <span className="text-sm font-semibold text-white/60" style={{ 
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.1em'
            }}>
              BLOCKED
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-semibold text-white/60" style={{ 
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.1em'
            }}>
              {priceDisplay}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
