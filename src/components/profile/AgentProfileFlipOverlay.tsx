// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 FLIP Overlay: nasce dall'icona profilo, ritorna all'icona in chiusura
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

  // Create portal container
  useEffect(() => {
    let container = document.getElementById('m1-flip-overlay-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-flip-overlay-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // ESC key to close
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

  // Close handler with animation lock
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    // Wait for exit animation then call onClose
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 450); // Match close animation duration
  }, [isClosing, onClose]);

  // Calculate FLIP transform from origin rect
  const getInitialTransform = () => {
    if (!originRect) {
      return { x: 0, y: -50, scale: 0.9 };
    }
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Target is center of viewport
    const targetX = viewportWidth / 2;
    const targetY = viewportHeight / 2;
    
    // Origin is center of the icon
    const originX = originRect.left + originRect.width / 2;
    const originY = originRect.top + originRect.height / 2;
    
    // Calculate offset from center
    const offsetX = originX - targetX;
    const offsetY = originY - targetY;
    
    // Scale based on icon size vs panel size
    const scaleX = originRect.width / viewportWidth;
    const scaleY = originRect.height / viewportHeight;
    const scale = Math.max(scaleX, scaleY, 0.05);
    
    return { x: offsetX, y: offsetY, scale };
  };

  const initialTransform = getInitialTransform();

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const panelVariants = {
    hidden: {
      opacity: 0,
      x: initialTransform.x,
      y: initialTransform.y,
      scale: initialTransform.scale,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: initialTransform.x,
      y: initialTransform.y,
      scale: initialTransform.scale,
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.035,
      }
    },
    exit: { opacity: 0 }
  };

  if (!portalContainer) return null;

  const content = (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              duration: 0.14, 
              ease: 'easeOut',
            }}
            className="fixed inset-0 z-[99998]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={handleClose}
          />

          {/* FLIP Panel - nasce dall'icona */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: isClosing ? 560 : 520,
              damping: isClosing ? 46 : 42,
              mass: 0.9,
            }}
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{
              paddingTop: 'env(safe-area-inset-top, 47px)',
              paddingBottom: 'env(safe-area-inset-bottom, 34px)',
              paddingLeft: '0',
              paddingRight: '0',
            }}
          >
            {/* Glass Panel - FULL SCREEN */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.12 }}
              className="w-full h-full overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a10 100%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, portalContainer);
};

export default AgentProfileFlipOverlay;
