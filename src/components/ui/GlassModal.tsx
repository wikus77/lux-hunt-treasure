/**
 * GlassModal v7 - Bottom-Sheet che NON copre Header e BottomNav
 * CRITICAL: Il modal si posiziona TRA header e bottom nav
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  accentColor: string;
  title: string;
  subtitle?: string;
}

// Layout constants
const HEADER_HEIGHT = 72;
const BOTTOM_NAV_HEIGHT = 64;
const SAFE_AREA_TOP = 'env(safe-area-inset-top, 0px)';
const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

export function GlassModal({ isOpen, onClose, children, accentColor, title, subtitle }: GlassModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const touchStartRef = useRef({ y: 0, scrollTop: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

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

  if (!portalContainer) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - SOLO tra header e bottom nav */}
          <motion.div
            style={{ 
              position: 'fixed',
              top: `calc(${HEADER_HEIGHT}px + ${SAFE_AREA_TOP})`,
              left: 0,
              right: 0,
              bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_AREA_BOTTOM})`,
              zIndex: 9990,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Bottom Sheet - Posizionato TRA header e bottom nav */}
          <motion.div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              // Bottom: appena sopra la bottom nav
              bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_AREA_BOTTOM})`,
              // Max height: spazio disponibile tra header e bottom nav
              maxHeight: `calc(100dvh - ${HEADER_HEIGHT}px - ${BOTTOM_NAV_HEIGHT}px - ${SAFE_AREA_TOP} - ${SAFE_AREA_BOTTOM} - 16px)`,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9995,
              // iOS 26 Glass Effect
              background: 'linear-gradient(180deg, rgba(28, 32, 52, 0.92) 0%, rgba(20, 24, 44, 0.96) 50%, rgba(14, 18, 38, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
              boxShadow: `
                0 -20px 60px rgba(0, 0, 0, 0.5),
                0 -8px 30px ${accentColor}15,
                inset 0 1px 0 rgba(255, 255, 255, 0.12)
              `,
              overflow: 'hidden',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 32, 
              stiffness: 380,
              mass: 0.8 
            }}
          >
            {/* Header del modal - sticky */}
            <div 
              style={{
                flexShrink: 0,
                padding: '12px 16px 14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                position: 'relative',
              }}
            >
              {/* Handle bar */}
              <div 
                style={{
                  width: '36px',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  margin: '0 auto 12px auto',
                }}
              />
              
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Chiudi"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '12px',
                  zIndex: 10,
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  touchAction: 'manipulation',
                  cursor: 'pointer',
                }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Title */}
              <div style={{ paddingRight: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <div 
                    style={{ 
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: accentColor,
                      boxShadow: `0 0 10px ${accentColor}`,
                    }}
                  />
                  <h2 
                    className="font-orbitron"
                    style={{ 
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'white',
                      margin: 0,
                    }}
                  >
                    {title}
                  </h2>
                </div>
                {subtitle && (
                  <p style={{ 
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: 0,
                    marginLeft: '16px',
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div 
              ref={scrollRef}
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
                padding: '16px',
                paddingBottom: '24px',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, portalContainer);
}

export default GlassModal;
