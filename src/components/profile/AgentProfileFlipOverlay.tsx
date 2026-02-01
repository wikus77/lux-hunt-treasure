// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 REVOLUT-STYLE Overlay: nasce dall'icona profilo, ritorna all'icona in chiusura
// Timing REVOLUT: OPEN ~280ms spring, CLOSE ~220ms spring
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
    let container = document.getElementById('m1-revolut-overlay-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-revolut-overlay-portal';
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

  // Close handler - Revolut ~220ms
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 220);
  }, [isClosing, onClose]);

  // Calculate origin transform from icon rect
  const getOriginTransform = () => {
    const rect = savedRect || originRect;
    if (!rect) {
      // Fallback: top-right corner
      return { 
        x: window.innerWidth / 2 - 24, 
        y: -window.innerHeight / 2 + 60, 
        scale: 0.03,
        originX: 1,
        originY: 0
      };
    }
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Icon center position
    const iconCenterX = rect.left + rect.width / 2;
    const iconCenterY = rect.top + rect.height / 2;
    
    // Offset from viewport center
    const offsetX = iconCenterX - vw / 2;
    const offsetY = iconCenterY - vh / 2;
    
    // Scale based on icon size
    const scale = Math.max(rect.width / vw, 0.03);
    
    return { 
      x: offsetX, 
      y: offsetY, 
      scale,
      originX: iconCenterX / vw,
      originY: iconCenterY / vh
    };
  };

  const origin = getOriginTransform();

  if (!portalContainer) return null;

  const content = (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop - Revolut dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isClosing ? 0.18 : 0.22, 
              ease: [0.32, 0.72, 0, 1] 
            }}
            className="fixed inset-0 z-[99998]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              pointerEvents: 'auto',
            }}
            onClick={handleClose}
          />

          {/* REVOLUT Panel - expand from icon */}
          <motion.div
            initial={{
              opacity: 0,
              scale: origin.scale,
              x: origin.x,
              y: origin.y,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: origin.scale,
              x: origin.x,
              y: origin.y,
            }}
            transition={{
              type: 'spring',
              stiffness: isClosing ? 400 : 340,
              damping: isClosing ? 32 : 28,
              mass: 0.8,
            }}
            className="fixed inset-0 z-[99999]"
            style={{
              pointerEvents: 'auto',
              willChange: 'transform, opacity',
              transformOrigin: `${origin.originX * 100}% ${origin.originY * 100}%`,
            }}
          >
            {/* Full screen content container */}
            <motion.div 
              className="w-full h-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, delay: isClosing ? 0 : 0.08 }}
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
