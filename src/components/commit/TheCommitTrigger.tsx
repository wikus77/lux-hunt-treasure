/**
 * THE COMMIT TRIGGER — Pill/button to open ritual modal
 * Minimal, ritual-like appearance
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TheCommitModal } from './TheCommitModal';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const TheCommitTrigger: React.FC = () => {
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
      <motion.button
        ref={triggerRef}
        onClick={handleOpen}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, rgba(0, 30, 40, 0.9) 0%, rgba(0, 20, 30, 0.95) 100%)',
          border: '1px solid rgba(0, 255, 255, 0.15)',
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: `
            0 2px 8px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
          e.currentTarget.style.boxShadow = `
            0 4px 12px rgba(0, 0, 0, 0.4),
            0 0 30px rgba(0, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.08)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.15)';
          e.currentTarget.style.boxShadow = `
            0 2px 8px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `;
        }}
      >
        {/* Ritual circle icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ opacity: 0.8 }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="rgba(0, 255, 255, 0.6)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="rgba(0, 255, 255, 0.4)"
          />
        </svg>

        {/* Label */}
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          COMMIT
        </span>
      </motion.button>

      {/* Modal */}
      <TheCommitModal
        isOpen={isModalOpen}
        onClose={handleClose}
        originRect={originRect}
      />
    </>
  );
};

export default TheCommitTrigger;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
