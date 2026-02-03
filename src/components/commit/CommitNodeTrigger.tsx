/**
 * COMMIT NODE TRIGGER — Uses AION Entity Blob (scaled down)
 * Same visual as Intelligence page, scaled to fit
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback, Suspense, lazy } from 'react';
import { CommitModal } from './CommitModal';
import './commit-node.css';

// Lazy load AionEntity to prevent THREE.js issues
const AionEntity = lazy(() => import('@/components/aion/AionEntity'));

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

const LoadingFallback: React.FC = () => (
  <div 
    className="w-18 h-18 rounded-full bg-cyan-500/20 animate-pulse"
  />
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodeTrigger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (triggerRef.current) {
      setOriginRect(triggerRef.current.getBoundingClientRect());
    }
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      {/* 
        Outer wrapper - defines the visual size (100x100px)
        The inner AION container is 280x280px, scaled down to fit
      */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className="commit-node-aion-wrapper"
        style={{
          width: '110px',
          height: '110px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden', // Clip the scaled content
          borderRadius: '50%', // Round clipping
        }}
      >
        {/* 
          Inner container - EXACT same setup as IntelligencePage
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
              intensity={1.0}
              idleSpeed={0.7}
              className="mx-auto"
            />
          </Suspense>
        </div>
      </div>

      {/* Modal */}
      <CommitModal
        isOpen={isModalOpen}
        onClose={handleClose}
        originRect={originRect}
      />
    </>
  );
};

export default CommitNodeTrigger;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
