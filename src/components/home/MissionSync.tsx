// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX 06/02/2026 v3: PTR FLUIDO - animazioni progressive, no scatti
// 🎮 07/02/2026: Replaced Coming Soon with DISCO ROTAZIONE mini-game
import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

// Lazy load the game component
const DiscoRotazione = lazy(() => import('@/components/games/DiscoRotazione'));

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
// DISCO ROTAZIONE MODAL - Mini-game fullscreen
// ═══════════════════════════════════════════════════════════════════════════
const DiscoRotazioneModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let container = document.getElementById('m1-disco-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-disco-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock to portrait when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Try to lock orientation to portrait
    const lockOrientation = async () => {
      try {
        // Standard Screen Orientation API (experimental, needs type cast)
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (orientation: string) => Promise<void>;
          unlock?: () => void;
        };
        if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock('portrait');
          console.log('[DiscoRotazione] Orientation locked to portrait');
        }
      } catch (err) {
        // Orientation lock not supported or denied - this is fine
        console.log('[DiscoRotazione] Orientation lock not available:', err);
      }
    };

    lockOrientation();

    return () => {
      document.body.style.overflow = origOverflow;
      // Unlock orientation
      try {
        const orientation = screen.orientation as ScreenOrientation & {
          unlock?: () => void;
        };
        if (orientation && typeof orientation.unlock === 'function') {
          orientation.unlock();
          console.log('[DiscoRotazione] Orientation unlocked');
        }
      } catch (err) {
        // Ignore unlock errors
      }
    };
  }, [isOpen]);

  const handleSuccess = (score: number) => {
    console.log('[DiscoRotazione] SUCCESS! Score:', score);
    // TODO: Award M1U or other reward
  };

  const handleFail = (score: number) => {
    console.log('[DiscoRotazione] FAIL! Score:', score);
  };

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
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              backgroundColor: 'rgba(5, 7, 9, 0.95)',
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
              className="w-full h-full flex flex-col"
              style={{
                background: 'linear-gradient(180deg, #0A0E14 0%, #050709 50%, #0A0E14 100%)',
                paddingTop: 'env(safe-area-inset-top, 47px)',
                paddingBottom: 'env(safe-area-inset-bottom, 34px)',
              }}
            >
              {/* Close handle */}
              <motion.div 
                className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full cursor-pointer z-50"
                style={{ top: 'calc(env(safe-area-inset-top, 47px) + 12px)' }}
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
              />
              
              {/* Title */}
              <motion.div 
                className="text-center pt-12 pb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h1 className="text-xl font-orbitron font-bold">
                  <span className="text-white">DISCO</span>
                  <span className="text-[#00D1FF]"> ROTAZIONE</span>
                </h1>
              </motion.div>
              
              {/* Game Container */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-2 border-[#00D1FF]/30 border-t-[#00D1FF] rounded-full animate-spin mb-4" />
                    <p className="text-white/50 text-sm">Caricamento...</p>
                  </div>
                }>
                  <DiscoRotazione 
                    onClose={onClose}
                    onSuccess={handleSuccess}
                    onFail={handleFail}
                  />
                </Suspense>
              </div>
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
      
      {/* Disco Rotazione Game Modal */}
      <DiscoRotazioneModal 
        isOpen={showComingSoon} 
        onClose={() => setShowComingSoon(false)} 
      />
    </div>
  );
};

export default MissionSync;
