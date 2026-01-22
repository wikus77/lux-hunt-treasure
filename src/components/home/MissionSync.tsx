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
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  // 🔧 FIX v9: Find scroll parent on mount
  useEffect(() => {
    scrollParentRef.current = findScrollParent(containerRef.current);
    console.log('[MissionSync] Scroll parent found:', scrollParentRef.current?.tagName);
  }, []);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 🔧 FIX v9: Check scroll position on the ACTUAL scroll container (parent <main>)
    const scrollParent = scrollParentRef.current || containerRef.current;
    const scrollTop = scrollParent?.scrollTop ?? 0;
    
    // Only start pull if at top of scroll
    if (scrollTop <= 1) { // Allow 1px tolerance
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
      console.log('[MissionSync] Pull started, scrollTop:', scrollTop);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    // 🔧 FIX v9: Check scroll position on the ACTUAL scroll container
    const scrollParent = scrollParentRef.current || containerRef.current;
    const scrollTop = scrollParent?.scrollTop ?? 0;
    
    if (diff > 0 && scrollTop <= 1) { // Allow 1px tolerance
      // Apply resistance curve
      const resistance = 0.5;
      const newPull = Math.min(diff * resistance, MAX_PULL);
      setPullDistance(newPull);
      
      // Prevent default scroll when pulling
      if (newPull > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(60); // Hold at indicator position
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('[MissionSync] Refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Release without refresh
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  // 🔧 FIX: Handle touchcancel (iOS interrupts)
  const handleTouchCancel = useCallback(() => {
    console.log('[MissionSync] Touch cancelled, resetting state');
    setIsPulling(false);
    // 🔧 FIX 22/01/2026: ALWAYS reset pullDistance on cancel to prevent stuck transform
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: isPulling && pullDistance > 10 ? 'none' : 'auto' }}
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


