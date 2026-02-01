// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 REVOLUT-STYLE Overlay: nasce ESATTAMENTE dall'icona profilo
// Timing REVOLUT: OPEN ~280ms spring, CLOSE ~220ms spring
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

  // Save rect when opening - CRITICAL for return animation
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

  // Close handler
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 250);
  }, [isClosing, onClose]);

  // 🎯 CRITICAL: Calculate transform so panel STARTS from icon position
  const iconRect = savedRect || originRect;
  
  const initialState = useMemo(() => {
    if (!iconRect) {
      // Fallback if no rect - use top-right
      return {
        clipPath: 'circle(20px at calc(100% - 40px) 60px)',
        opacity: 0,
      };
    }
    
    // Icon center in viewport
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const iconCenterY = iconRect.top + iconRect.height / 2;
    const iconRadius = Math.max(iconRect.width, iconRect.height) / 2;
    
    return {
      clipPath: `circle(${iconRadius}px at ${iconCenterX}px ${iconCenterY}px)`,
      opacity: 0.5,
    };
  }, [iconRect]);

  const finalState = {
    clipPath: 'circle(150% at 50% 50%)',
    opacity: 1,
  };

  if (!portalContainer) return null;

  const content = (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop - blur behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isClosing ? 0.2 : 0.25 }}
            className="fixed inset-0 z-[99998]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              pointerEvents: 'auto',
            }}
            onClick={handleClose}
          />

          {/* 🎬 Panel - CLIP-PATH animation from icon */}
          <motion.div
            initial={initialState}
            animate={finalState}
            exit={initialState}
            transition={{
              duration: isClosing ? 0.22 : 0.28,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="fixed inset-0 z-[99999]"
            style={{
              pointerEvents: 'auto',
              willChange: 'clip-path, opacity',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, portalContainer);
};

export default AgentProfileFlipOverlay;
