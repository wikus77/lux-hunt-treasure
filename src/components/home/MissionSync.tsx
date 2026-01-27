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

// 🔧 FIX 27/01/2026 v6: STRICTER PTR - PRESS-DELAY + HIGHER THRESHOLDS
// States: idle → waiting → tracking → armed → refreshing
// NO refresh on touchstart, NO refresh on tap, NO ghost triggers
// REQUIRES: pressDelay before tracking, higher arm threshold, release-only gate
const PULL_THRESHOLD = 90; // pullDistance to trigger refresh (must pull this far)
const MAX_PULL = 140; // max visual pull distance
const ARM_DELTA = 70; // deltaY required to ARM (must drag down at least this far) - INCREASED from 50
const MIN_HOLD_MS = 250; // must HOLD armed state for this long before release works - REDUCED slightly
const TAP_DURATION_MS = 150; // if touch duration < this, it's a tap - ALWAYS ignore
const TAP_MAX_DELTA = 25; // if total deltaY < this, it's a tap - ALWAYS ignore
const MOMENTUM_LOCKOUT_MS = 300; // no PTR if scroll happened within this time - INCREASED
// 🔧 NEW: Press delay before PTR can start tracking (prevents ghost triggers)
const PRESS_DELAY_MS = 150; // must hold finger down for this long before PTR tracking begins

// PTR States - 🔧 v6: Added 'waiting' state for pressDelay
type PTRState = 'idle' | 'waiting' | 'tracking' | 'armed' | 'refreshing';

// 🔧 KILL SWITCH: This is the ONLY function that can trigger refresh
// All conditions must be met or refresh is BLOCKED
const canCommitRefresh = (
  state: PTRState,
  pullDistance: number,
  holdDuration: number,
  touchDuration: number,
  maxDelta: number,
  scrollTop: number
): boolean => {
  // HARD BLOCKS
  if (state !== 'armed') return false;
  if (scrollTop !== 0) return false;
  if (pullDistance < PULL_THRESHOLD) return false;
  if (holdDuration < MIN_HOLD_MS) return false;
  if (touchDuration < TAP_DURATION_MS) return false;
  if (maxDelta < TAP_MAX_DELTA) return false;
  return true;
};

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
  // 🔧 FIX 27/01/2026 v6: STATE MACHINE refs (with pressDelay support)
  const ptrStateRef = useRef<PTRState>('idle');
  const lastScrollTimeRef = useRef(0);
  const armTimeRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const maxDeltaYRef = useRef(0);
  const pressDelayTimerRef = useRef<number | null>(null); // Timer for pressDelay
  
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
      // 🔧 v6: STATE MACHINE: touchstart → 'waiting' (with pressDelay)
      // Only transitions to 'tracking' after PRESS_DELAY_MS
      // NO refresh can EVER happen from touchstart
      // ============================================
      const handleTouchStart = (e: TouchEvent) => {
        // Clear any existing pressDelay timer
        if (pressDelayTimerRef.current) {
          clearTimeout(pressDelayTimerRef.current);
          pressDelayTimerRef.current = null;
        }
        
        // BLOCK if already refreshing
        if (ptrStateRef.current === 'refreshing') {
          logPTR('touchstart: BLOCKED (refreshing)');
          return;
        }
        
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        const isAtTop = scrollTop === 0;
        const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
        const isMomentumActive = timeSinceScroll < MOMENTUM_LOCKOUT_MS;
        
        logPTR('touchstart: scrollTop=', scrollTop, 'isAtTop=', isAtTop, 'momentum=', isMomentumActive, 'state=', ptrStateRef.current);
        
        // 🔧 v6: Go to WAITING state first (not tracking!)
        // PTR tracking only begins after pressDelay
        if (isAtTop && !isMomentumActive) {
          ptrStateRef.current = 'waiting';
          startYRef.current = e.touches[0].clientY;
          touchStartTimeRef.current = Date.now();
          armTimeRef.current = 0;
          maxDeltaYRef.current = 0;
          isPullingRef.current = false;
          logPTR('touchstart: state → waiting (pressDelay starts)');
          
          // 🔧 v6: Set timer to transition to tracking after pressDelay
          pressDelayTimerRef.current = window.setTimeout(() => {
            if (ptrStateRef.current === 'waiting') {
              ptrStateRef.current = 'tracking';
              logPTR('pressDelay: state → tracking (ready for PTR)');
            }
          }, PRESS_DELAY_MS);
        } else {
          // Reset to IDLE
          ptrStateRef.current = 'idle';
          startYRef.current = 0;
          touchStartTimeRef.current = 0;
          armTimeRef.current = 0;
          maxDeltaYRef.current = 0;
          logPTR('touchstart: state → idle (not at top or momentum)');
        }
      };
      
      // ============================================
      // NATIVE TOUCHMOVE (with passive: false)
      // 🔧 v6: STATE MACHINE: tracking → armed (only if deltaY > ARM_DELTA)
      // CRITICAL: Only preventDefault when ARMED to allow iOS bounce when not pulling
      // ============================================
      const handleTouchMove = (e: TouchEvent) => {
        // BLOCK if refreshing, idle, or waiting (pressDelay not elapsed)
        if (ptrStateRef.current === 'refreshing') return;
        if (ptrStateRef.current === 'idle') return;
        if (startYRef.current === 0) return;
        
        // 🔧 v6: If still in 'waiting', check if we should cancel (user is scrolling)
        // This allows normal scroll to work during pressDelay
        if (ptrStateRef.current === 'waiting') {
          const currentY = e.touches[0].clientY;
          const deltaY = currentY - startYRef.current;
          
          // If user scrolls UP during waiting, cancel PTR entirely
          if (deltaY < -10) {
            if (pressDelayTimerRef.current) {
              clearTimeout(pressDelayTimerRef.current);
              pressDelayTimerRef.current = null;
            }
            ptrStateRef.current = 'idle';
            startYRef.current = 0;
            logPTR('touchmove: waiting → idle (scrolled up, PTR cancelled)');
          }
          // Otherwise, let native scroll/bounce work - don't preventDefault
          return;
        }
        
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;
        
        // Track max deltaY for tap detection
        if (deltaY > maxDeltaYRef.current) {
          maxDeltaYRef.current = deltaY;
        }
        
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        
        logPTR('touchmove: state=', ptrStateRef.current, 'deltaY=', deltaY.toFixed(1), 'scrollTop=', scrollTop, 'maxDelta=', maxDeltaYRef.current.toFixed(1));
        
        // Check if user scrolled away from top or is scrolling up
        if (scrollTop > 0 || deltaY < -20) {
          // DISARM and reset to idle
          logPTR('touchmove: DISARM → idle (scrollTop=', scrollTop, ', deltaY=', deltaY, ')');
          ptrStateRef.current = 'idle';
          isPullingRef.current = false;
          armTimeRef.current = 0;
          setIsPulling(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
          startYRef.current = 0;
          return;
        }
        
        // Only process if at top AND delta exceeds ARM threshold
        if (scrollTop === 0 && deltaY > ARM_DELTA) {
          // Transition: tracking → armed
          if (ptrStateRef.current === 'tracking') {
            ptrStateRef.current = 'armed';
            armTimeRef.current = Date.now();
            isPullingRef.current = true;
            setIsPulling(true);
            logPTR('touchmove: state → armed at', armTimeRef.current);
          }
          
          // 🔧 v6: Only preventDefault when ARMED (allows iOS bounce when not pulling)
          if (ptrStateRef.current === 'armed') {
            e.preventDefault(); // Block browser overscroll ONLY when actually pulling
            const resistance = 0.5;
            const newPull = Math.min(deltaY * resistance, MAX_PULL);
            pullDistanceRef.current = newPull;
            setPullDistance(newPull);
            logPTR('touchmove: pulling', newPull.toFixed(1), 'px');
          }
        }
        // 🔧 v6: If tracking but delta < ARM_DELTA, don't preventDefault
        // This allows iOS native bounce to work when user is just scrolling
      };
      
      // ============================================
      // NATIVE TOUCHEND
      // 🔧 STATE MACHINE: ONLY place refresh can happen (RELEASE-ONLY GATE)
      // Uses KILL SWITCH to validate ALL conditions
      // ============================================
      const handleTouchEnd = async () => {
        // 🔧 v6: Clear pressDelay timer
        if (pressDelayTimerRef.current) {
          clearTimeout(pressDelayTimerRef.current);
          pressDelayTimerRef.current = null;
        }
        
        const currentPull = pullDistanceRef.current;
        const currentState = ptrStateRef.current;
        const maxDelta = maxDeltaYRef.current;
        const touchDuration = touchStartTimeRef.current > 0 ? Date.now() - touchStartTimeRef.current : 0;
        const holdDuration = armTimeRef.current > 0 ? Date.now() - armTimeRef.current : 0;
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        
        logPTR('touchend: state=', currentState, 'pull=', currentPull.toFixed(1), 'maxDelta=', maxDelta.toFixed(1), 
               'touchDuration=', touchDuration, 'holdDuration=', holdDuration, 'scrollTop=', scrollTop);
        
        // 🔧 ALWAYS reset state first (prevents any re-trigger)
        const wasState = ptrStateRef.current;
        ptrStateRef.current = 'idle';
        startYRef.current = 0;
        touchStartTimeRef.current = 0;
        armTimeRef.current = 0;
        maxDeltaYRef.current = 0;
        isPullingRef.current = false;
        setIsPulling(false);
        
        // 🔧 KILL SWITCH: Use centralized validation
        const canRefresh = canCommitRefresh(
          wasState,
          currentPull,
          holdDuration,
          touchDuration,
          maxDelta,
          scrollTop
        );
        
        if (!canRefresh) {
          logPTR('touchend: KILL SWITCH BLOCKED refresh. Conditions:', {
            state: wasState,
            pull: currentPull,
            holdDuration,
            touchDuration,
            maxDelta,
            scrollTop,
            required: { 
              state: 'armed', 
              pull: `>=${PULL_THRESHOLD}`, 
              hold: `>=${MIN_HOLD_MS}`,
              touch: `>=${TAP_DURATION_MS}`,
              delta: `>=${TAP_MAX_DELTA}`
            }
          });
          setPullDistance(0);
          pullDistanceRef.current = 0;
          return;
        }
        
        // 🔧 PASSED KILL SWITCH - trigger refresh
        logPTR('touchend: KILL SWITCH PASSED ✓ → TRIGGERING REFRESH');
        
        ptrStateRef.current = 'refreshing';
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(60);
        
        try {
          await onRefreshRef.current();
          logPTR('touchend: Refresh complete');
        } catch (error) {
          console.error('[MissionSync] Refresh error:', error);
        } finally {
          ptrStateRef.current = 'idle';
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      };
      
      // ============================================
      // NATIVE TOUCHCANCEL
      // 🔧 STATE MACHINE: Reset to idle
      // ============================================
      const handleTouchCancel = () => {
        // 🔧 v6: Clear pressDelay timer
        if (pressDelayTimerRef.current) {
          clearTimeout(pressDelayTimerRef.current);
          pressDelayTimerRef.current = null;
        }
        
        logPTR('touchcancel: state → idle');
        ptrStateRef.current = 'idle';
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
        pullDistanceRef.current = 0;
        startYRef.current = 0;
        touchStartTimeRef.current = 0;
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
