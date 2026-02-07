// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 M1U Payment Overlay - iOS WKWebView OPTIMIZED (identico agli altri)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface M1UPaymentFlipOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const M1UPaymentFlipOverlay: React.FC<M1UPaymentFlipOverlayProps> = ({
  open,
  onClose,
  children
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create portal
  useEffect(() => {
    let container = document.getElementById('m1-payment-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-payment-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:9999999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock scroll
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

  // Close handler
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  }, [isClosing, onClose]);

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* BACKDROP - REVOLUT: vetro fumé con blur forte */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isClosing ? 0.2 : 0.25 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999998,
              backgroundColor: 'rgba(10, 10, 15, 0.75)',
              backdropFilter: 'blur(50px) saturate(180%)',
              WebkitBackdropFilter: 'blur(50px) saturate(180%)',
              pointerEvents: 'auto',
            }}
          />

          {/* PANEL - scale animation dal centro */}
          <motion.div
            initial={{ 
              scale: 0.8,
              opacity: 0,
            }}
            animate={{ 
              scale: 1,
              opacity: 1,
            }}
            exit={{ 
              scale: 0.8,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: isClosing ? 400 : 280,
              damping: isClosing ? 32 : 24,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999999,
              pointerEvents: 'auto',
              transformOrigin: '50% 50%',
              willChange: 'transform, opacity',
              overflow: 'hidden',
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

export default M1UPaymentFlipOverlay;
