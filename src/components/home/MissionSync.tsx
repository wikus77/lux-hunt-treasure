// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX v12 (22/01/2026): ALL NATIVE LISTENERS - fixes "first pull doesn't work" on iOS
import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Logo M1 ufficiale
const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80; // px to trigger refresh
const MAX_PULL = 120; // max pull distance

// 🔧 DEBUG PTR - Set to true to enable debug logging (remove for production)
const DEBUG_PTR = true;
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

export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children }) => {
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
  
  // Keep onRefresh ref updated
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  
  // Keep pullDistanceRef in sync for touchend check
  useEffect(() => { pullDistanceRef.current = pullDistance; }, [pullDistance]);

  // 🔧 FIX v12: Use useLayoutEffect to find scrollParent BEFORE paint
  useLayoutEffect(() => {
    if (containerRef.current) {
      scrollParentRef.current = findScrollParent(containerRef.current);
      logPTR('MOUNT: container=', containerRef.current?.tagName, 'scrollParent=', scrollParentRef.current?.tagName);
    }
  }, []);

  // 🔧 FIX v12: ALL NATIVE LISTENERS in single useEffect
  // This ensures touchstart, touchmove, touchend are all registered together
  // and share the same refs without closure issues
  useEffect(() => {
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
      // ============================================
      const handleTouchStart = (e: TouchEvent) => {
        if (isRefreshingRef.current) {
          logPTR('touchstart: BLOCKED (refreshing)');
          return;
        }
        
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        const isAtTop = scrollTop <= 1;
        
        logPTR('touchstart: scrollTop=', scrollTop, 'isAtTop=', isAtTop, 'target=', (e.target as HTMLElement)?.tagName);
        
        if (isAtTop) {
          startYRef.current = e.touches[0].clientY;
          isPullingRef.current = true;
          setIsPulling(true);
          logPTR('touchstart: PULL READY ✓');
        }
      };
      
      // ============================================
      // NATIVE TOUCHMOVE (with passive: false)
      // ============================================
      const handleTouchMove = (e: TouchEvent) => {
        if (!isPullingRef.current) return;
        if (isRefreshingRef.current) return;
        
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;
        
        const scrollParent = scrollParentRef.current || container;
        const scrollTop = scrollParent.scrollTop;
        
        logPTR('touchmove: deltaY=', deltaY.toFixed(1), 'scrollTop=', scrollTop, 'isPulling=', isPullingRef.current);
        
        if (deltaY > 0 && scrollTop <= 1) {
          // User is pulling DOWN at top → PULL-TO-REFRESH
          // CRITICAL: preventDefault to stop browser scroll/overscroll
          e.preventDefault();
          
          const resistance = 0.5;
          const newPull = Math.min(deltaY * resistance, MAX_PULL);
          pullDistanceRef.current = newPull;
          setPullDistance(newPull);
          
          logPTR('touchmove: PULLING', newPull.toFixed(1), 'px, preventDefault CALLED ✓');
        } else if (deltaY < -10) {
          // User is scrolling DOWN (viewing content) → cancel pull
          logPTR('touchmove: Scrolling down, canceling pull');
          isPullingRef.current = false;
          setIsPulling(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      };
      
      // ============================================
      // NATIVE TOUCHEND
      // ============================================
      const handleTouchEnd = async () => {
        logPTR('touchend: isPulling=', isPullingRef.current, 'pullDistance=', pullDistanceRef.current);
        
        if (!isPullingRef.current) return;
        
        isPullingRef.current = false;
        setIsPulling(false);
        
        const currentPull = pullDistanceRef.current;
        
        if (currentPull >= PULL_THRESHOLD && !isRefreshingRef.current) {
          logPTR('touchend: TRIGGERING REFRESH ✓');
          
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
          logPTR('touchend: Release without refresh (pull=', currentPull, ')');
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      };
      
      // ============================================
      // NATIVE TOUCHCANCEL
      // ============================================
      const handleTouchCancel = () => {
        logPTR('touchcancel: Resetting state');
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
        pullDistanceRef.current = 0;
      };
      
      // ============================================
      // SCROLL LISTENER (for isAtTop tracking)
      // ============================================
      const scrollParent = scrollParentRef.current;
      const handleScroll = () => {
        // Only used for debugging, refs handle actual logic
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
  }, []); // Empty deps - attach once on mount

  // Safety reset on visibility/blur
  useEffect(() => {
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
  }, []);

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
