// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX 06/02/2026: PTR SOSPESO → Modale "Coming Soon" al posto del refresh
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

// Thresholds
const PULL_TRIGGER = 80;
const MAX_PULL = 120;
const MIN_DELTA_FOR_PTR = 30;

// ═══════════════════════════════════════════════════════════════════════════
// COMING SOON MODAL - Stessa animazione di M1UShopFlipOverlay
// ═══════════════════════════════════════════════════════════════════════════
const ComingSoonModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let container = document.getElementById('m1-comingsoon-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-comingsoon-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, isClosing]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  }, [isClosing, onClose]);

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* BACKDROP */}
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
              backgroundColor: 'rgba(10, 10, 15, 0.80)',
              backdropFilter: 'blur(50px) saturate(180%)',
              WebkitBackdropFilter: 'blur(50px) saturate(180%)',
              pointerEvents: 'auto',
            }}
          />

          {/* MODAL PANEL */}
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.1, opacity: 0 }}
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
              transformOrigin: '50% 5%',
              willChange: 'transform, opacity',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CONTENT */}
            <div 
              className="w-full h-full flex flex-col items-center justify-center px-6"
              style={{
                background: 'linear-gradient(180deg, #0A0E14 0%, #0F1419 50%, #0A0E14 100%)',
              }}
            >
              {/* Close handle */}
              <motion.div 
                className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full cursor-pointer"
                onClick={handleClose}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
              />
              
              {/* Logo animato */}
              <motion.div
                className="mb-8"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img 
                  src={M1_LOGO_URL} 
                  alt="M1" 
                  className="w-24 h-24 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(0, 209, 255, 0.5))'
                  }}
                />
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                className="text-4xl font-orbitron font-bold mb-4 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-[#00D1FF]">COMING</span>
                <span className="text-white"> SOON</span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                className="text-white/60 text-center text-lg mb-8 max-w-xs"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Questa funzionalità sarà disponibile a breve. Stay tuned!
              </motion.p>
              
              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Clock className="w-8 h-8 text-[#00D1FF]" />
              </motion.div>
              
              {/* Close button */}
              <motion.button
                onClick={handleClose}
                className="px-8 py-3 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl text-[#00D1FF] font-medium"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 209, 255, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Chiudi
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  const [pull, setPull] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullRef = useRef(0);
  const touchStartedAtTopRef = useRef(false);

  useEffect(() => {
    if (disabled) return;
    
    const container = containerRef.current;
    if (!container) return;

    const getScrollParent = (): HTMLElement => {
      let el = container.parentElement;
      while (el) {
        const style = getComputedStyle(el);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || el.tagName === 'MAIN') {
          return el;
        }
        el = el.parentElement;
      }
      return document.documentElement;
    };

    const scrollParent = getScrollParent();

    const onTouchStart = (e: TouchEvent) => {
      startYRef.current = null;
      pullRef.current = 0;
      touchStartedAtTopRef.current = false;
      
      const scrollTop = scrollParent.scrollTop;
      if (scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        touchStartedAtTopRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null) return;
      if (!touchStartedAtTopRef.current) return;
      
      if (scrollParent.scrollTop > 5) {
        startYRef.current = null;
        pullRef.current = 0;
        setPull(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const delta = currentY - startYRef.current;

      if (delta <= MIN_DELTA_FOR_PTR) {
        pullRef.current = 0;
        setPull(0);
        return;
      }

      const pullDist = Math.min((delta - MIN_DELTA_FOR_PTR) * 0.5, MAX_PULL);
      pullRef.current = pullDist;
      setPull(pullDist);

      if (pullDist > 5) {
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      const currentPull = pullRef.current;
      const wasAtTop = touchStartedAtTopRef.current;
      
      startYRef.current = null;
      touchStartedAtTopRef.current = false;

      // 🔧 FIX 06/02/2026: Mostra modale "Coming Soon" invece di refresh
      if (wasAtTop && currentPull >= PULL_TRIGGER) {
        setShowComingSoon(true);
      }
      
      setPull(0);
      pullRef.current = 0;
    };

    const onTouchCancel = () => {
      startYRef.current = null;
      touchStartedAtTopRef.current = false;
      setPull(0);
      pullRef.current = 0;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [disabled]);

  if (disabled) {
    return <>{children}</>;
  }

  const progress = Math.min(pull / PULL_TRIGGER, 1);
  const isArmed = pull >= PULL_TRIGGER;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Pull indicator */}
      <AnimatePresence>
        {pull > 20 && (
          <motion.div
            className="absolute left-0 right-0 flex items-center justify-center z-[200] pointer-events-none"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: Math.min(pull, MAX_PULL) - 40 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.1 }}
            style={{ top: 0 }}
          >
            <motion.div
              className={`rounded-full ${isArmed ? 'ring-2 ring-cyan-400/60' : ''}`}
              animate={{ scale: 0.8 + progress * 0.3 }}
              transition={{ duration: 0.1 }}
            >
              <img 
                src={M1_LOGO_URL} 
                alt="M1" 
                className="w-10 h-10 object-contain"
                style={{
                  filter: isArmed ? 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.7))' : 'none'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{ y: pull }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.1 }}
      >
        {children}
      </motion.div>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoon} 
        onClose={() => setShowComingSoon(false)} 
      />
    </div>
  );
};

export default MissionSync;
