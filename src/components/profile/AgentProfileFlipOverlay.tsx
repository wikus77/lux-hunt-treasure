// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 FLIP Overlay: nasce dall'icona profilo, ritorna all'icona in chiusura
// Timing: OPEN ~230ms, CLOSE ~200ms (fedeli al video reference)
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface AgentProfileFlipOverlayProps {
  open: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
  children: React.ReactNode;
}

export const AgentProfileFlipOverlay: React.FC<AgentProfileFlipOverlayProps> = ({
  open,
  originRect,
  onClose,
  children
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [savedRect, setSavedRect] = useState<DOMRect | null>(null);

  // Save rect when opening
  useEffect(() => {
    if (open && originRect) {
      setSavedRect(originRect);
    }
  }, [open, originRect]);

  // Create portal container
  useEffect(() => {
    let container = document.getElementById('m1-flip-overlay-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-flip-overlay-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock body scroll when open
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

  // Close handler - 200ms animation
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [isClosing, onClose]);

  // Calculate FLIP transform from origin rect
  const getTransform = () => {
    const rect = savedRect || originRect;
    if (!rect) {
      // Fallback: top-right
      return { x: window.innerWidth / 2 - 20, y: -window.innerHeight / 2 + 40, scale: 0.02 };
    }
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Origin center
    const ox = rect.left + rect.width / 2;
    const oy = rect.top + rect.height / 2;
    
    // Offset from viewport center
    const offsetX = ox - vw / 2;
    const offsetY = oy - vh / 2;
    
    // Scale ratio
    const scale = Math.max(rect.width / vw, rect.height / vh, 0.02);
    
    return { x: offsetX, y: offsetY, scale };
  };

  const transform = getTransform();

  if (!portalContainer) return null;

  const content = (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop - fade + blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isClosing ? 0.16 : 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-[99998]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              pointerEvents: 'auto',
            }}
            onClick={handleClose}
          />

          {/* FLIP Panel - OPEN 230ms / CLOSE 200ms */}
          <motion.div
            initial={{
              opacity: 0,
              x: transform.x,
              y: transform.y,
              scale: transform.scale,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: transform.x,
              y: transform.y,
              scale: transform.scale,
            }}
            transition={{
              duration: isClosing ? 0.2 : 0.23,
              ease: [0.16, 1, 0.3, 1], // cubic-bezier easeOut
            }}
            className="fixed inset-0 z-[99999]"
            style={{
              pointerEvents: 'auto',
              willChange: 'transform, opacity',
              transform: 'translate3d(0,0,0)',
            }}
          >
            {/* Full screen content */}
            <div 
              className="w-full h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, portalContainer);
};

export default AgentProfileFlipOverlay;
