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
    style={{
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(0, 100, 150, 0.1) 50%, transparent 70%)',
      animation: 'pulse 2s ease-in-out infinite',
    }}
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
        AION Entity Container 
        - Inner container is 180x180px to give AionEntity enough space to render
        - Outer wrapper scales it down to ~90px visually using transform
        - overflow: visible allows the blob glow to extend
      */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className="commit-node-aion-wrapper"
        style={{
          width: '100px',
          height: '100px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {/* Scaled-down inner container for AionEntity */}
        <div
          style={{
            width: '200px',
            height: '200px',
            transform: 'scale(0.5)',
            transformOrigin: 'center center',
            position: 'relative',
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <AionEntity 
              intensity={0.9}
              idleSpeed={0.6}
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
