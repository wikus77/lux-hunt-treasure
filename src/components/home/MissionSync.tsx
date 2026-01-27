// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX v8 (27/01/2026): SIMPLIFIED PTR - No complex state machine
// Just: At top of scroll + pull down + release = refresh
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

export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  
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
      // Always reset on new touch
      if (refreshingRef.current) return;
      
      // Only track if at top
      if (scrollParent.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
      } else {
        startYRef.current = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (startYRef.current === null) return;
      
      // Check still at top
      if (scrollParent.scrollTop > 0) {
        startYRef.current = null;
        setPull(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const delta = currentY - startYRef.current;

      // Only track downward pull
      if (delta <= 0) {
        setPull(0);
        return;
      }

      // Calculate pull with resistance
      const pullDist = Math.min(delta * 0.5, MAX_PULL);
      setPull(pullDist);

      // Prevent native scroll only when pulling
      if (pullDist > 10) {
        e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (refreshingRef.current) return;
      
      const currentPull = pull;
      startYRef.current = null;

      // Check if should refresh
      if (currentPull >= PULL_TRIGGER) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(60); // Hold position during refresh
        
        try {
          await onRefreshRef.current();
        } catch (err) {
          console.error('[MissionSync] Error:', err);
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
        }
      } else {
        // Reset
        setPull(0);
      }
    };

    const onTouchCancel = () => {
      startYRef.current = null;
      if (!refreshingRef.current) {
        setPull(0);
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
  }, [disabled, pull]); // Include pull in deps so touchend sees current value

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
