// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX v12 (22/01/2026): ALL NATIVE LISTENERS - fixes "first pull doesn't work" on iOS
import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Logo M1 ufficiale
const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  /** 🔧 A/B TEST 25/01/2026: Disable PTR on iOS native to isolate ghost refresh cause */
  disabled?: boolean;
}

// 🔧 FIX 25/01/2026: True PTR requires deliberate LONG PULL + RELEASE
// No refresh on tap, no refresh on micro-movements
const PULL_THRESHOLD = 90; // pullDistance to trigger refresh (deltaY * 0.5)
const MAX_PULL = 130; // max visual pull distance
const ARM_DELTA = 35; // deltaY required to ARM pull state (must drag down this far)
const MIN_HOLD_MS = 250; // must HOLD pulled state for this long before release triggers
const TAP_MAX_DELTA = 15; // if total deltaY < this on touchend, it's a tap - ignore
const MOMENTUM_LOCKOUT_MS = 200; // no PTR if scroll happened within this time

// 🔧 DEBUG PTR - DISABLED for production release
const DEBUG_PTR = false;
const logPTR = (...args: unknown[]) => DEBUG_PTR && console.log('[MissionSync PTR]', ...args);

/**
 * Find the actual scroll container (parent <main> with overflowY: auto)
 */
const findScrollParent = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null;
  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return parent;
    }
    if (parent.tagName === 'MAIN') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
};

export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children, disabled = false }) => {
  // 🔧 FIX 25/01/2026: ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN
  // React requires consistent hook calls across renders
  
  // State for React re-renders (visual updates)
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  // Refs for values needed in native event listeners (avoids stale closures)
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const listenersAttachedRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  // 🔧 FIX 25/01/2026: Track last scroll time for momentum lockout
  const lastScrollTimeRef = useRef(0);
  // 🔧 FIX 25/01/2026: Track when PTR was armed (for hold time validation)
  const armTimeRef = useRef(0);
  // 🔧 FIX 25/01/2026: Track max deltaY during gesture (for tap detection)
  const maxDeltaYRef = useRef(0);
  
  // Keep onRefresh ref updated
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  
  // Keep pullDistanceRef in sync for touchend check
  useEffect(() => { pullDistanceRef.current = pullDistance; }, [pullDistance]);

  // 🔧 FIX v12: Use useLayoutEffect to find scrollParent BEFORE paint
  useLayoutEffect(() => {
    // 🔧 FIX 25/01/2026: Skip if disabled
    if (disabled) return;
    if (containerRef.current) {
      scrollParentRef.current = findScrollParent(containerRef.current);
      logPTR('MOUNT: container=', containerRef.current?.tagName, 'scrollParent=', scrollParentRef.current?.tagName);
    }
  }, [disabled]);

  // 🔧 FIX v12: ALL NATIVE LISTENERS in single useEffect
  // This ensures touchstart, touchmove, touchend are all registered together
  // and share the same refs without closure issues
  useEffect(() => {
    // 🔧 FIX 25/01/2026: Skip listener attachment if disabled (iOS native)
    if (disabled) {
      logPTR('SKIP: PTR disabled (iOS native wrapped)');
      return;
    }
    
    const container = containerRef.current;
    if (!container) {
      logPTR('WARN: container not ready');
      return;
    }
    
    // Prevent double-attach
    if (listenersAttachedRef.current) return;
    
    // Wait for scrollParent with RAF retry (max 10 frames)
    let frameCount = 0;
    const maxFrames = 10;
    
    const tryAttachListeners = () => {
      frameCount++;
      
      if (!scrollParentRef.current) {
        scrollParentRef.current = findScrollParent(container);
      }
      
      if (!scrollParentRef.current && frameCount < maxFrames) {
        requestAnimationFrame(tryAttachListeners);
        return;
      }
      
      logPTR('SETUP: Attaching listeners after', frameCount, 'frames, scrollParent=', scrollParentRef.current?.tagName);
      
      // ============================================
      // NATIVE TOUCHSTART
      // 🔧 FIX 25/01/2026: Stricter checks:
      // - scrollTop must be EXACTLY 0
      // - momentum lockout: no recent scroll
      // - defer isPulling activation to touchmove
      // ============================================
      const handleTouchStart = (e: TouchEvent) => {
        if (isRefreshingRef.current) {
          logPTR('touchstart: BLOCKED (refreshing)');
          return;
        }
        
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        // 🔧 FIX: Require scrollTop === 0 (not <= 1) to prevent momentum false positives
        const isAtTop = scrollTop === 0;
        
        // 🔧 FIX 25/01/2026: Momentum lockout - don't arm if scroll happened recently
        const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
        const isMomentumActive = timeSinceScroll < MOMENTUM_LOCKOUT_MS;
        
        logPTR('touchstart: scrollTop=', scrollTop, 'isAtTop=', isAtTop, 'timeSinceScroll=', timeSinceScroll, 'momentum=', isMomentumActive);
        
        // 🔧 FIX: Only record start position if at top AND no momentum
        // Activation happens in touchmove after confirming deliberate downward gesture
        if (isAtTop && !isMomentumActive) {
          startYRef.current = e.touches[0].clientY;
          armTimeRef.current = 0; // Reset arm time
          maxDeltaYRef.current = 0; // Reset max delta tracking
          // NOTE: isPullingRef NOT set here - will be set in touchmove after ARM_DELTA
          logPTR('touchstart: POTENTIAL PULL (waiting for touchmove validation)');
        } else {
          // Not at top or momentum active - clear all state
          startYRef.current = 0;
          armTimeRef.current = 0;
          maxDeltaYRef.current = 0;
          if (isMomentumActive) {
            logPTR('touchstart: BLOCKED (momentum lockout)');
          }
        }
      };
      
      // ============================================
      // NATIVE TOUCHMOVE (with passive: false)
      // 🔧 FIX 25/01/2026: True PTR - arm only after ARM_DELTA, track hold time
      // ============================================
      const handleTouchMove = (e: TouchEvent) => {
        if (isRefreshingRef.current) return;
        
        // 🔧 FIX: If startY is 0, we didn't start at top - ignore
        if (startYRef.current === 0) return;
        
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;
        
        // Track max deltaY for tap detection
        if (deltaY > maxDeltaYRef.current) {
          maxDeltaYRef.current = deltaY;
        }
        
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        
        logPTR('touchmove: deltaY=', deltaY.toFixed(1), 'scrollTop=', scrollTop, 'isPulling=', isPullingRef.current, 'maxDelta=', maxDeltaYRef.current.toFixed(1));
        
        // 🔧 FIX: Require scrollTop === 0 AND deltaY > ARM_DELTA to activate pull
        if (scrollTop === 0 && deltaY > ARM_DELTA) {
          // User is deliberately pulling DOWN at top → activate PULL-TO-REFRESH
          if (!isPullingRef.current) {
            // First activation - record arm time
            isPullingRef.current = true;
            armTimeRef.current = Date.now();
            setIsPulling(true);
            logPTR('touchmove: PULL ARMED at', armTimeRef.current);
          }
          
          // CRITICAL: preventDefault to stop browser scroll/overscroll
          e.preventDefault();
          
          const resistance = 0.5;
          const newPull = Math.min(deltaY * resistance, MAX_PULL);
          pullDistanceRef.current = newPull;
          setPullDistance(newPull);
          
          logPTR('touchmove: PULLING', newPull.toFixed(1), 'px');
        } else if (scrollTop > 0 || deltaY < -ARM_DELTA) {
          // 🔧 FIX: User scrolled away from top OR is scrolling up → cancel pull
          if (isPullingRef.current || startYRef.current !== 0) {
            logPTR('touchmove: DISARMING (scrollTop=', scrollTop, ', deltaY=', deltaY, ')');
            isPullingRef.current = false;
            armTimeRef.current = 0;
            setIsPulling(false);
            setPullDistance(0);
            pullDistanceRef.current = 0;
            startYRef.current = 0;
          }
        }
      };
      
      // ============================================
      // NATIVE TOUCHEND
      // 🔧 FIX 25/01/2026: True PTR - requires arm + hold time + threshold
      // NO refresh on tap or quick micro-swipes
      // ============================================
      const handleTouchEnd = async () => {
        const currentPull = pullDistanceRef.current;
        const wasArmed = isPullingRef.current;
        const armTime = armTimeRef.current;
        const maxDelta = maxDeltaYRef.current;
        const holdDuration = armTime > 0 ? Date.now() - armTime : 0;
        
        logPTR('touchend: armed=', wasArmed, 'pull=', currentPull.toFixed(1), 'maxDelta=', maxDelta.toFixed(1), 'holdTime=', holdDuration);
        
        // 🔧 FIX: Always reset ALL state on touchend
        startYRef.current = 0;
        armTimeRef.current = 0;
        maxDeltaYRef.current = 0;
        isPullingRef.current = false;
        setIsPulling(false);
        
        // 🔧 FIX: TAP DETECTION - if maxDelta was tiny, this was a tap, not a pull
        if (maxDelta < TAP_MAX_DELTA) {
          logPTR('touchend: TAP DETECTED (maxDelta < TAP_MAX_DELTA), ignoring');
          setPullDistance(0);
          pullDistanceRef.current = 0;
          return;
        }
        
        // 🔧 FIX: HOLD TIME VALIDATION - must have held for MIN_HOLD_MS
        if (holdDuration < MIN_HOLD_MS) {
          logPTR('touchend: HOLD TOO SHORT (', holdDuration, 'ms < ', MIN_HOLD_MS, 'ms), ignoring');
          setPullDistance(0);
          pullDistanceRef.current = 0;
          return;
        }
        
        // 🔧 FIX: PULL THRESHOLD - must have pulled far enough
        if (currentPull >= PULL_THRESHOLD && wasArmed && !isRefreshingRef.current) {
          logPTR('touchend: TRIGGERING REFRESH ✓ (armed + held + threshold met)');
          
          isRefreshingRef.current = true;
          setIsRefreshing(true);
          setPullDistance(60); // Hold at indicator
          
          try {
            await onRefreshRef.current();
            logPTR('touchend: Refresh complete');
          } catch (error) {
            console.error('[MissionSync] Refresh error:', error);
          } finally {
            isRefreshingRef.current = false;
            setIsRefreshing(false);
            setPullDistance(0);
            pullDistanceRef.current = 0;
          }
        } else {
          logPTR('touchend: Release without refresh (conditions not met)');
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      };
      
      // ============================================
      // NATIVE TOUCHCANCEL
      // 🔧 FIX 25/01/2026: Reset ALL state
      // ============================================
      const handleTouchCancel = () => {
        logPTR('touchcancel: Resetting ALL state');
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
        pullDistanceRef.current = 0;
        startYRef.current = 0;
        armTimeRef.current = 0;
        maxDeltaYRef.current = 0;
      };
      
      // ============================================
      // SCROLL LISTENER (for momentum lockout tracking)
      // 🔧 FIX 25/01/2026: Track scroll time to prevent PTR during momentum
      // ============================================
      const scrollParent = scrollParentRef.current;
      const handleScroll = () => {
        lastScrollTimeRef.current = Date.now();
        logPTR('scroll: updated lastScrollTime');
      };
      
      // ATTACH ALL LISTENERS
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false }); // CRITICAL
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
      
      if (scrollParent) {
        scrollParent.addEventListener('scroll', handleScroll, { passive: true });
      }
      
      listenersAttachedRef.current = true;
      logPTR('SETUP: All listeners attached ✓');
      
      // CLEANUP
      return () => {
        logPTR('CLEANUP: Removing listeners');
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchCancel);
        
        if (scrollParent) {
          scrollParent.removeEventListener('scroll', handleScroll);
        }
        
        listenersAttachedRef.current = false;
      };
    };
    
    // Start attachment process
    requestAnimationFrame(tryAttachListeners);
  }, [disabled]); // 🔧 FIX 25/01/2026: Re-run when disabled changes

  // Safety reset on visibility/blur
  useEffect(() => {
    // 🔧 FIX 25/01/2026: Skip if disabled
    if (disabled) return;
    
    const forceReset = () => {
      logPTR('Force reset (visibility/blur)');
      isPullingRef.current = false;
      setIsPulling(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
    };

    const onVisibilityChange = () => { if (document.hidden) forceReset(); };
    const onBlur = () => forceReset();
    const onPageHide = () => forceReset();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [disabled]);

  // Watchdog: reset stuck transforms
  useEffect(() => {
    if (pullDistance > 0 && !isRefreshing && !isPulling) {
      const watchdog = setTimeout(() => {
        logPTR('Watchdog: resetting stuck transform');
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }, 500);
      return () => clearTimeout(watchdog);
    }
  }, [pullDistance, isRefreshing, isPulling]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;
  const shouldBlockBrowserTouch = isPulling && pullDistance > 0;

  // 🔧 FIX 25/01/2026: Conditional return AFTER all hooks (React rules compliance)
  // When disabled, render children directly without PTR wrapper
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ 
        touchAction: shouldBlockBrowserTouch ? 'none' : 'pan-y',
      }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="absolute left-0 right-0 flex flex-col items-center justify-center z-[200] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: Math.min(pullDistance, MAX_PULL) - 60
            }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.2 }}
            style={{ top: 0 }}
          >
            <motion.div
              className={`
                flex items-center justify-center rounded-full overflow-hidden
                ${shouldTrigger || isRefreshing ? 'ring-2 ring-cyan-400/60' : ''}
                transition-all duration-200
              `}
              animate={{ 
                scale: isRefreshing ? [1, 1.1, 1] : shouldTrigger ? 1.1 : 0.9 + progress * 0.2,
                rotate: isRefreshing ? 360 : 0
              }}
              transition={{ 
                scale: isRefreshing 
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } 
                  : { duration: 0.2 },
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
                  filter: shouldTrigger || isRefreshing 
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
          exit={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ 
            willChange: isPulling ? 'transform' : 'auto',
          }}
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
