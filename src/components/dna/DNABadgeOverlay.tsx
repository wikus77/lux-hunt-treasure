// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { useDNA } from '@/hooks/useDNA';
import { DNABadge } from './DNABadge';

/**
 * Overlay component that displays DNA badge in header without modifying UnifiedHeader
 * Positioned as fixed overlay in top-right area
 */
export const DNABadgeOverlay: React.FC = () => {
  const { dnaProfile, isLoading } = useDNA();

  // Don't render if loading or no DNA profile
  if (isLoading || !dnaProfile) {
    return null;
  }

  return (
    <div 
      className="fixed z-[51] pointer-events-none"
      style={{
        top: 'calc(max(env(safe-area-inset-top, 0px), 12px) + 20px)',
        right: '90px', // Position between settings and profile
      }}
    >
      <div className="pointer-events-auto">
        <DNABadge archetype={dnaProfile.archetype} />
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
