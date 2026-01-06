/**
 * GlassModal v8 - Bottom-Sheet IDENTICO a ProfileBottomSheet
 * CRITICAL: Copre la bottom nav, swipe-to-close senza refresh
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X } from "lucide-react";

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  accentColor: string;
  title: string;
  subtitle?: string;
}

export function GlassModal({ isOpen, onClose, children, accentColor, title, subtitle }: GlassModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const touchStartRef = useRef({ y: 0, scrollTop: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // 🆕 Swipe-to-close
  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);
  const SWIPE_THRESHOLD = 100; // px per chiudere

  // Create portal container on mount
  useEffect(() => {
    let container = document.getElementById('m1-modal-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-modal-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock body scroll when modal is open (but DON'T hide header/bottomnav)
  useEffect(() => {
    if (!isOpen) return;
    
    scrollYRef.current = window.scrollY;
    
    // Only prevent background scroll, don't change position
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.classList.add('m1-modal-open');
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.classList.remove('m1-modal-open');
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // PTR prevention handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    
    touchStartRef.current = {
      y: e.touches[0].clientY,
      scrollTop: scrollEl.scrollTop
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    
    const { y: startY, scrollTop: startScrollTop } = touchStartRef.current;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    const isAtTop = startScrollTop <= 0;
    const isAtBottom = startScrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1;
    
    if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // 🆕 Swipe-to-close handler
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > SWIPE_THRESHOLD || info.velocity.y > 500) {
      onClose();
    }
    dragY.set(0);
  }, [onClose, dragY]);

  if (!portalContainer) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - COPRE TUTTO come ProfileBottomSheet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
            onClick={onClose}
          />
          
          {/* Bottom Sheet - IDENTICO a ProfileBottomSheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[99999] max-h-[90vh] overflow-hidden"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              opacity: dragOpacity,
              y: dragY,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Background container - IDENTICO a ProfileBottomSheet */}
            <div 
              className="rounded-t-3xl bg-[#0a0a0f]/85 backdrop-blur-xl border-t border-x overflow-hidden"
              style={{
                borderColor: `${accentColor}30`,
                boxShadow: `0 -10px 40px ${accentColor}15, 0 0 0 1px ${accentColor}10`,
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab">
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      background: accentColor,
                      boxShadow: `0 0 10px ${accentColor}`,
                    }}
                  />
                  <h3 className="font-orbitron font-bold text-white text-[15px]">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
              
              {subtitle && (
                <p className="text-xs text-white/50 px-4 pt-2">{subtitle}</p>
              )}

              {/* Scrollable Content */}
              <div 
                ref={scrollRef}
                className="overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
                style={{
                  maxHeight: 'calc(90vh - 80px - env(safe-area-inset-bottom, 0px))',
                  WebkitOverflowScrolling: 'touch',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, portalContainer);
}

export default GlassModal;
