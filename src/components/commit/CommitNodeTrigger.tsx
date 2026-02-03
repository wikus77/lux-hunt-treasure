/**
 * COMMIT NODE TRIGGER — Circular "alive" node with fingerprint
 * Opens fullscreen modal on tap
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CommitModal } from './CommitModal';
import './commit-node.css';

// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT SVG (Abstract vector)
// ═══════════════════════════════════════════════════════════════════════════════

const FingerprintSVG: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    viewBox="0 0 64 64"
    width="48"
    height="48"
    style={{ opacity, transition: 'opacity 0.3s ease' }}
  >
    {/* Abstract fingerprint arcs */}
    <g fill="none" stroke="rgba(0, 255, 255, 0.5)" strokeWidth="1.2" strokeLinecap="round">
      {/* Core */}
      <path d="M32 28c0 4 2 8 0 12" />
      <path d="M28 26c-2 6 0 14 4 16" />
      <path d="M36 26c2 6 0 14 -4 16" />
      {/* Middle rings */}
      <path d="M24 24c-4 8 -2 18 8 22" />
      <path d="M40 24c4 8 2 18 -8 22" />
      {/* Outer rings */}
      <path d="M20 22c-6 10 -2 22 12 26" />
      <path d="M44 22c6 10 2 22 -12 26" />
      {/* Outermost partial */}
      <path d="M18 20c-4 6 -4 16 2 24" opacity="0.6" />
      <path d="M46 20c4 6 4 16 -2 24" opacity="0.6" />
    </g>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodeTrigger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [isHovered, setIsHovered] = useState(false);
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
      <motion.button
        ref={triggerRef}
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.95 }}
        className={`commit-node-container ${!isModalOpen ? 'commit-node-idle' : ''}`}
        style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #0a1520 0%, #000000 100%)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
        }}
        aria-label="Commit Node"
      >
        {/* Outer ring with micro-irregularity */}
        <div
          className="commit-ring-alive"
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            pointerEvents: 'none',
          }}
        />

        {/* Inner glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '50%',
            border: `1px solid rgba(0, 255, 255, ${isHovered ? 0.5 : 0.25})`,
            transition: 'border-color 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Fingerprint (emerges on hover) */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <FingerprintSVG opacity={isHovered ? 0.5 : 0.2} />
        </div>

        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: `rgba(0, 255, 255, ${isHovered ? 0.8 : 0.4})`,
            transition: 'background 0.3s ease',
            boxShadow: `0 0 ${isHovered ? 12 : 6}px rgba(0, 255, 255, ${isHovered ? 0.6 : 0.3})`,
          }}
        />
      </motion.button>

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
