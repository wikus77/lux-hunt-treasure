// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 REVOLUT-STYLE Overlay: SCALE animation (iOS compatible)
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

  // Salva rect quando viene passato
  useEffect(() => {
    if (originRect) {
      setSavedRect(originRect);
    }
  }, [originRect]);

  // Create portal container
  useEffect(() => {
    let container = document.getElementById('m1-profile-overlay-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-profile-overlay-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock body scroll
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

  // Close handler - NON MODIFICARE (chiusura perfetta)
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 220);
  }, [isClosing, onClose]);

  // 🎯 Calculate transform origin from icon position
  const activeRect = originRect || savedRect;
  
  const transformOrigin = useMemo(() => {
    if (!activeRect) return 'top right';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = ((activeRect.left + activeRect.width / 2) / vw) * 100;
    const y = ((activeRect.top + activeRect.height / 2) / vh) * 100;
    return `${x}% ${y}%`;
  }, [activeRect]);

  if (!portalContainer) return null;

  const content = (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* 🎨 Backdrop - REVOLUT: vetro fumé scuro con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isClosing ? 0.18 : 0.25 }}
            className="fixed inset-0 z-[99998]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              pointerEvents: 'auto',
            }}
            onClick={handleClose}
          />

          {/* 🎬 Panel - SCALE animation from icon (iOS compatible) */}
          <motion.div
            initial={{ 
              scale: 0,
              opacity: 0,
              borderRadius: '50%',
            }}
            animate={{ 
              scale: 1,
              opacity: 1,
              borderRadius: '0%',
            }}
            exit={{ 
              scale: 0,
              opacity: 0,
              borderRadius: '50%',
            }}
            transition={{
              type: 'spring',
              stiffness: isClosing ? 380 : 320,
              damping: isClosing ? 30 : 26,
              mass: 0.8,
            }}
            className="fixed inset-0 z-[99999] overflow-hidden"
            style={{
              pointerEvents: 'auto',
              transformOrigin: transformOrigin,
              willChange: 'transform, opacity',
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
