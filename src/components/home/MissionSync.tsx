// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX v7 (27/01/2026): COMPLETE REWRITE - HOLD → PULL → RELEASE
// NO ghost triggers, NO single-tap refresh, PROPER iOS bounce support
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Logo M1 ufficiale
const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

// 🔧 v7: STRICT PTR CONSTANTS
const HOLD_DURATION_MS = 200; // Must HOLD finger down for this long before PTR activates
const PULL_THRESHOLD = 80; // Must pull this far to trigger refresh
const MAX_PULL = 130; // Max visual pull distance
const MIN_PULL_TO_ARM = 50; // Must pull at least this far to "arm" the refresh

// Debug flag (disable for production)
const DEBUG_PTR = false;
const log = (...args: unknown[]) => DEBUG_PTR && console.log('[PTR v7]', ...args);

/**
 * MissionSync v7 - HOLD → PULL → RELEASE Pull-to-Refresh
 * 
 * State machine:
 * - idle: waiting for touch
 * - holding: finger down, counting hold time
 * - ready: hold time passed, can start pulling
 * - pulling: actively pulling down (visual feedback)
 * - armed: pulled past threshold, will refresh on release
 * - refreshing: refresh in progress
 * 
 * Key behaviors:
 * - Single tap = NO refresh (hold time not met)
 * - Quick swipe = NO refresh (hold time not met)
 * - Must HOLD → PULL → RELEASE to trigger refresh
 * - iOS bounce works normally when not in pulling state
 */
export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  // Visual state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  // Refs (for event listeners to avoid stale closures)
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<'idle' | 'holding' | 'ready' | 'pulling' | 'armed' | 'refreshing'>('idle');
  const holdTimerRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  // Keep onRefresh ref updated
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  // Main effect - attach touch listeners
  useEffect(() => {
    if (disabled) {
      log('DISABLED - not attaching listeners');
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Find scroll parent (main element with overflow-y: auto)
    const findScrollParent = (el: HTMLElement | null): HTMLElement => {
      if (!el) return document.documentElement;
      let parent = el.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || parent.tagName === 'MAIN') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return document.documentElement;
    };

    const scrollParent = findScrollParent(container);
    log('Scroll parent:', scrollParent.tagName);

    // ========================================
    // TOUCHSTART - Start hold timer
    // ========================================
    const handleTouchStart = (e: TouchEvent) => {
      // Block if refreshing
      if (stateRef.current === 'refreshing') {
        log('BLOCKED - refreshing');
        return;
      }

      // Check if at top of scroll
      const scrollTop = scrollParent.scrollTop;
      if (scrollTop > 0) {
        log('NOT AT TOP - scrollTop:', scrollTop);
        stateRef.current = 'idle';
        return;
      }

      // Start hold timer
      stateRef.current = 'holding';
      startYRef.current = e.touches[0].clientY;
      log('TOUCHSTART - holding, startY:', startYRef.current);

      // Clear any existing timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }

      // Set hold timer - after this, PTR becomes "ready"
      holdTimerRef.current = window.setTimeout(() => {
        if (stateRef.current === 'holding') {
          stateRef.current = 'ready';
          log('HOLD COMPLETE - ready for pull');
        }
      }, HOLD_DURATION_MS);
    };

    // ========================================
    // TOUCHMOVE - Track pull (only if ready/pulling/armed)
    // ========================================
    const handleTouchMove = (e: TouchEvent) => {
      const state = stateRef.current;

      // If still in 'holding' state and user moves, check direction
      if (state === 'holding') {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;
        
        // If scrolling UP or sideways significantly, cancel hold
        if (deltaY < -10) {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          stateRef.current = 'idle';
          log('HOLD CANCELLED - scrolling up');
        }
        // Don't process further - let native scroll work
        return;
      }

      // If not ready/pulling/armed, ignore
      if (state !== 'ready' && state !== 'pulling' && state !== 'armed') {
        return;
      }

      // Check scrollTop again
      const scrollTop = scrollParent.scrollTop;
      if (scrollTop > 0) {
        // User scrolled away from top - reset
        stateRef.current = 'idle';
        setPullDistance(0);
        setIsPulling(false);
        setShowIndicator(false);
        pullDistanceRef.current = 0;
        log('SCROLL AWAY - reset');
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // If pulling up, cancel
      if (deltaY < 0) {
        stateRef.current = 'idle';
        setPullDistance(0);
        setIsPulling(false);
        setShowIndicator(false);
        pullDistanceRef.current = 0;
        log('PULL UP - reset');
        return;
      }

      // Calculate pull with resistance
      const resistance = 0.5;
      const pull = Math.min(deltaY * resistance, MAX_PULL);
      pullDistanceRef.current = pull;
      setPullDistance(pull);

      // State transitions based on pull distance
      if (pull >= PULL_THRESHOLD) {
        if (stateRef.current !== 'armed') {
          stateRef.current = 'armed';
          log('ARMED - ready to refresh on release');
        }
        setIsPulling(true);
        setShowIndicator(true);
        // Prevent browser overscroll ONLY when armed
        e.preventDefault();
      } else if (pull >= MIN_PULL_TO_ARM) {
        if (stateRef.current !== 'pulling') {
          stateRef.current = 'pulling';
          log('PULLING - visual feedback');
        }
        setIsPulling(true);
        setShowIndicator(true);
        // Prevent browser overscroll when visibly pulling
        e.preventDefault();
      } else {
        // Small movement - don't show indicator yet
        setShowIndicator(false);
      }
    };

    // ========================================
    // TOUCHEND - Trigger refresh if armed
    // ========================================
    const handleTouchEnd = async () => {
      // Clear hold timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      const state = stateRef.current;
      const pull = pullDistanceRef.current;
      log('TOUCHEND - state:', state, 'pull:', pull);

      // Reset visual state
      setIsPulling(false);
      
      // Check if should refresh
      if (state === 'armed' && pull >= PULL_THRESHOLD) {
        log('REFRESH TRIGGERED ✓');
        stateRef.current = 'refreshing';
        setIsRefreshing(true);
        setPullDistance(60); // Hold at indicator position

        try {
          await onRefreshRef.current();
          log('Refresh complete');
        } catch (err) {
          console.error('[MissionSync] Refresh error:', err);
        } finally {
          stateRef.current = 'idle';
          setIsRefreshing(false);
          setPullDistance(0);
          setShowIndicator(false);
          pullDistanceRef.current = 0;
        }
      } else {
        // Not armed or not pulled enough - reset
        log('NO REFRESH - conditions not met');
        stateRef.current = 'idle';
        setPullDistance(0);
        setShowIndicator(false);
        pullDistanceRef.current = 0;
      }
    };

    // ========================================
    // TOUCHCANCEL - Reset everything
    // ========================================
    const handleTouchCancel = () => {
      log('TOUCHCANCEL - reset');
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      stateRef.current = 'idle';
      setPullDistance(0);
      setIsPulling(false);
      setShowIndicator(false);
      pullDistanceRef.current = 0;
    };

    // Attach listeners
    // CRITICAL: touchmove with passive: false ONLY on the container
    // This allows iOS bounce on the scroll parent while we can preventDefault when pulling
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    log('Listeners attached');

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      log('Listeners removed');
    };
  }, [disabled]);

  // Render
  if (disabled) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const isArmed = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Pull indicator */}
      <AnimatePresence>
        {(showIndicator || isRefreshing) && (
          <motion.div
            className="absolute left-0 right-0 flex flex-col items-center justify-center z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: Math.min(pullDistance, MAX_PULL) - 50
            }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.15 }}
            style={{ top: 0 }}
          >
            <motion.div
              className={`
                flex items-center justify-center rounded-full overflow-hidden
                ${isArmed || isRefreshing ? 'ring-2 ring-cyan-400/60' : ''}
                transition-all duration-150
              `}
              animate={{ 
                scale: isRefreshing ? [1, 1.1, 1] : isArmed ? 1.1 : 0.9 + progress * 0.2,
                rotate: isRefreshing ? 360 : 0
              }}
              transition={{ 
                scale: isRefreshing 
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } 
                  : { duration: 0.15 },
                rotate: isRefreshing 
                  ? { duration: 1.5, repeat: Infinity, ease: 'linear' } 
                  : { duration: 0 }
              }}
            >
              <img 
                src={M1_LOGO_URL} 
                alt="M1" 
                className="w-12 h-12 object-contain"
                style={{
                  filter: isArmed || isRefreshing 
                    ? 'drop-shadow(0 0 10px rgba(0, 209, 255, 0.8))' 
                    : 'none'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull offset */}
      {(pullDistance > 0 || isRefreshing) ? (
        <motion.div
          key="pull-content"
          initial={{ y: 0 }}
          animate={{ y: pullDistance }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ willChange: isPulling ? 'transform' : 'auto' }}
        >
          {children}
        </motion.div>
      ) : (
        <div key="idle-content" data-idle-content="true">{children}</div>
      )}
    </div>
  );
};

export default MissionSync;
