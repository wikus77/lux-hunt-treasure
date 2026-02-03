/**
 * COMMIT NODE TRIGGER — AION Bubble (alive organism)
 * Morph, energy, particles, breathing - opens fullscreen modal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback } from 'react';
import { CommitModal } from './CommitModal';
import './commit-node.css';

// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT SVG (Abstract vector)
// ═══════════════════════════════════════════════════════════════════════════════

const FingerprintSVG: React.FC = () => (
  <svg viewBox="0 0 64 64" width="40" height="40">
    <g fill="none" stroke="rgba(0, 255, 255, 0.55)" strokeWidth="1.2" strokeLinecap="round">
      <path d="M32 28c0 4 2 8 0 12" />
      <path d="M28 26c-2 6 0 14 4 16" />
      <path d="M36 26c2 6 0 14 -4 16" />
      <path d="M24 24c-4 8 -2 18 8 22" />
      <path d="M40 24c4 8 2 18 -8 22" />
      <path d="M20 22c-6 10 -2 22 12 26" opacity="0.7" />
      <path d="M44 22c6 10 2 22 -12 26" opacity="0.7" />
      <path d="M18 20c-4 6 -4 16 2 24" opacity="0.4" />
      <path d="M46 20c4 6 4 16 -2 24" opacity="0.4" />
    </g>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodeTrigger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
      {/* AION Bubble Wrapper */}
      <div className="commit-node-wrapper">
        {/* Main Button */}
        <button
          ref={triggerRef}
          onClick={handleOpen}
          className="commit-node-button"
          aria-label="Commit Ritual"
        >
          {/* Glow layer (outermost) */}
          <div className="commit-node-glow" />

          {/* Energy ring (rotating conic gradient) */}
          <div className="commit-node-ring" />

          {/* Blob skin (morphing organic shape) */}
          <div className="commit-node-blob" />

          {/* Core (deep black center) */}
          <div className="commit-node-core" />

          {/* Orbiting particles */}
          <div className="commit-node-particles">
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
            <span className="commit-node-particle" />
          </div>

          {/* Center energy dot */}
          <div className="commit-node-center" />

          {/* Fingerprint overlay */}
          <div className="commit-node-fingerprint">
            <FingerprintSVG />
          </div>
        </button>
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
