/**
 * COMMIT NODE SIDE — Grayscale AION Entity (black → gray → white gradient)
 * Visual only, no click handler, placed left/right of main CommitNode
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { Suspense, lazy } from 'react';
import './commit-node.css';

// Lazy load AionEntity to prevent THREE.js issues
const AionEntity = lazy(() => import('@/components/aion/AionEntity'));

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

const LoadingFallback: React.FC = () => (
  <div 
    className="w-18 h-18 rounded-full bg-gray-500/20 animate-pulse"
  />
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodeSide: React.FC = () => {
  return (
    <div
      className="commit-node-side-wrapper"
      style={{
        width: '110px',
        height: '110px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '50%',
        // Grayscale + high contrast to create black → gray → white gradient effect
        filter: 'grayscale(100%) contrast(1.3) brightness(1.1)',
      }}
    >
      {/* 
        Inner container - EXACT same setup as CommitNodeTrigger
        280x280px scaled down by 0.39 to fit in ~110px
      */}
      <div
        style={{
          width: '280px',
          height: '280px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.39)',
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <AionEntity 
            intensity={1.2}
            idleSpeed={0.5}
            className="mx-auto"
          />
        </Suspense>
      </div>
    </div>
  );
};

export default CommitNodeSide;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
