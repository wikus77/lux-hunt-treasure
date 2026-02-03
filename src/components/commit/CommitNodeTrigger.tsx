/**
 * COMMIT NODE TRIGGER — Uses AION Entity Blob
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
      background: 'radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, transparent 70%)',
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
      {/* AION Entity Container */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className="commit-node-aion-wrapper"
        style={{
          width: '88px',
          height: '88px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <AionEntity 
            intensity={0.8}
            idleSpeed={0.5}
            className="commit-aion-entity"
          />
        </Suspense>
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
