// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX 06/02/2026 v3: PTR FLUIDO - animazioni progressive, no scatti
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAZIONE SEMPLIFICATA
// ═══════════════════════════════════════════════════════════════════════════
const MIN_HOLD_TIME = 300;        // Hold minimo prima che inizi il PTR
const PULL_TRIGGER = 90;          // Deve tirare 90px per triggerare
const MAX_PULL = 130;             // Max visual pull

// ═══════════════════════════════════════════════════════════════════════════
// COMING SOON MODAL - Animazione fluida
// ═══════════════════════════════════════════════════════════════════════════
const ComingSoonModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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
      return () => { document.body.style.overflow = orig; };
    }
  }, [isOpen]);

  if (!portalContainer) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP - fade in fluido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              backgroundColor: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              pointerEvents: 'auto',
            }}
          />

          {/* MODAL PANEL - slide up fluido */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 28,
              stiffness: 300,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              pointerEvents: 'auto',
              willChange: 'transform',
              overflow: 'hidden',
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
              {/* Close handle - drag down to close */}
              <motion.div 
                className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full cursor-pointer"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
              />
              
              {/* Logo */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
              >
                <img 
                  src={M1_LOGO_URL} 
                  alt="M1" 
                  className="w-24 h-24 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 25px rgba(0, 209, 255, 0.6))'
                  }}
                />
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                className="text-4xl font-orbitron font-bold mb-4 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
              >
                <span className="text-[#00D1FF]">COMING</span>
                <span className="text-white"> SOON</span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                className="text-white/60 text-center text-lg mb-8 max-w-xs"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
              >
                Questa funzionalità sarà disponibile a breve. Stay tuned!
              </motion.p>
              
              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              >
                <Clock className="w-8 h-8 text-[#00D1FF]" />
              </motion.div>
              
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="px-8 py-3 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl text-[#00D1FF] font-medium"
                whileTap={{ scale: 0.95 }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }}
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
// MAIN COMPONENT - LOGICA FLUIDA SENZA SCATTI
// ═══════════════════════════════════════════════════════════════════════════
export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use spring for smooth pull animation
  const pullSpring = useSpring(0, { stiffness: 400, damping: 35 });
  const pullProgress = useTransform(pullSpring, [0, PULL_TRIGGER], [0, 1]);
  
  // Refs per tracking
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isHoldValidRef = useRef(false);
  const currentPullRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (disabled) return;
    
    const container = containerRef.current;
    if (!container) return;

    const getScrollTop = (): number => {
      // Check multiple scroll containers
      const main = document.querySelector('main');
      if (main && main.scrollTop > 0) return main.scrollTop;
      return document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      // Reset
      isHoldValidRef.current = false;
      currentPullRef.current = 0;
      
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      
      // Solo se in cima
      if (getScrollTop() > 5) return;
      
      touchStartYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
      
      // Timer per validare hold
      holdTimerRef.current = setTimeout(() => {
        if (getScrollTop() <= 5) {
          isHoldValidRef.current = true;
          // Haptic
          if (navigator.vibrate) navigator.vibrate(20);
        }
      }, MIN_HOLD_TIME);
    };

    const onTouchMove = (e: TouchEvent) => {
      // Se scrollato, reset
      if (getScrollTop() > 5) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isHoldValidRef.current = false;
        currentPullRef.current = 0;
        pullSpring.set(0);
        return;
      }
      
      const currentY = e.touches[0].clientY;
      const delta = currentY - touchStartYRef.current;
      
      // Pull verso l'alto = cancella
      if (delta < 0) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isHoldValidRef.current = false;
        currentPullRef.current = 0;
        pullSpring.set(0);
        return;
      }
      
      // Se hold è valido, traccia il pull
      if (isHoldValidRef.current && delta > 0) {
        const pullDist = Math.min(delta * 0.5, MAX_PULL);
        currentPullRef.current = pullDist;
        pullSpring.set(pullDist);
        
        // Previeni scroll nativo quando pull attivo
        if (pullDist > 10) {
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      
      const wasValid = isHoldValidRef.current;
      const finalPull = currentPullRef.current;
      
      // Reset
      isHoldValidRef.current = false;
      currentPullRef.current = 0;
      pullSpring.set(0);
      
      // Trigger modale se condizioni soddisfatte
      if (wasValid && finalPull >= PULL_TRIGGER) {
        setShowComingSoon(true);
      }
    };

    const onTouchCancel = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      isHoldValidRef.current = false;
      currentPullRef.current = 0;
      pullSpring.set(0);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [disabled, pullSpring]);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Pull indicator - usa motion.value per fluidità */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center justify-center z-[200] pointer-events-none"
        style={{ 
          top: 0,
          y: useTransform(pullSpring, (v) => v - 50),
          opacity: useTransform(pullSpring, [0, 30, MAX_PULL], [0, 1, 1]),
        }}
      >
        <motion.div
          className="rounded-full"
          style={{
            scale: useTransform(pullSpring, [0, PULL_TRIGGER], [0.7, 1.1]),
            boxShadow: useTransform(
              pullSpring, 
              [0, PULL_TRIGGER], 
              ['0 0 0px rgba(0,209,255,0)', '0 0 15px rgba(0,209,255,0.6)']
            ),
          }}
        >
          <img 
            src={M1_LOGO_URL} 
            alt="M1" 
            className="w-10 h-10 object-contain"
          />
        </motion.div>
        <motion.p 
          className="text-[10px] mt-2 font-medium"
          style={{
            color: useTransform(
              pullSpring, 
              [0, PULL_TRIGGER - 10, PULL_TRIGGER], 
              ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.6)', 'rgba(0,209,255,1)']
            ),
          }}
        >
          <motion.span style={{ 
            opacity: useTransform(pullSpring, [30, 50], [0, 1]) 
          }}>
            {/* Dynamic text based on pull */}
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Content - si muove con spring */}
      <motion.div style={{ y: pullSpring }}>
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
