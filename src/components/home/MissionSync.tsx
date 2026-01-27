// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX v8.2 (27/01/2026): Use ref for pull value to avoid stale state in touchEnd
// Bug: scroll up slowly from bottom → refresh triggers → FIXED
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

// Thresholds
const PULL_TRIGGER = 80; // Pull this far to trigger refresh
const MAX_PULL = 120; // Max visual distance
const MIN_DELTA_FOR_PTR = 30; // Minimum delta Y to consider it a PTR gesture (not small movement)

export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullRef = useRef(0); // 🔧 FIX: Use ref for pull value in touchEnd
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const touchStartedAtTopRef = useRef(false); // 🔧 FIX: Track if touch STARTED at top
  
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    if (disabled) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Find scroll parent
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
      // Reset all tracking
      startYRef.current = null;
      pullRef.current = 0;
      touchStartedAtTopRef.current = false;
      
      if (refreshingRef.current) return;
      
      // CRITICAL: Only track if ALREADY at top when touch starts
      // This prevents triggering when scrolling up reaches top
      const scrollTop = scrollParent.scrollTop;
      if (scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        touchStartedAtTopRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (startYRef.current === null) return;
      if (!touchStartedAtTopRef.current) return; // 🔧 FIX: Must have started at top
      
      // If user scrolled away from top, cancel PTR tracking
      if (scrollParent.scrollTop > 5) {
        startYRef.current = null;
        pullRef.current = 0;
        setPull(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const delta = currentY - startYRef.current;

      // Only track DELIBERATE downward pull (not tiny movements)
      if (delta <= MIN_DELTA_FOR_PTR) {
        // Small movement - could be scroll attempt, don't show PTR UI
        pullRef.current = 0;
        setPull(0);
        return;
      }

      // Calculate pull with resistance
      const pullDist = Math.min((delta - MIN_DELTA_FOR_PTR) * 0.5, MAX_PULL);
      pullRef.current = pullDist;
      setPull(pullDist);

      // Prevent native scroll only when visibly pulling
      if (pullDist > 5) {
        e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (refreshingRef.current) return;
      
      // 🔧 FIX: Use ref value, not state (which can be stale)
      const currentPull = pullRef.current;
      const wasAtTop = touchStartedAtTopRef.current;
      
      // Reset tracking
      startYRef.current = null;
      touchStartedAtTopRef.current = false;

      // Only refresh if: touch started at top AND pulled enough
      if (wasAtTop && currentPull >= PULL_TRIGGER) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(60); // Hold position during refresh
        pullRef.current = 60;
        
        try {
          await onRefreshRef.current();
        } catch (err) {
          console.error('[MissionSync] Error:', err);
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
          pullRef.current = 0;
        }
      } else {
        // Reset
        setPull(0);
        pullRef.current = 0;
      }
    };

    const onTouchCancel = () => {
      startYRef.current = null;
      touchStartedAtTopRef.current = false;
      if (!refreshingRef.current) {
        setPull(0);
        pullRef.current = 0;
      }
    };

    // Attach listeners
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
  }, [disabled]); // 🔧 FIX: Removed pull from deps - using ref now

  if (disabled) {
    return <>{children}</>;
  }

  const progress = Math.min(pull / PULL_TRIGGER, 1);
  const isArmed = pull >= PULL_TRIGGER;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Pull indicator */}
      <AnimatePresence>
        {(pull > 20 || refreshing) && (
          <motion.div
            className="absolute left-0 right-0 flex items-center justify-center z-[200] pointer-events-none"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: Math.min(pull, MAX_PULL) - 40 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.1 }}
            style={{ top: 0 }}
          >
            <motion.div
              className={`rounded-full ${isArmed || refreshing ? 'ring-2 ring-cyan-400/60' : ''}`}
              animate={{ 
                scale: refreshing ? [1, 1.1, 1] : (0.8 + progress * 0.3),
                rotate: refreshing ? 360 : 0
              }}
              transition={{ 
                scale: refreshing ? { duration: 0.6, repeat: Infinity } : { duration: 0.1 },
                rotate: refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }
              }}
            >
              <img 
                src={M1_LOGO_URL} 
                alt="M1" 
                className="w-10 h-10 object-contain"
                style={{
                  filter: isArmed || refreshing ? 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.7))' : 'none'
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
    </div>
  );
};

export default MissionSync;
