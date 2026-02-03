/**
 * THE COMMIT — Fullscreen Flip Overlay
 * Identical pattern to M1UShopFlipOverlay
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface TheCommitFlipOverlayProps {
  open: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
  children: React.ReactNode;
}

export const TheCommitFlipOverlay: React.FC<TheCommitFlipOverlayProps> = ({
  open,
  originRect,
  onClose,
  children,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const savedRectRef = useRef<DOMRect | null>(null);

  // Save rect when passed
  useEffect(() => {
    if (originRect) {
      savedRectRef.current = originRect;
    }
  }, [originRect]);

  // Create portal container
  useEffect(() => {
    let container = document.getElementById('m1-commit-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-commit-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isClosing) handleClose();
      };
      window.addEventListener('keydown', handleEsc);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [open, isClosing]);

  // Close handler with animation
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  }, [isClosing, onClose]);

  // Calculate transform origin from trigger element
  const getOrigin = () => {
    const rect = originRect || savedRectRef.current;
    if (!rect) return { x: '50%', y: '50%' };

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = ((rect.left + rect.width / 2) / vw) * 100;
    const y = ((rect.top + rect.height / 2) / vh) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const origin = getOrigin();
  const isExiting = isClosing || !open;

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 99998,
              pointerEvents: 'auto',
            }}
          />

          {/* Content panel (fullscreen) */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.3,
              transformOrigin: `${origin.x} ${origin.y}`,
            }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: isExiting ? 0.3 : 1,
              transformOrigin: `${origin.x} ${origin.y}`,
            }}
            exit={{
              opacity: 0,
              scale: 0.3,
              transformOrigin: `${origin.x} ${origin.y}`,
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: '#000000',
              overflow: 'hidden',
            }}
          >
            {/* Safe area top */}
            <div
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                background: '#000000',
              }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Chiudi"
              style={{
                position: 'absolute',
                top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
                right: '16px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Content */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {children}
            </div>

            {/* Safe area bottom */}
            <div
              style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                background: '#000000',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
};

export default TheCommitFlipOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
