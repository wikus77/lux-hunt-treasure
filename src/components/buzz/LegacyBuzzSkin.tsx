// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// BUZZ Legacy 3D Disc Skin Component

import React from 'react';
import '@/styles/buzz/BuzzLegacyStyles.css';
import '@/styles/buzz/BuzzRing3D.css';

interface LegacyBuzzSkinProps {
  priceDisplay: string;
  peProgress?: number;
  isLoading?: boolean;
  isBlocked?: boolean;
  children?: React.ReactNode;
}

export const LegacyBuzzSkin: React.FC<LegacyBuzzSkinProps> = ({
  priceDisplay,
  peProgress,
  isLoading = false,
  isBlocked = false,
  children
}) => {
  return (
    <div className="buzz-sphere-pro buzz-3d">
      {/* Rim esterno e pannellature */}
      <div className="buzz-outer-rim" />
      <div className="buzz-panel-lines" />

      {/* Doppio arco interno cyan */}
      <div className="buzz-arc arc-a" />
      <div className="buzz-arc arc-b" />

      {/* Boli decorativi ai 4 punti cardinali */}
      <div className="buzz-bolts">
        <span className="bolt bolt-1" />
        <span className="bolt bolt-2" />
        <span className="bolt bolt-3" />
        <span className="bolt bolt-4" />
      </div>

      {/* Glow esterno sincronizzato */}
      <div className="buzz-glow" />

      {/* Scie ambientali */}
      <div className="buzz-trails" />

      {/* Contenuto centrale */}
      {children ? (
        <div className="buzz-text-container">
          {children}
        </div>
      ) : (
        <div className="buzz-text-container">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-3">
              <div 
                className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--buzz-cyan)', borderTopColor: 'transparent' }}
              />
              <span className="text-lg font-semibold text-white">BUZZING...</span>
            </div>
          ) : isBlocked ? (
            <div className="flex flex-col items-center space-y-3">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-lg font-semibold text-white">BLOCCATO</span>
            </div>
          ) : (
            <>
              <h1 className="buzz-title">
                <span className="buzz-text-bu">BU</span>
                <span className="buzz-text-zz">ZZ</span>
              </h1>
              
              {peProgress !== undefined && (
                <div className="buzz-pe-badge">
                  PE: {peProgress}/100
                </div>
              )}
              
              <div className="buzz-price-badge">
                {priceDisplay}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
