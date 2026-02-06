// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX 06/02/2026 v2: PTR RISCRITTO - Modale appare SOLO con pressione PROLUNGATA + pull + rilascio
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

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAZIONE - MOLTO PIÙ RESTRITTIVA
// ═══════════════════════════════════════════════════════════════════════════
const MIN_HOLD_TIME = 400;        // Deve tenere premuto almeno 400ms prima che conti
const PULL_TRIGGER = 100;         // Deve tirare almeno 100px dopo il hold
const MAX_PULL = 140;             // Max visual pull
const MIN_PULL_SPEED = 0.3;       // Velocità minima (px/ms) per essere considerato un pull intenzionale

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
// MAIN COMPONENT - LOGICA RISCRTTA DA CAPO
// ═══════════════════════════════════════════════════════════════════════════
export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  const [pull, setPull] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isHoldActive, setIsHoldActive] = useState(false); // Indica se il hold time è stato superato
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs per tracking
  const touchStartTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pullRef = useRef(0);
  const isValidGestureRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (disabled) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Trova scroll parent
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

    // ═══════════════════════════════════════════════════════════════════════
    // TOUCH START - Inizia solo se siamo in cima
    // ═══════════════════════════════════════════════════════════════════════
    const onTouchStart = (e: TouchEvent) => {
      // Reset tutto
      isValidGestureRef.current = false;
      pullRef.current = 0;
      setPull(0);
      setIsHoldActive(false);
      
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      
      const scrollTop = scrollParent.scrollTop;
      
      // DEVE essere in cima allo scroll per iniziare
      if (scrollTop > 5) {
        return;
      }
      
      const now = Date.now();
      const y = e.touches[0].clientY;
      
      touchStartTimeRef.current = now;
      touchStartYRef.current = y;
      lastYRef.current = y;
      lastTimeRef.current = now;
      
      // Timer per attivare il "hold mode" dopo MIN_HOLD_TIME
      holdTimerRef.current = setTimeout(() => {
        // Solo se il dito è ancora giù e non ha scrollato troppo
        if (scrollParent.scrollTop <= 5) {
          setIsHoldActive(true);
          isValidGestureRef.current = true;
          // Haptic feedback (se disponibile)
          if (navigator.vibrate) {
            navigator.vibrate(30);
          }
        }
      }, MIN_HOLD_TIME);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TOUCH MOVE - Traccia il pull SOLO se hold è attivo
    // ═══════════════════════════════════════════════════════════════════════
    const onTouchMove = (e: TouchEvent) => {
      // Se ha scrollato, cancella tutto
      if (scrollParent.scrollTop > 5) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isValidGestureRef.current = false;
        pullRef.current = 0;
        setPull(0);
        setIsHoldActive(false);
        return;
      }
      
      const now = Date.now();
      const currentY = e.touches[0].clientY;
      const totalDelta = currentY - touchStartYRef.current;
      
      // Se sta tirando verso l'alto (scroll up), cancella
      if (totalDelta < 0) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isValidGestureRef.current = false;
        pullRef.current = 0;
        setPull(0);
        setIsHoldActive(false);
        return;
      }
      
      // Calcola velocità
      const timeDiff = now - lastTimeRef.current;
      const yDiff = currentY - lastYRef.current;
      const speed = timeDiff > 0 ? yDiff / timeDiff : 0;
      
      lastYRef.current = currentY;
      lastTimeRef.current = now;
      
      // Se il hold è attivo E sta tirando verso il basso abbastanza veloce
      if (isValidGestureRef.current && speed >= MIN_PULL_SPEED && totalDelta > 10) {
        // Calcola pull con resistenza
        const pullDist = Math.min(totalDelta * 0.4, MAX_PULL);
        pullRef.current = pullDist;
        setPull(pullDist);
        
        // Previeni scroll nativo
        if (pullDist > 10) {
          e.preventDefault();
        }
      }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TOUCH END - Mostra modale SOLO se tutte le condizioni sono soddisfatte
    // ═══════════════════════════════════════════════════════════════════════
    const onTouchEnd = () => {
      // Cancella timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      
      const wasValidGesture = isValidGestureRef.current;
      const currentPull = pullRef.current;
      const holdWasActive = currentPull > 0;
      
      // Reset
      isValidGestureRef.current = false;
      pullRef.current = 0;
      setPull(0);
      setIsHoldActive(false);
      
      // ════════════════════════════════════════════════════════════════════
      // TRIGGER MODALE: SOLO se:
      // 1. Il gesture era valido (hold time superato)
      // 2. Ha tirato abbastanza (>= PULL_TRIGGER)
      // ════════════════════════════════════════════════════════════════════
      if (wasValidGesture && holdWasActive && currentPull >= PULL_TRIGGER) {
        console.log('[MissionSync] ✅ Valid PTR gesture detected - showing modal');
        setShowComingSoon(true);
      }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TOUCH CANCEL - Reset tutto
    // ═══════════════════════════════════════════════════════════════════════
    const onTouchCancel = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      isValidGestureRef.current = false;
      pullRef.current = 0;
      setPull(0);
      setIsHoldActive(false);
    };

    // Attach listeners
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
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
      {/* Pull indicator - appare SOLO quando hold è attivo */}
      <AnimatePresence>
        {isHoldActive && pull > 15 && (
          <motion.div
            className="absolute left-0 right-0 flex flex-col items-center justify-center z-[200] pointer-events-none"
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
            {/* Feedback visivo */}
            <motion.p 
              className="text-[10px] text-white/60 mt-2 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isArmed ? 'Rilascia!' : 'Continua a tirare...'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{ y: isHoldActive ? pull : 0 }}
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
