// © 2025 M1SSION™ – Mission Sync Pull-to-Refresh
// 🔧 FIX v2: Removed nested scroll container, added iOS safety handlers
// 🔧 FIX v9 (22/01/2026): Fixed scroll detection - now checks parent <main> scroll container
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Logo M1 ufficiale
const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

interface MissionSyncProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80; // px to trigger refresh
const MAX_PULL = 120; // max pull distance

/**
 * 🔧 FIX v9: Find the actual scroll container (parent <main> with overflowY: auto)
 * The scroll is on GlobalLayout's <main>, not on MissionSync's wrapper
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
      return parent; // GlobalLayout's main is the scroll container
    }
    parent = parent.parentElement;
  }
  return document.documentElement; // Fallback to document
};

export const MissionSync: React.FC<MissionSyncProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  // 🔧 FIX v11: Use refs for values needed in native event listeners
  // This prevents stale closure issues that caused "first pull doesn't work"
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => { isPullingRef.current = isPulling; }, [isPulling]);
  useEffect(() => { isRefreshingRef.current = isRefreshing; }, [isRefreshing]);

  // 🔧 FIX v11: Find scroll parent AND setup scroll monitoring in SAME useEffect
  // This ensures scroll listener is added AFTER scrollParentRef is set
  useEffect(() => {
    // Find scroll parent
    scrollParentRef.current = findScrollParent(containerRef.current);
    console.log('[MissionSync] Scroll parent found:', scrollParentRef.current?.tagName);
    
    // Setup scroll monitoring
    const scrollParent = scrollParentRef.current;
    if (!scrollParent) return;
    
    const handleScroll = () => {
      const atTop = scrollParent.scrollTop <= 1;
      setIsAtTop(atTop);
    };
    
    scrollParent.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => scrollParent.removeEventListener('scroll', handleScroll);
  }, []); // Run once on mount
  
  // 🔧 FIX v11: Native touchmove listener - ADDED ONCE, uses refs to avoid stale closure
  // This fixes "first pull doesn't work" bug caused by listener having stale isPulling value
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleNativeTouchMove = (e: TouchEvent) => {
      // 🔧 FIX v11: Read from REFS, not state (avoids stale closure)
      if (!isPullingRef.current || isRefreshingRef.current) return;
      
      const currentTouchY = e.touches[0].clientY;
      const diff = currentTouchY - startY.current;
      
      // Check scroll position
      const scrollParent = scrollParentRef.current || container;
      const scrollTop = scrollParent?.scrollTop ?? 0;
      
      if (diff > 0 && scrollTop <= 1) {
        // User is pulling DOWN while at top - PULL-TO-REFRESH gesture
        // CRITICAL: Prevent browser from handling this as scroll/overscroll
        e.preventDefault();
        e.stopPropagation();
        
        const resistance = 0.5;
        const newPull = Math.min(diff * resistance, MAX_PULL);
        setPullDistance(newPull);
        currentY.current = currentTouchY;
        console.log('[MissionSync] Pulling:', newPull.toFixed(1), 'px');
      } else if (diff < -10) {
        // User is scrolling DOWN (to see more content) - cancel pull, let browser handle
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
      }
    };
    
    // CRITICAL: { passive: false } allows preventDefault() to work on iOS
    // 🔧 FIX v11: Add listener ONCE (no deps), use refs for current values
    container.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    
    return () => {
      container.removeEventListener('touchmove', handleNativeTouchMove);
    };
  }, []); // 🔧 FIX v11: Empty deps - listener added once, refs provide current values

  // 🔧 FIX v4 (22/01/2026): Aggressive iOS safety reset - multiple triggers
  useEffect(() => {
    const forceResetState = () => {
      console.log('[MissionSync] ⚠️ Force reset triggered');
      setPullDistance(0);
      setIsPulling(false);
    };

    // Reset on visibility change (tab switch, app background)
    const handleVisibilityChange = () => {
      if (document.hidden) forceResetState();
    };

    // Reset on window blur (keyboard, other UI)
    const handleBlur = () => forceResetState();
    
    // 🔧 NEW: Reset on pagehide (iOS app going to background)
    const handlePageHide = () => forceResetState();
    
    // 🔧 NEW: Reset on pointercancel (iOS gesture interruption)
    const handlePointerCancel = () => forceResetState();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, []);

  // 🔧 FIX v11: React touchStart handles initial detection + sets ref
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollParent = scrollParentRef.current || containerRef.current;
    const scrollTop = scrollParent?.scrollTop ?? 0;
    
    if (scrollTop <= 1 && !isRefreshingRef.current) {
      startY.current = e.touches[0].clientY;
      // 🔧 FIX v11: Set BOTH ref and state for immediate availability
      isPullingRef.current = true;
      setIsPulling(true);
      console.log('[MissionSync] Touch start - ready for pull (first try should work!)');
    }
  }, []); // No deps needed - uses refs

  // TouchMove is handled by native listener (for proper preventDefault)
  const handleTouchMove = useCallback(() => {
    // Native listener handles this with { passive: false }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    // 🔧 FIX v11: Check ref for immediate value
    if (!isPullingRef.current) return;
    
    // Reset both ref and state
    isPullingRef.current = false;
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshingRef.current) {
      // Trigger refresh
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setPullDistance(60); // Hold at indicator position
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('[MissionSync] Refresh error:', error);
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Release without refresh
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  // 🔧 FIX: Handle touchcancel (iOS interrupts)
  const handleTouchCancel = useCallback(() => {
    console.log('[MissionSync] Touch cancelled, resetting state');
    // 🔧 FIX v11: Reset both ref and state
    isPullingRef.current = false;
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  // 🔧 FIX v4 (22/01/2026): Aggressive watchdog - reset transform after 500ms if not actively pulling
  useEffect(() => {
    if (pullDistance > 0 && !isRefreshing && !isPulling) {
      // Short timeout - if we have pullDistance but no active pull, something is wrong
      const watchdog = setTimeout(() => {
        console.warn('[MissionSync] ⚠️ Watchdog: Resetting stuck transform (500ms)');
        setPullDistance(0);
      }, 500);
      return () => clearTimeout(watchdog);
    }
  }, [pullDistance, isRefreshing, isPulling]);
  
  // 🔧 FIX v4: Micro-watchdog - immediate RAF reset check
  useEffect(() => {
    if (!isPulling && !isRefreshing && pullDistance > 0) {
      // Use RAF to ensure we're not in mid-animation
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isPulling && !isRefreshing && pullDistance > 0) {
            console.warn('[MissionSync] ⚠️ RAF micro-watchdog: Resetting stale transform');
            setPullDistance(0);
          }
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isPulling, isRefreshing, pullDistance]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  // 🔧 FIX v10: Determine touchAction based on pull state ONLY
  // We only block browser touch when actively pulling down (pullDistance > 0)
  // This way user can still scroll down when at top
  const shouldBlockBrowserTouch = isPulling && pullDistance > 0;
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ 
        // 🔧 FIX v10: Block browser touch ONLY when actively pulling
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
            {/* M1 Logo - Solo logo, nessun testo */}
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

      {/* Content with pull offset - 🔧 FIX 22/01/2026: Improved iOS safety */}
      {/* Using conditional rendering with key to force re-mount and clear stale transforms */}
      {(pullDistance > 0 || isRefreshing) ? (
        <motion.div
          key="pull-content"
          initial={{ y: 0 }}
          animate={{ y: pullDistance }}
          exit={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ 
            willChange: isPulling ? 'transform' : 'auto',
            // 🔧 FIX: Clear transform explicitly when not pulling
            transform: !isPulling && pullDistance === 0 ? 'none' : undefined,
          }}
          onAnimationComplete={() => {
            // 🔧 FIX: Ensure transform is cleared when animation ends at 0
            if (pullDistance === 0 && !isRefreshing) {
              console.log('[MissionSync] Animation complete, transform cleared');
            }
          }}
        >
          {children}
        </motion.div>
      ) : (
        // No transform wrapper when idle - prevents iOS stacking context issues
        // data-idle-content triggers CSS reset in ios-native.css
        <div key="idle-content" data-idle-content="true">{children}</div>
      )}
    </div>
  );
};

export default MissionSync;


