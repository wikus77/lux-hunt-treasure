/**
 * ChatFlipOverlay - Full-screen chat modal with Revolut-style animation
 * Animates from the conversation item origin
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatFlipOverlayProps {
  open: boolean;
  onClose: () => void;
  originRect: DOMRect | null;
  children: React.ReactNode;
}

export const ChatFlipOverlay: React.FC<ChatFlipOverlayProps> = ({
  open,
  onClose,
  originRect,
  children,
}) => {
  const savedRectRef = useRef<DOMRect | null>(null);

  // Save originRect when opening
  useEffect(() => {
    if (open && originRect) {
      savedRectRef.current = originRect;
    }
  }, [open, originRect]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calculate transform origin from saved rect
  const getTransformOrigin = () => {
    const rect = savedRectRef.current;
    if (!rect) return '50% 50%';
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return `${centerX}px ${centerY}px`;
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(10, 10, 15, 0.75)',
            backdropFilter: 'blur(50px) saturate(180%)',
            WebkitBackdropFilter: 'blur(50px) saturate(180%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 32,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transformOrigin: getTransformOrigin(),
              overflow: 'hidden',
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ChatFlipOverlay;
