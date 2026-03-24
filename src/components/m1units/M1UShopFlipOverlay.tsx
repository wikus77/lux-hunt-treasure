// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 M1U Shop Overlay - iOS WKWebView OPTIMIZED (identico a SettingsFlipOverlay)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface M1UShopFlipOverlayProps {
  open: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional portal id; default 'm1-m1ushop-portal'. Use a different id (e.g. 'm1-pulsebreaker-portal') when reusing this overlay for another modal to avoid overwriting the M1U portal. */
  portalId?: string;
}

const DEFAULT_M1U_PORTAL_ID = 'm1-m1ushop-portal';

export const M1UShopFlipOverlay: React.FC<M1UShopFlipOverlayProps> = ({
  open,
  originRect,
  onClose,
  children,
  portalId = DEFAULT_M1U_PORTAL_ID,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const savedRectRef = useRef<DOMRect | null>(null);

  // Salva rect quando viene passato
  useEffect(() => {
    if (originRect) {
      savedRectRef.current = originRect;
    }
  }, [originRect]);

  // Create portal
  useEffect(() => {
    let container = document.getElementById(portalId);
    if (!container) {
      container = document.createElement('div');
      container.id = portalId;
      container.style.cssText = 'position:fixed;inset:0;z-index:999999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, [portalId]);

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

  // Calculate transform origin
  const getOrigin = () => {
    const rect = originRect || savedRectRef.current;
    if (!rect) return { x: '50%', y: '5%' }; // Fallback top-center for pill
    
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
              zIndex: 99998,
              // REVOLUT: sfondo scuro semi-trasparente + blur forte
              backgroundColor: 'rgba(10, 10, 15, 0.75)',
              backdropFilter: 'blur(50px) saturate(180%)',
              WebkitBackdropFilter: 'blur(50px) saturate(180%)',
              pointerEvents: 'auto',
            }}
          />

          {/* PANEL - scale animation */}
          <motion.div
            initial={{ 
              scale: 0.1,
              opacity: 0,
            }}
            animate={{ 
              scale: 1,
              opacity: 1,
            }}
            exit={{ 
              scale: 0.1,
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
              zIndex: 99999,
              pointerEvents: 'auto',
              transformOrigin: `${origin.x} ${origin.y}`,
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

export default M1UShopFlipOverlay;
