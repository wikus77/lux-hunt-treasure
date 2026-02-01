// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 REVOLUT-STYLE Overlay: nasce ESATTAMENTE dall'icona profilo
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

  // 🔥 FIX: Salva rect IMMEDIATAMENTE quando cambia (non solo quando open)
  useEffect(() => {
    if (originRect) {
      setSavedRect(originRect);
    }
  }, [originRect]);

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

  // 🎯 FIX: Usa originRect per OPEN (primo render), savedRect per CLOSE
  // originRect è passato al click, savedRect è salvato per la chiusura
  const activeRect = originRect || savedRect;
  
  // Calculate icon center position for clip-path
  const getClipOrigin = (rect: DOMRect | null) => {
    if (!rect) {
      // Fallback: top-right corner (NON dovrebbe mai succedere)
      console.warn('[AgentProfileFlipOverlay] No rect available, using fallback');
      return { x: 'calc(100% - 40px)', y: '60px', radius: '24px' };
    }
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.max(rect.width, rect.height) / 2;
    return { x: `${x}px`, y: `${y}px`, radius: `${radius}px` };
  };
  
  const clipOrigin = getClipOrigin(activeRect);

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
            transition={{ duration: isClosing ? 0.18 : 0.22 }}
            className="fixed inset-0 z-[99998]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              pointerEvents: 'auto',
            }}
            onClick={handleClose}
          />

          {/* 🎬 Panel - CLIP-PATH animation from icon (OPEN + CLOSE) */}
          <motion.div
            initial={{ 
              clipPath: `circle(${clipOrigin.radius} at ${clipOrigin.x} ${clipOrigin.y})`,
              opacity: 1,
            }}
            animate={{ 
              clipPath: `circle(150% at 50% 50%)`,
              opacity: 1,
            }}
            exit={{ 
              clipPath: `circle(${clipOrigin.radius} at ${clipOrigin.x} ${clipOrigin.y})`,
              opacity: 1,
            }}
            transition={{
              clipPath: {
                duration: isClosing ? 0.22 : 0.28,
                ease: [0.32, 0.72, 0, 1],
              },
              opacity: {
                duration: 0.1,
              }
            }}
            className="fixed inset-0 z-[99999]"
            style={{
              pointerEvents: 'auto',
              willChange: 'clip-path',
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
