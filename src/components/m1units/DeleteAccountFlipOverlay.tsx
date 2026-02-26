/**
 * Delete Account modal overlay — same stack/style as M1UShopFlipOverlay (Apple 5.1.1 / GDPR)
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface DeleteAccountFlipOverlayProps {
  open: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
  children: React.ReactNode;
}

export const DeleteAccountFlipOverlay: React.FC<DeleteAccountFlipOverlayProps> = ({
  open,
  originRect,
  onClose,
  children,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const savedRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (originRect) savedRectRef.current = originRect;
  }, [originRect]);

  useEffect(() => {
    let container = document.getElementById('m1-delete-account-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-delete-account-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:999999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  useEffect(() => {
    if (open) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isClosing) handleClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [open, isClosing]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  }, [isClosing, onClose]);

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
  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isClosing ? 0.2 : 0.25 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              backgroundColor: 'rgba(10, 10, 15, 0.75)',
              backdropFilter: 'blur(50px) saturate(180%)',
              WebkitBackdropFilter: 'blur(50px) saturate(180%)',
              pointerEvents: 'auto',
            }}
          />
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.1, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: isClosing ? 400 : 280,
              damping: isClosing ? 32 : 24,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              pointerEvents: 'auto',
              transformOrigin: `${origin.x} ${origin.y}`,
              willChange: 'transform, opacity',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
};

export default DeleteAccountFlipOverlay;
